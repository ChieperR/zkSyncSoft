import {
    encodeAbiParameters, formatEther, formatUnits,
    getContract, Hex,
    parseAbiParameters,
} from 'viem'
import { syncswapFactoryAbi } from "../data/abi/syncswap_factory"
import {syncswapRouterAbi} from "../data/abi/syncswap_router";
import {getZksyncPublicClient, getZksyncWalletClient} from "../utils/clients/zksyncClient";
import {waitGas} from "../utils/getCurrentGas";
import {makeLogger} from "../utils/logger";
import {isBalanceError} from "../utils/checkBalance";
import {random, sleep} from "../utils/common";
import {getTokenBalance} from "../utils/tokenBalance";
import {addresses, decimals} from "../data/zksync-contract-addresses";
import {approve} from "../utils/approve";
import {generalConfig} from "../config";
import {chooseRandomStable} from "../utils/chooseRandomStable";
import {tokens} from "../utils/types"
import {syncswapClassicPoolAbi} from "../data/abi/syncswap_classicpool";
import {checkMinAmountOut} from "../utils/getEthPrice";

export const Syncswap = async (privateKey: Hex) => {
    const logger = makeLogger('Syncswap')
    const zksyncClient = getZksyncPublicClient()
    const zksyncWallet = getZksyncWalletClient(privateKey)
    const walletAddress = zksyncWallet.account.address

    const syncswapFactoryContract = getContract({
        address: '0xf2DAd89f2788a8CD54625C60b55cD3d2D0ACa7Cb',
        abi: syncswapFactoryAbi,
        client: zksyncClient
    })

    const syncswapRouterContract = getContract({
        address: '0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295',
        abi: syncswapRouterAbi,
        client: zksyncWallet
    })

    const getSwapPaths = async (fromToken: Hex, toToken: Hex, amountIn = 0n) => {
        const poolAddress: Hex = await syncswapFactoryContract.read.getPool([fromToken, toToken]) as Hex
        const swapData = encodeAbiParameters(
            parseAbiParameters("address, address, uint8"),
            [fromToken, walletAddress, 1], // last is withdrawMode
        )

        const steps = [{
            pool: poolAddress,
            data: swapData,
            callback: addresses.zeroAddress, // we don't have a callback
            callbackData: '0x',
        }];

            const paths = [{
                steps: steps,
                tokenIn: fromToken == addresses.WETH ? addresses.zeroAddress : fromToken, // Native ETH address is ZERO_ADDRESS
                amountIn,
            }];

            return paths
    }

    const getMinAmountOut = async (amountIn: bigint, fromToken: Hex, toToken: Hex) => {
        const poolAddress: Hex = await syncswapFactoryContract.read.getPool([fromToken, toToken]) as Hex

        const syncswapClassicPoolContract = getContract({
            address: poolAddress,
            abi: syncswapClassicPoolAbi,
            client: zksyncClient
        })

        const minAmountOut = await syncswapClassicPoolContract.read.getAmountOut([
            fromToken,
            amountIn,
            walletAddress,
        ]) as bigint

        return BigInt(Math.round(Number(minAmountOut) * (1 - generalConfig.slippage / 100)))
    }

    const swapEthToToken = async (uintValue: bigint, toToken: tokens = 'USDC') => {
        await waitGas()
        let isSuccess = false
        let retryCount = 1

        const value = formatEther(uintValue)

        logger.info(`${walletAddress} | Swap ${value} ETH -> ${toToken}`)

        while (!isSuccess) {
            try {
                const paths = await getSwapPaths(addresses.WETH, addresses[toToken], uintValue)
                const deadline = BigInt(Math.floor(Date.now() / 1000)) + BigInt(1800);
                const minAmountOut = await getMinAmountOut(uintValue, addresses.WETH, addresses[toToken])
                await checkMinAmountOut(value, false, +formatUnits(minAmountOut, decimals[toToken]))

                const txHash = await syncswapRouterContract.write.swap([
                    paths,
                    minAmountOut,
                    deadline,
                ], {
                    value: uintValue
                })

                isSuccess = true
                logger.info(`${walletAddress} | Success swap ${value} ETH -> ${toToken}: https://explorer.zksync.io/tx/${txHash}`)
            } catch (e) {
                if (isBalanceError(e)) {
                    logger.error(`${walletAddress} | Not enough balance`)
                    isSuccess = true
                    return
                } else {
                    logger.error(`${walletAddress} | Try to increase slippage. Error: ${e}`)
                }

                if (retryCount <= 3) {
                    logger.warn(`${walletAddress} | Wait 30 sec and retry swap ${retryCount}/3`)
                    retryCount++
                    await sleep(30 * 1000)
                } else {
                    isSuccess = true
                    logger.error(`${walletAddress} | Swap unsuccessful, skip`)
                }
            }
        }
    }

    const swapTokenToEth = async (fromToken: tokens = 'USDC') => {
        await waitGas()
        let uintValue = await getTokenBalance(zksyncClient, addresses[fromToken], walletAddress)
        let value = formatUnits(uintValue, decimals[fromToken])
        let isSuccess = false
        let retryCount = 1

        logger.info(`${walletAddress} | Swap ${value} ${fromToken} -> ETH`)

        while (!isSuccess) {
            try {
                const paths = await getSwapPaths(addresses[fromToken], addresses.WETH, uintValue)
                const deadline = BigInt(Math.floor(Date.now() / 1000)) + BigInt(1800);
                const minAmountOut = await getMinAmountOut(uintValue, addresses[fromToken], addresses.WETH)
                await checkMinAmountOut(value, true, +formatEther(minAmountOut))

                await approve(zksyncWallet, zksyncClient, addresses[fromToken], syncswapRouterContract.address, uintValue, logger)

                const txHash = await syncswapRouterContract.write.swap([
                    paths,
                    minAmountOut,
                    deadline,
                ])

                isSuccess = true
                logger.info(`${walletAddress} | Success swap ${value} ${fromToken} -> ETH: https://explorer.zksync.io/tx/${txHash}`)
            } catch (e) {
                if (isBalanceError(e)) {
                    logger.error(`${walletAddress} | Not enough balance`)
                    isSuccess = true
                    return
                } else {
                    logger.error(`${walletAddress} | Try to increase slippage. Error: ${e}`)
                }

                if (retryCount <= 3) {
                    logger.warn(`${walletAddress} | Wait 30 sec and retry swap ${retryCount}/3`)
                    retryCount++
                    await sleep(30 * 1000)
                } else {
                    isSuccess = true
                    logger.error(`${walletAddress} | Swap unsuccessful, skip`)
                }
            }
        }
    }

    const roundSwap = async () => {
        const randomPercent: number = random(generalConfig.swapEthPercent[0], generalConfig.swapEthPercent[1]) / 100
        const ethBalance: bigint = await zksyncClient.getBalance({ address: walletAddress })
        if (ethBalance !== BigInt(0)) {
            const randomStable = chooseRandomStable()
            let amount: bigint = BigInt(Math.round(Number(ethBalance) * randomPercent))
            const sleepTimeTo = random(generalConfig.sleepBeforeSwapBack[0], generalConfig.sleepBeforeSwapBack[1])

            await swapEthToToken(amount, randomStable)

            logger.info(`${walletAddress} | Waiting ${sleepTimeTo} sec until swap back...`)
            await sleep(sleepTimeTo * 1000)

            await swapTokenToEth(randomStable)
        } else logger.error(`${walletAddress} | Wallet have zero balance...`)
    }

    return { roundSwap }
}