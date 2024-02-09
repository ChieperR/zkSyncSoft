import {
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
import {addresses, decimals, spacefiRouterContractAddress} from "../data/zksync-contract-addresses";
import {approve} from "../utils/approve";
import {generalConfig} from "../config";
import {chooseRandomStable} from "../utils/chooseRandomStable";
import {tokens} from "../utils/types"
import {spacefiRouterAbi} from "../data/abi/spacefi_router";

export const Spacefi = async (privateKey: Hex) => {
    const logger = makeLogger('SpaceFi ')
    const zksyncClient = getZksyncPublicClient()
    const zksyncWallet = getZksyncWalletClient(privateKey)
    const walletAddress = zksyncWallet.account.address

    const spacefiRouterContract = getContract({
        address: spacefiRouterContractAddress,
        abi: spacefiRouterAbi,
        client: zksyncWallet
    })

    const getMinAmountOut = async (amountIn: bigint, path: Hex[]) => {
        const response = await spacefiRouterContract.read.getAmountsOut([
            amountIn,
            path
        ]) as [bigint, bigint]

        const amountOut = response[1]
        const minAmountOut = BigInt(Math.round(Number(amountOut) * (1 - generalConfig.slippage / 100)))

        return minAmountOut
    }

    const swapEthToToken = async (uintValue: bigint, toToken: tokens = 'USDC') => {
        await waitGas()
        let isSuccess = false
        let retryCount = 1

        const value = formatEther(uintValue)
        const swapPath = [addresses.WETH, addresses[toToken]]

        logger.info(`${walletAddress} | Swap ${value} ETH -> ${toToken}`)

        while (!isSuccess) {
            try {
                const deadline = BigInt(Math.floor(Date.now() / 1000)) + BigInt(1800);
                const minAmountOut = await getMinAmountOut(uintValue, swapPath)

                await checkMinAmountOut(value, false, +formatUnits(minAmountOut, decimals[toToken]))

                const txHash = await spacefiRouterContract.write.swapExactETHForTokens([
                    minAmountOut,
                    swapPath,
                    walletAddress,
                    deadline,
                ], {
                    value: uintValue
                })

                const receipt = await zksyncClient.waitForTransactionReceipt({
                    hash: txHash
                })

                if (receipt.status !== 'reverted') {
                    logger.info(`${walletAddress} | Success swap ${value} ETH -> ${toToken}: https://explorer.zksync.io/tx/${txHash}`)
                    isSuccess = true
                } else {
                    throw new Error('Not enough liquidity in the pool')
                }
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

    const swapTokenToEth = async (fromToken: tokens = 'USDC') => {
        await waitGas()
        let uintValue = await getTokenBalance(zksyncClient, addresses[fromToken], walletAddress)
        let value = formatUnits(uintValue, decimals[fromToken])
        let isSuccess = false
        let retryCount = 1

        const swapPath = [addresses[fromToken], addresses.WETH]

        logger.info(`${walletAddress} | Swap ${value} ${fromToken} -> ETH`)

        while (!isSuccess) {
            try {
                if (uintValue == BigInt(0)) throw new Error(`insufficient balance of ${fromToken} token`);
                const deadline = BigInt(Math.floor(Date.now() / 1000)) + BigInt(1800);

                await approve(zksyncWallet, zksyncClient, addresses[fromToken], spacefiRouterContract.address, uintValue, logger)

                const minAmountOut = await getMinAmountOut(uintValue, swapPath)
                await checkMinAmountOut(value, true, +formatEther(minAmountOut))

                const txHash = await spacefiRouterContract.write.swapExactTokensForETH([
                    uintValue,
                    minAmountOut,
                    swapPath,
                    walletAddress,
                    deadline,
                ])

                logger.info(`${walletAddress} | Success swap ${value} ${fromToken} -> ETH: https://explorer.zksync.io/tx/${txHash}`)
                isSuccess = true
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
        const ethBalance: bigint = await zksyncClient.getBalance({address: walletAddress})
        if (ethBalance !== BigInt(0)) {
            const randomStable = chooseRandomStable(2)
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