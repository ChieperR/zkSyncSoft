import {Hex, hexToBigInt} from "viem"
import { erc20Abi } from "../data/abi/erc20"
import {random, sleep} from "./common";
import {generalConfig} from "../config";
const { sleepAfterApprove} = generalConfig

const checkAllowance = async (client: any, tokenAddress: Hex, contractAddress: Hex, walletAddress: Hex) => {
    const allowance = await client.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [
            walletAddress,
            contractAddress
        ]
    })

    return allowance
}

export const approve = async (walletClient: any, client: any, tokenAddress: Hex, contractAddress: Hex, amount: bigint, logger: any) => {
    const allowance = await checkAllowance(client, tokenAddress, contractAddress, walletClient.account.address)

    let approvingAmount = amount

    switch (generalConfig.approveMode) {
        case 1:
            approvingAmount = amount
            break
        case 2:
            approvingAmount = BigInt(Number(amount) * 3)
            break
        case 3:
            approvingAmount = hexToBigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
            break
        default:
            logger.warn(`There are no ${generalConfig.approveMode} approveMode. Please select 1 or 2 or 3`)
    }
    
    if (allowance < amount) {
        const txHash = await walletClient.writeContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'approve',
            args: [
                contractAddress,
                approvingAmount
            ]
        })
        
        logger.info(`${walletClient.account.address} | Success approve: https://explorer.zksync.io/tx/${txHash}`)

        const sleepTime = random(sleepAfterApprove[0], sleepAfterApprove[1])
        logger.info(`${walletClient.account.address} | Waiting ${sleepTime} sec after approve before swap...`)
        await sleep(sleepTime * 1000)
        return true
    } else {
        logger.info(`${walletClient.account.address} | Already approved`)
        return false
    }
}