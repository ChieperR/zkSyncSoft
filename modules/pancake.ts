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
import {addresses, decimals, pancakeContracts} from "../data/zksync-contract-addresses";
import {approve} from "../utils/approve";
import {generalConfig} from "../config";
import {tokens} from "../utils/types"
import {pancakeRouterAbi} from "../data/abi/pancake_router";
import {pancakeQuouterAbi} from "../data/abi/pancake_quoter";
import {chooseRandomStable} from "../utils/chooseRandomStable";

export const Pancake = async (privateKey: Hex) => {
    const logger = makeLogger('PancakeSwap')
    const zksyncClient = getZksyncPublicClient()
    const zksyncWallet = getZksyncWalletClient(privateKey)
    const walletAddress = zksyncWallet.account.address

    const pancakeRouterContract = getContract({
        address: pancakeContracts.router,
        abi: pancakeRouterAbi,
        client: zksyncWallet
    })

    const pancakeQuoterContract = getContract({
        address: pancakeContracts.quoter,
        abi: pancakeQuouterAbi,
        client: zksyncClient
    })

    const getMinAmountOut = async (amountIn: bigint, fromToken: Hex, toToken: Hex) => {
        const minAmountOut = await pancakeQuoterContract.read.quoteExactInputSingle([[
            fromToken,
            toToken,
            amountIn,
            toToken == addresses.USDC ? 100 : 500, // fee
            BigInt(0) // sqrtPriceLimitX96
        ]]) as any[]

        return BigInt(Math.round(Number(minAmountOut[0]) * (1 - generalConfig.slippage / 100)))
    }

    const swapEthToToken = async (uintValue: bigint, toToken: tokens = 'USDC') => {
        await waitGas()
        let isSuccess = false
        let retryCount = 1

        const value = formatEther(uintValue)

        logger.info(`${walletAddress} | Swap ${value} ETH -> ${toToken}`)

        while (!isSuccess) {
            try {
                const deadline = BigInt(Math.floor(Date.now() / 1000)) + BigInt(1800);
                const minAmountOut = await getMinAmountOut(uintValue, addresses.WETH, addresses[toToken])
                await checkMinAmountOut(value, false, +formatUnits(minAmountOut, decimals[toToken]))

                const txData = encodeFunctionData({
                    abi: pancakeRouterAbi,
                    functionName: 'exactInputSingle',
                    args: [[
                        addresses.WETH,
                        addresses[toToken],
                        toToken == 'USDC' ? 100 : 500,
                        walletAddress,
                        uintValue,
                        minAmountOut,
                        BigInt(0)
                    ]]
                })

                const txHash = await pancakeRouterContract.write.multicall([
                    deadline,
                    [txData]
                ], {
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

        logger.info(`${walletAddress} | Swap ${value} ${fromToken} -> ETH`)

        while (!isSuccess) {
            try {
                if (uintValue == BigInt(0)) throw new Error(`insufficient balance of ${fromToken} token`);
                const deadline = BigInt(Math.floor(Date.now() / 1000)) + BigInt(1800);
                const minAmountOut = await getMinAmountOut(uintValue, addresses[fromToken], addresses.WETH)
                await checkMinAmountOut(value, true, +formatEther(minAmountOut))

                const txData = encodeFunctionData({
                    abi: pancakeRouterAbi,
                    functionName: 'exactInputSingle',
                    args: [[
                        addresses[fromToken],
                        addresses.WETH,
                        fromToken == 'USDC' ? 100 : 500,
                        '0x0000000000000000000000000000000000000002',
                        uintValue,
                        minAmountOut,
                        BigInt(0)
                    ]]
                })

                const unwrapData = encodeFunctionData({
                    abi: pancakeRouterAbi,
                    functionName: 'unwrapWETH9',
                    args: [
                        minAmountOut,
                        walletAddress
                    ]
                })

                await approve(zksyncWallet, zksyncClient, addresses[fromToken], pancakeRouterContract.address, uintValue, logger)

                const txHash = await pancakeRouterContract.write.multicall([
                    deadline,
                    [txData, unwrapData]
                ])

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