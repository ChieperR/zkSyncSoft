import {formatEther, formatUnits, Hex} from 'viem'
import {getZksyncPublicClient, getZksyncWalletClient} from "../utils/clients/zksyncClient";
import {waitGas} from "../utils/getCurrentGas";
import {makeLogger} from "../utils/logger";
import {isBalanceError} from "../utils/checkBalance";
import {random, sleep} from "../utils/common";
import {addresses, decimals, inchRouterContract} from "../data/zksync-contract-addresses";
import {generalConfig} from "../config";
import {tokens} from "../utils/types"
import axios from "axios";
import {getTokenBalance} from "../utils/tokenBalance";
import {approve} from "../utils/approve";
import {chooseRandomStable} from "../utils/chooseRandomStable";
import {getProxy} from "../utils/getProxy";

export const Inch = async (privateKey: Hex) => {
    const logger = makeLogger('1inch   ')
    const zksyncClient = getZksyncPublicClient()
    const zksyncWallet = getZksyncWalletClient(privateKey)
    const walletAddress = zksyncWallet.account.address
    let httpsAgent = getProxy()

    const quote = async (fromToken: Hex, toToken: Hex, amount: bigint) => {
        const config = {
            headers: {
                "Authorization": `Bearer ${generalConfig.inchApiKey}`
            },
            params: {
                "src": fromToken,
                "dst": toToken,
                "amount": `${amount}`,
                "from": walletAddress,
                "slippage": `${generalConfig.slippage}`,
            },
            httpsAgent,
        }

        const response = await axios.get('https://api.1inch.dev/swap/v5.2/324/swap', config)

        return response.data.tx
    }

    const swapEthToToken = async (uintValue: bigint, toToken: tokens = 'USDC') => {
        await waitGas()
        let isSuccess = false
        let retryCount = 1

        const value = formatEther(uintValue)

        logger.info(`${walletAddress} | Swap ${value} ETH -> ${toToken}`)

        while (!isSuccess) {
            try {
                const txData = await quote(addresses.nativeToken, addresses[toToken], uintValue)
                txData.value = parseInt(txData.value)
                txData.gasPrice = parseInt(txData.gasPrice)

                const txHash = await zksyncWallet.sendTransaction(txData)

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

        logger.info(`${walletAddress} | Swap ${value} ${fromToken} -> ETH`)

        while (!isSuccess) {
            try {
                if (uintValue == BigInt(0)) throw new Error(`insufficient balance of ${fromToken} token`);

                await approve(zksyncWallet, zksyncClient, addresses[fromToken], inchRouterContract, uintValue, logger)

                const txData = await quote(addresses[fromToken], addresses.nativeToken, uintValue)
                txData.value = parseInt(txData.value)
                txData.gasPrice = parseInt(txData.gasPrice)

                const txHash = await zksyncWallet.sendTransaction(txData)

                const receipt = await zksyncClient.waitForTransactionReceipt({
                    hash: txHash
                })

                if (receipt.status !== 'reverted') {
                    logger.info(`${walletAddress} | Success swap ${value} ${fromToken} -> ETH: https://explorer.zksync.io/tx/${txHash}`)
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

    const roundSwap = async () => {
        if (!generalConfig.inchApiKey) return
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