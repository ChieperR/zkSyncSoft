import {encodeFunctionData, formatEther, formatUnits, getContract, Hex,} from 'viem'
import {checkMinAmountOut} from "../utils/getEthPrice";
import {getZksyncPublicClient, getZksyncWalletClient} from "../utils/clients/zksyncClient";
import {waitGas} from "../utils/getCurrentGas";
import {makeLogger} from "../utils/logger";
import {isBalanceError} from "../utils/checkBalance";
import {random, sleep} from "../utils/common";
import {getTokenBalance} from "../utils/tokenBalance";
import {addresses, decimals, izumiContracts} from "../data/zksync-contract-addresses";
import {approve} from "../utils/approve";
import {generalConfig} from "../config";
import {tokens} from "../utils/types"
import {izumiSwapAbi} from "../data/abi/izumi_swap";
import {izumiQuoterAbi} from "../data/abi/izumi_quoter";
import {chooseRandomStable} from "../utils/chooseRandomStable";

export const Izumi = async (privateKey: Hex) => {
    const logger = makeLogger('Izumi   ')
    const zksyncClient = getZksyncPublicClient()
    const zksyncWallet = getZksyncWalletClient(privateKey)
    const walletAddress = zksyncWallet.account.address

    const izumiSwapContract = getContract({
        address: izumiContracts.swap,
        abi: izumiSwapAbi,
        client: zksyncWallet
    })

    const izumiQuoterContract = getContract({
        address: izumiContracts.quoter,
        abi: izumiQuoterAbi,
        client: zksyncClient
    })

    const getSwapPath = (fromToken: Hex, toToken: Hex) => {
        let pathData = []
        if (fromToken !== addresses.USDT && toToken !== addresses.USDT) {
            pathData = [
                fromToken,
                '0x000190',
                toToken,
            ]
        } else {
            pathData = [
                fromToken,
                '0x000190',
                addresses.USDC,
                '0x000190',
                toToken,
            ]
        }


        return pathData.reduce((acc: string, address) => {
            return acc + address.slice(2)
        }, '0x') as Hex
    }

    const getMinAmountOut = async (amountIn: bigint, path: Hex) => {
        const minAmountOut = await izumiQuoterContract.read.swapAmount([
            amountIn,
            path,
        ]) as [bigint, number[]]

        return BigInt(Math.round(Number(minAmountOut[0]) * (1 - generalConfig.slippage / 100)))
    }

    const swapEthToToken = async (uintValue: bigint, toToken: tokens = 'USDC') => {
        await waitGas()
        let isSuccess = false
        let retryCount = 1

        const value = formatEther(uintValue)
        const swapPath = getSwapPath(addresses.WETH, addresses[toToken])
        console.log(swapPath)

        logger.info(`${walletAddress} | Swap ${value} ETH -> ${toToken}`)

        while (!isSuccess) {
            try {
                const deadline = BigInt(Math.floor(Date.now() / 1000)) + BigInt(1800);
                const minAmountOut = await getMinAmountOut(uintValue, swapPath)
                await checkMinAmountOut(value, false, +formatUnits(minAmountOut, decimals[toToken]))

                const swapData = encodeFunctionData({
                    abi: izumiSwapAbi,
                    functionName: 'swapAmount',
                    args: [[
                        swapPath,
                        walletAddress,
                        uintValue,
                        minAmountOut,
                        deadline,
                    ]]
                })

                const refundData = encodeFunctionData({
                    abi: izumiSwapAbi,
                    functionName: 'refundETH'
                })

                const txHash = await izumiSwapContract.write.multicall([[
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

                await approve(zksyncWallet, zksyncClient, addresses[fromToken], izumiSwapContract.address, uintValue, logger)

                const deadline = BigInt(Math.floor(Date.now() / 1000)) + BigInt(1800);
                const minAmountOut = await getMinAmountOut(uintValue, swapPath)
                await checkMinAmountOut(value, true, +formatEther(minAmountOut))

                const swapData = encodeFunctionData({
                    abi: izumiSwapAbi,
                    functionName: 'swapAmount',
                    args: [[
                        swapPath,
                        addresses.zeroAddress,
                        uintValue,
                        minAmountOut,
                        deadline,
                    ]]
                })

                const unwrapData = encodeFunctionData({
                    abi: izumiSwapAbi,
                    functionName: 'unwrapWETH9',
                    args: [
                        minAmountOut,
                        walletAddress
                    ]
                })

                const txHash = await izumiSwapContract.write.multicall([[
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
        const randomStable = chooseRandomStable(2)
        if (ethBalance !== 0n) {
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