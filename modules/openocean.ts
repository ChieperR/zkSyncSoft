import {formatEther, formatGwei, formatUnits, Hex, parseEther} from 'viem'
import {getZksyncPublicClient, getZksyncWalletClient} from "../utils/clients/zksyncClient";
import {waitGas} from "../utils/getCurrentGas";
import {makeLogger} from "../utils/logger";
import {isBalanceError} from "../utils/checkBalance";
import {random, randomFloat, sleep} from "../utils/common";
import {addresses, decimals, openoceanContractAddress} from "../data/zksync-contract-addresses";
import {generalConfig} from "../config";
import {tokens} from "../utils/types"
import axios from "axios";
import {getTokenBalance} from "../utils/tokenBalance";
import {approve} from "../utils/approve";
import {chooseRandomStable} from "../utils/chooseRandomStable";

export const Openocean = async (privateKey: Hex) => {
    const logger = makeLogger('Openocean')
    const zksyncClient = getZksyncPublicClient()
    const zksyncWallet = getZksyncWalletClient(privateKey)
    const walletAddress = zksyncWallet.account.address

    const getTransactionData = async (fromToken: Hex, toToken: Hex, amount: number) => {
        const gasPrice = formatGwei(await zksyncClient.getGasPrice())

        let params: any = {
            inTokenAddress: fromToken,
            outTokenAddress: toToken,
            amount,
            gasPrice,
            slippage: generalConfig.slippage,
            account: walletAddress
        }

        const response = await axios.get('https://open-api.openocean.finance/v3/324/swap_quote', {
            params: params
        })

        return response.data.data
    }

    const swapEthToToken = async (uintValue: bigint, toToken: tokens = 'USDC') => {
        await waitGas()
        let isSuccess = false
        let retryCount = 1

        const value = formatEther(uintValue)

        logger.info(`${walletAddress} | Swap ${value} ETH -> ${toToken}`)

        while (!isSuccess) {
            try {
                const txData = await getTransactionData(addresses.zeroAddress, addresses[toToken], +value)
                txData.value = parseInt(txData.value)
                txData.gasPrice = await zksyncClient.getGasPrice()

                const txHash = await zksyncWallet.sendTransaction(txData)

                logger.info(`${walletAddress} | Success swap ${value} ETH -> ${toToken}: https://explorer.zksync.io/tx/${txHash}`)
                isSuccess = true
            } catch (e) {
                if (isBalanceError(e)) {
                    logger.error(`${walletAddress} | Not enough balance`)
                    isSuccess = true
                    return
                } else {
                    logger.error(`${walletAddress} | ${e.shortMessage}`)
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

                await approve(zksyncWallet, zksyncClient, addresses[fromToken], openoceanContractAddress, uintValue, logger)

                const txData = await getTransactionData(addresses[fromToken], addresses.zeroAddress, +value)
                txData.value = parseInt(txData.value)
                txData.gasPrice = await zksyncClient.getGasPrice()

                const txHash = await zksyncWallet.sendTransaction(txData)

                logger.info(`${walletAddress} | Success swap ${value} ${fromToken} -> ETH: https://explorer.zksync.io/tx/${txHash}`)
                isSuccess = true
            } catch (e) {
                if (isBalanceError(e)) {
                    logger.error(`${walletAddress} | Not enough balance`)
                    isSuccess = true
                    return
                } else {
                    logger.error(`${walletAddress} | ${e.shortMessage}`)
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
        const randomStable = chooseRandomStable()
        if (ethBalance !== BigInt(0)) {
            const amount: bigint = BigInt(Math.round(Number(ethBalance) * randomPercent))
            const sleepTimeTo = random(generalConfig.sleepBeforeSwapBack[0], generalConfig.sleepBeforeSwapBack[1])

            await swapEthToToken(amount, randomStable)

            logger.info(`${walletAddress} | Waiting ${sleepTimeTo} sec until swap back...`)
            await sleep(sleepTimeTo * 1000)

            await swapTokenToEth(randomStable)
        } else logger.error(`${walletAddress} | Wallet have zero balance...`)
    }

    return { roundSwap }
}