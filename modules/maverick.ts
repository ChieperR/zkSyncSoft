import {
    encodeFunctionData,
    formatEther, formatUnits,
    getContract, Hex,
} from 'viem'
import {checkMinAmountOut} from "../utils/getEthPrice";
import {getZksyncPublicClient, getZksyncWalletClient} from "../utils/clients/zksyncClient";
import {waitGas} from "../utils/getCurrentGas";
import {makeLogger} from "../utils/logger";
import {isBalanceError} from "../utils/checkBalance";
import {random, sleep} from "../utils/common";
import {getTokenBalance} from "../utils/tokenBalance";
import {addresses, decimals, maverickContracts} from "../data/zksync-contract-addresses";
import {approve} from "../utils/approve";
import {generalConfig} from "../config";
import {tokens} from "../utils/types"
import {maverickRouterAbi} from "../data/abi/maverick_router";
import {maverickPoolInformationAbi} from "../data/abi/maverick_position";

export const Maverick = async (privateKey: Hex) => {
    const logger = makeLogger('Maverick')
    const zksyncClient = getZksyncPublicClient()
    const zksyncWallet = getZksyncWalletClient(privateKey)
    const walletAddress = zksyncWallet.account.address

    const maverickRouterContract = getContract({
        address: maverickContracts.router,
        abi: maverickRouterAbi,
        client: zksyncWallet
    })

    const maverickPoolInformationContract = getContract({
        address: maverickContracts.poolInformation,
        abi: maverickPoolInformationAbi,
        client: zksyncClient
    })

    const getSwapPath = (fromToken: Hex, toToken: Hex) => {
        const pathData = [
            fromToken,
            maverickContracts.USDCToETHPool,
            toToken,
        ]

        return pathData.reduce((acc: string, address) => {
            return acc + address.slice(2)
        }, '0x') as Hex
    }

    const getMinAmountOut = async (amountIn: bigint, isToToken: boolean) => {
        const minAmountOut = await maverickPoolInformationContract.read.calculateSwap([
            maverickContracts.USDCToETHPool,
            amountIn,
            isToToken,
            true,
            0
        ]) as bigint

        return BigInt(Math.round(Number(minAmountOut) * (1 - generalConfig.slippage / 100)))
    }

    const swapEthToToken = async (uintValue: bigint, toToken: tokens = 'USDC') => {
        await waitGas()
        let isSuccess = false
        let retryCount = 1

        const value = formatEther(uintValue)
        const swapPath = getSwapPath(addresses.WETH, addresses[toToken])

        logger.info(`${walletAddress} | Swap ${value} ETH -> ${toToken}`)

        while (!isSuccess) {
            try {
                const deadline = BigInt(Math.floor(Date.now() / 1000)) + BigInt(1800);
                const minAmountOut = await getMinAmountOut(uintValue, true)
                await checkMinAmountOut(value, false, +formatUnits(minAmountOut, decimals[toToken]))

                const swapData = encodeFunctionData({
                    abi: maverickRouterAbi,
                    functionName: 'exactInput',
                    args: [[
                        swapPath,
                        walletAddress,
                        deadline,
                        uintValue,
                        minAmountOut
                    ]]
                })

                const refundData = encodeFunctionData({
                    abi: maverickRouterAbi,
                    functionName: 'refundETH'
                })

                const txHash = await maverickRouterContract.write.multicall([[
                    swapData,
                    refundData
                ]], {
                    value: uintValue
                })

                logger.info(`${walletAddress} | Success swap ${value} ETH -> ${toToken}: https://explorer.zksync.io/tx/${txHash}`)
                isSuccess = true
            } catch (e) {
                if (isBalanceError(e)) {
                    logger.error(`${walletAddress} | Not enough balance`)
                    isSuccess = true
                    return
                } else {
                    logger.error(`${walletAddress} | ${e}`)
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

        const swapPath = getSwapPath(addresses[fromToken], addresses.WETH)

        logger.info(`${walletAddress} | Swap ${value} ${fromToken} -> ETH`)

        while (!isSuccess) {
            try {
                if (uintValue == BigInt(0)) throw new Error(`insufficient balance of ${fromToken} token`);

                await approve(zksyncWallet, zksyncClient, addresses[fromToken], maverickRouterContract.address, uintValue, logger)

                const deadline = BigInt(Math.floor(Date.now() / 1000)) + BigInt(1800);
                const minAmountOut = await getMinAmountOut(uintValue, false)
                await checkMinAmountOut(value, true, +formatEther(minAmountOut))

                const swapData = encodeFunctionData({
                    abi: maverickRouterAbi,
                    functionName: 'exactInput',
                    args: [[
                        swapPath,
                        addresses.zeroAddress,
                        deadline,
                        uintValue,
                        minAmountOut
                    ]]
                })

                const unwrapData = encodeFunctionData({
                    abi: maverickRouterAbi,
                    functionName: 'unwrapWETH9',
                    args: [
                        minAmountOut,
                        walletAddress
                    ]
                })

                const txHash = await maverickRouterContract.write.multicall([[
                    swapData,
                    unwrapData
                ]])

                logger.info(`${walletAddress} | Success swap ${value} ${fromToken} -> ETH: https://explorer.zksync.io/tx/${txHash}`)
                isSuccess = true
            } catch (e) {
                if (isBalanceError(e)) {
                    logger.error(`${walletAddress} | Not enough balance`)
                    isSuccess = true
                    return
                } else {
                    logger.error(`${walletAddress} | Error: ${e}`)
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
        // const randomStable = chooseRandomStable() // There are no random stable because of small LP
        if (ethBalance !== BigInt(0)) {
            let amount: bigint = BigInt(Math.round(Number(ethBalance) * randomPercent))
            const sleepTimeTo = random(generalConfig.sleepBeforeSwapBack[0], generalConfig.sleepBeforeSwapBack[1])

            await swapEthToToken(amount, 'USDC')

            logger.info(`${walletAddress} | Waiting ${sleepTimeTo} sec until swap back...`)
            await sleep(sleepTimeTo * 1000)

            await swapTokenToEth('USDC')
        } else logger.error(`${walletAddress} | Wallet have zero balance...`)

    }

    return { roundSwap }
}