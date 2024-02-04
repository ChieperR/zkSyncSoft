import { Hex } from "viem"
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

    const increasedAmount = BigInt(Number(amount) * 3)
    
    if (allowance < amount) {
        const txHash = await walletClient.writeContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'approve',
            args: [
                contractAddress,
                increasedAmount
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