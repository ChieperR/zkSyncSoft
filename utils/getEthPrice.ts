// @ts-ignore
import {Spot} from '@binance/connector'
import {generalConfig} from "../config";

export const getEthPrice = async () => {
    const binanceClient = new Spot('', '')
    try {
        const response = await binanceClient.avgPrice('ETHUSDC');
        return response.data.price
    } catch (error) {
        console.error('Binance error', error);
        throw error;
    }
}

export const getMinAmountOut = async (amount: number | string, isFromToken = false) => {
    const ethPrice = await getEthPrice()

    const AmountOut = isFromToken ? +amount / ethPrice : ethPrice * +amount

    const minToAmount = AmountOut * (1 - generalConfig.slippage / 100)

    return minToAmount
}

export const checkMinAmountOut = async (amount: number | string, isFromToken = false, contractMinAmountOut: number) => {
    const binanceAmountOut = await getMinAmountOut(amount, isFromToken)
    const binanceMinAmountOut = binanceAmountOut * (1 - generalConfig.slippage / 100)

    if (binanceMinAmountOut > contractMinAmountOut) {
        throw new Error(`Based on your slippage, BinanceMinAmountOut = ${binanceMinAmountOut}, but contract can provide only ${contractMinAmountOut}`)
    }
}