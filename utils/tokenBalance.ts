import { Hex } from "viem"
import { erc20Abi } from "../data/abi/erc20"

export const getTokenBalance = async (client: any, tokenAddress: Hex, address: Hex): Promise<bigint> => {

    const balance = await client.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [
            address
        ]
    })

    return balance
}