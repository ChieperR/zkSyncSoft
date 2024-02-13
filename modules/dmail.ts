import {
    getContract, Hex, toBytes,
} from 'viem'
import {getZksyncWalletClient} from "../utils/clients/zksyncClient";
import {waitGas} from "../utils/getCurrentGas";
import {makeLogger} from "../utils/logger";
import {isBalanceError} from "../utils/checkBalance";
import {random, sleep} from "../utils/common";
import {dmailContractAddress,} from "../data/zksync-contract-addresses";
import {dmailAbi} from "../data/abi/dmail";
import {generate} from "random-words";
import { sha256 } from 'viem'

export const Dmail = async (privateKey: Hex) => {
    const logger = makeLogger('Dmail   ')
    const zksyncWallet = getZksyncWalletClient(privateKey)
    const walletAddress = zksyncWallet.account.address

    const dmailContract = getContract({
        address: dmailContractAddress,
        abi: dmailAbi,
        client: {
            wallet: zksyncWallet
        }
    })

    const generateEmail = () => {
        const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com']
        return `${generate()}${random(1, 2000)}@${domains[random(0, 3)]}`
    }

    const generateSentence = () => {
        return generate({
            minLength: 2,
            min: 2,
            max: 8,
            join: " ",
        })
    }

    const sendMail = async () => {
        await waitGas()
        let isSuccess = false
        let retryCount = 1

        logger.info(`${walletAddress} | Sending mail`)

        while (!isSuccess) {
            try {
                const email = sha256(toBytes(generateEmail())).slice(2)
                const message = sha256(toBytes(generateSentence())).slice(2)

                const txHash = await dmailContract.write.send_mail([
                    message,
                    email
                ])

                logger.info(`${walletAddress} | Success mail: https://explorer.zksync.io/tx/${txHash}`)
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
                    logger.warn(`${walletAddress} | Wait 30 sec and retry mail ${retryCount}/3`)
                    retryCount++
                    await sleep(30 * 1000)
                } else {
                    isSuccess = true
                    logger.error(`${walletAddress} | Mail unsuccessful, skip`)
                }
            }
        }
    }

    return { sendMail }
}