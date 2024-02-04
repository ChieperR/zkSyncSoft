import {Hex} from "viem";

export type tokens = 'USDC' | 'USDT' | 'DAI'

export type contractsList = {
    [key: string]: Hex
}