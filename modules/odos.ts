import {formatEther, formatUnits, Hex, parseEther} from 'viem'
import {getZksyncPublicClient, getZksyncWalletClient} from "../utils/clients/zksyncClient";
import {waitGas} from "../utils/getCurrentGas";
import {makeLogger} from "../utils/logger";
import {isBalanceError} from "../utils/checkBalance";
import {random, sleep} from "../utils/common";
import {addresses, decimals, odosRouterContract} from "../data/zksync-contract-addresses";
import {generalConfig} from "../config";
import {tokens} from "../utils/types"
import axios from "axios";
import {getTokenBalance} from "../utils/tokenBalance";
import {approve} from "../utils/approve";
import {chooseRandomStable} from "../utils/chooseRandomStable";
import {getProxy} from "../utils/getProxy";

export const Odos = async (privateKey: Hex) => {
    const logger = makeLogger('Odos    ')
    const zksyncClient = getZksyncPublicClient()
    const zksyncWallet = getZksyncWalletClient(privateKey)
    const walletAddress = zksyncWallet.account.address
    let httpsAgent = getProxy()

    const quote = async (fromToken: Hex, toToken: Hex, amount: bigint) => {
        const response = await axios.post('https://api.odos.xyz/sor/quote/v2', {
            chainId: 324,
            inputTokens: [
                {
                    tokenAddress: fromToken,
                    amount: `${amount}`
                }
            ],
            outputTokens: [
                {
                    tokenAddress: toToken,
                    proportion: 1
                }
            ],
            userAddr: walletAddress,
            referralCode: generalConfig.odosRefCode == '' ? 0 : generalConfig.odosRefCode,
            compact: true,
            slippageLimitPercent: generalConfig.slippage
        }, {
            httpsAgent
        })

        return response.data.pathId
    }

    const assemble = async (pathId: any) => {
        const response = await axios.post('https://api.odos.xyz/sor/assemble', {
            userAddr: walletAddress,
            pathId: pathId,
            simulate: true,
        }, {
            httpsAgent
        })

        const simulation = response.data.simulation

        if (!simulation.isSuccess && !simulation?.simulationError?.errorMessage.includes('insufficient allowance')) {
            throw new Error(simulation.simulationError.errorMessage)
        }

        return response.data.transaction
    }

    const swapEthToToken = async (uintValue: bigint, toToken: tokens = 'USDC') => {
        await waitGas()
        let isSuccess = false
        let retryCount = 1

        const value = formatEther(uintValue)

        logger.info(`${walletAddress} | Swap ${value} ETH -> ${toToken}`)

        while (!isSuccess) {
            try {
                const quoteData = await quote(addresses.zeroAddress, addresses[toToken], uintValue)
                const txData = await assemble(quoteData)
                txData.value = parseInt(txData.value)

                const txHash = await zksyncWallet.sendTransaction(txData)

                logger.info(`${walletAddress} | Success swap ${value} ETH -> ${toToken}: https://explorer.zksync.io/tx/${txHash}`)
                isSuccess = true
            } catch (e) {
                if (e.response?.status === 403) {
                    logger.error(`Your IP is BLOCKED on Odos. Please use proxy or remove Odos from modules list`)
                    return
                }
                if (isBalanceError(e)) {
                    logger.error(`${walletAddress} | Not enough balance`)
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

                await approve(zksyncWallet, zksyncClient, addresses[fromToken], odosRouterContract, uintValue, logger)

                const quoteData = await quote(addresses[fromToken], addresses.zeroAddress, uintValue)
                const txData = await assemble(quoteData)
                txData.value = parseInt(txData.value)

                const txHash = await zksyncWallet.sendTransaction(txData)

                logger.info(`${walletAddress} | Success swap ${value} ${fromToken} -> ETH: https://explorer.zksync.io/tx/${txHash}`)
                isSuccess = true
            } catch (e) {
                if (e.response?.status === 403) {
                    logger.error(`Your IP is BLOCKED on Odos. Please use proxy or remove Odos from modules list`)
                    return
                }
                if (isBalanceError(e)) {
                    logger.error(`${walletAddress} | Not enough balance`)
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
        const randomPercent: number = random(generalConfig.swapEthPercent[0], generalConfig.swapEthPercent[1]) / 100
        const ethBalance: bigint = await zksyncClient.getBalance({ address: walletAddress })
        const randomStable = chooseRandomStable()
        if (ethBalance !== BigInt(0)) {
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