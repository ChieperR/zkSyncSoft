import {
    formatEther, formatUnits,
    getContract, Hex, parseEther,
} from 'viem'
import {checkMinAmountOut, getMinAmountOut} from "../utils/getEthPrice";
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
import {muteioRouterAbi} from "../data/abi/muteio_router";
import {tokens} from "../utils/types"
import {Dmail} from "./dmail";

export const Muteio = async (privateKey: Hex) => {
    const logger = makeLogger('Mute.io ')
    const zksyncClient = getZksyncPublicClient()
    const zksyncWallet = getZksyncWalletClient(privateKey)
    const walletAddress = zksyncWallet.account.address

    const muteioRouterContract = getContract({
        address: '0x8B791913eB07C32779a16750e3868aA8495F5964',
        abi: muteioRouterAbi,
        client: zksyncWallet
    })

    const getSwapPath = (fromToken: Hex, toToken: Hex) => {
        switch (fromToken == addresses.WETH ? toToken : fromToken) {
            case addresses.USDC:
            case addresses.USDT:
                return [fromToken, toToken]
            case addresses.DAI:
                return [fromToken, addresses.USDC, toToken]
            default:
                return [fromToken, toToken]
        }
    }

    const getMinAmountOutAndStableParameter = async (amountIn: bigint, path: Hex[]) => {
        const response = await muteioRouterContract.read.getAmountsOutExpanded([
            amountIn,
            path
        ]) as [bigint[], boolean[], bigint[]]

        const amountOut = response[0][response[0].length - 1]
        const minAmountOut = BigInt(Math.round(Number(amountOut) * (1 - generalConfig.slippage / 100)))
        const stableParameter = response[1]

        return {minAmountOut, stableParameter}
    }

    const swapEthToToken = async (uintValue: bigint, toToken: tokens = 'USDC') => {
        await waitGas()
        let isSuccess = false
        let retryCount = 1

        const value = formatEther(uintValue)
        let swapPath = getSwapPath(addresses.WETH, addresses[toToken])

        logger.info(`${walletAddress} | Swap ${value} ETH -> ${toToken}`)

        while (!isSuccess) {
            try {
                const deadline = BigInt(Math.floor(Date.now() / 1000)) + BigInt(1800);
                const {minAmountOut, stableParameter} = await getMinAmountOutAndStableParameter(uintValue, swapPath)

                await checkMinAmountOut(value, false, +formatUnits(minAmountOut, decimals[toToken]))

                const txHash = await muteioRouterContract.write.swapExactETHForTokens([
                    minAmountOut,
                    swapPath,
                    walletAddress,
                    deadline,
                    stableParameter
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

        const swapPath = getSwapPath(addresses[fromToken], addresses.WETH)

        logger.info(`${walletAddress} | Swap ${value} ${fromToken} -> ETH`)

        while (!isSuccess) {
            try {
                const deadline = BigInt(Math.floor(Date.now() / 1000)) + BigInt(1800);
                const {minAmountOut, stableParameter} = await getMinAmountOutAndStableParameter(uintValue, swapPath)
                await checkMinAmountOut(value, true, +formatEther(minAmountOut))

                await approve(zksyncWallet, zksyncClient, addresses[fromToken], muteioRouterContract.address, uintValue, logger)

                const txHash = await muteioRouterContract.write.swapExactTokensForETH([
                    uintValue,
                    minAmountOut,
                    swapPath,
                    walletAddress,
                    deadline,
                    stableParameter
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
            const randomStable = chooseRandomStable()
            let amount: bigint = BigInt(Math.round(Number(ethBalance) * randomPercent))
            const sleepTimeTo = random(generalConfig.sleepBeforeSwapBack[0], generalConfig.sleepBeforeSwapBack[1])

            await swapEthToToken(amount, randomStable)

            logger.info(`${walletAddress} | Waiting ${sleepTimeTo} sec until swap back...`)
            await sleep(sleepTimeTo * 1000)

            await swapTokenToEth(randomStable)
        } else logger.error(`${walletAddress} | Wallet have zero balance...`)
    }

    return {roundSwap}
}