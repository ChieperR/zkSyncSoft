import {encodePacked, getContract, Hex, parseEther,} from 'viem'
import {getZksyncPublicClient, getZksyncWalletClient} from "../utils/clients/zksyncClient";
import {waitGas} from "../utils/getCurrentGas";
import {makeLogger} from "../utils/logger";
import {isBalanceError} from "../utils/checkBalance";
import {random, sleep} from "../utils/common";
import {
    l2telegraphContracts,
    l2telegraphMsgDestContracts,
    l2telegraphNftDestContracts,
} from "../data/zksync-contract-addresses";
import {generalConfig} from "../config";
import {l2telegraphMsgAbi} from "../data/abi/l2telegraph_message";
import {l2telegraphNftAbi} from "../data/abi/l2telegraph_nft";
import {generate} from "random-words";

export const L2Telegraph = async (privateKey: Hex) => {
    const logger = makeLogger('L2Telegraph')
    const zksyncClient = getZksyncPublicClient()
    const zksyncWallet = getZksyncWalletClient(privateKey)
    const walletAddress = zksyncWallet.account.address

    const l2telegraphMessageContract = getContract({
        address: l2telegraphContracts.message,
        abi: l2telegraphMsgAbi,
        client: zksyncWallet
    })

    const l2telegraphNftContract = getContract({
        address: l2telegraphContracts.nft,
        abi: l2telegraphNftAbi,
        client: zksyncWallet
    })

    const estimateFees = async (destChainId: number) => {
        const txValue = await zksyncClient.readContract({
            address: l2telegraphContracts.message,
            abi: l2telegraphMsgAbi,
            functionName: 'estimateFees',
            args: [
                destChainId,
                walletAddress,
                '0x',
                false,
                '0x',
            ]
        }) as [bigint, bigint]

        return BigInt(Math.round(Number(txValue[0]) * 1.2))
    }

    const chooseRandomDestNetwork = async (isNftBridge: boolean = false) => {
        const possibleNetworks: number[] = []
        const l2telegraphFee = BigInt(parseEther('0.00025'))
        logger.info(`Calculating possible destination networks based on your maxLzFee...`)

        for (let chainId in (isNftBridge ? l2telegraphNftDestContracts : l2telegraphMsgDestContracts)) {
            const fees = await estimateFees(+chainId) + (isNftBridge ? 0n : l2telegraphFee)

            if (fees < parseEther(generalConfig.maxLzFee)) {
                possibleNetworks.push(+chainId)
            }
        }

        const randomNetwork = possibleNetworks[random(0, possibleNetworks.length - 1)]

        logger.info(`Network with chainID ${randomNetwork} was chosen`)

        return randomNetwork
    }

    const sendMessage = async () => {
        await waitGas()
        let isSuccess = false
        let retryCount = 1

        logger.info(`${walletAddress} | Sending Message`)

        const destChainId = await chooseRandomDestNetwork(false)
        const value = await estimateFees(destChainId) + BigInt(parseEther('0.00025'))
        const randomWords = generate({
            minLength: 2,
            min: 2,
            max: 5,
            join: " ",
        })

        while (!isSuccess) {
            try {
                const trustedRemote = encodePacked(
                    ['address', 'address'],
                    [l2telegraphMsgDestContracts[destChainId], l2telegraphContracts.message as Hex]
                )

                const txHash = await l2telegraphMessageContract.write.sendMessage([
                    randomWords,
                    destChainId,
                    trustedRemote
                ], {
                    value
                })

                logger.info(`${walletAddress} | Success sending message: https://explorer.zksync.io/tx/${txHash}`)
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
                    logger.warn(`${walletAddress} | Wait 30 sec and retry message ${retryCount}/3`)
                    retryCount++
                    await sleep(30 * 1000)
                } else {
                    isSuccess = true
                    logger.error(`${walletAddress} | Message unsuccessful, skip`)
                }
            }
        }
    }

    const mint = async () => {
        await waitGas()
        let isSuccess = false
        let retryCount = 1

        logger.info(`${walletAddress} | Mint NFT`)

        while (!isSuccess) {
            try {
                const txHash = await l2telegraphNftContract.write.mint([], {
                    value: parseEther('0.0005')
                })

                logger.info(`${walletAddress} | Success mint: https://explorer.zksync.io/tx/${txHash}`)
                isSuccess = true
                return txHash
            } catch (e) {
                if (isBalanceError(e)) {
                    logger.error(`${walletAddress} | Not enough balance`)
                    isSuccess = true
                    return
                } else {
                    logger.error(`${walletAddress} | ${e}`)
                }

                if (retryCount <= 3) {
                    logger.warn(`${walletAddress} | Wait 30 sec and retry mint ${retryCount}/3`)
                    retryCount++
                    await sleep(30 * 1000)
                } else {
                    isSuccess = true
                    logger.error(`${walletAddress} | Mint unsuccessful, skip`)
                }
            }
        }
    }

    const mintAndBridge = async () => {
        await waitGas()
        let isSuccess = false
        let retryCount = 1

        logger.info(`${walletAddress} | Mint and bridging NFT`)

        const txMintHash = await mint()
        const destChainId = await chooseRandomDestNetwork(true)

        if (txMintHash != undefined) {
            const sleepTime = random(generalConfig.sleepAfterApprove[0], generalConfig.sleepAfterApprove[1])
            logger.info(`${walletAddress} | Waiting ${sleepTime} sec after mint and before bridge...`)
            await sleep(sleepTime * 1000)

            while (!isSuccess) {
                try {
                    const trustedRemote = encodePacked(
                        ['address', 'address'],
                        [l2telegraphNftDestContracts[destChainId], l2telegraphContracts.nft as Hex]
                    )

                    const receipt = await zksyncClient.waitForTransactionReceipt({
                        hash: txMintHash
                    })

                    const approriateLog = receipt.logs[receipt.logs.length - 2]

                    let tokenId = parseInt(approriateLog.topics[approriateLog.topics.length - 1], 16)

                    const value = await estimateFees(destChainId)

                    const txHash = await l2telegraphNftContract.write.crossChain([
                        destChainId,
                        trustedRemote,
                        tokenId
                    ], {
                        value
                    })

                    logger.info(`${walletAddress} | Success bridging NFT: https://explorer.zksync.io/tx/${txHash}`)
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
                        logger.warn(`${walletAddress} | Wait 30 sec and retry bridging NFT ${retryCount}/3`)
                        retryCount++
                        await sleep(30 * 1000)
                    } else {
                        isSuccess = true
                        logger.error(`${walletAddress} | Message unsuccessful, skip`)
                    }
                }
            }
        }
    }

    return { sendMessage, mintAndBridge }
}