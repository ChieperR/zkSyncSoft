import { formatGwei } from "viem"
import { getPublicEthClient } from "./clients/ethClient"
import { generalConfig } from "../config"
import { makeLogger } from "./logger"
import { sleep } from "./common"

export async function getCurrentGas() {
    const client = getPublicEthClient()
    const gas = await client.getGasPrice()

    return parseFloat(formatGwei(gas))
}

export async function waitGas(type: string = 'regular') {
    let maxGas = generalConfig.maxGas
    
    const logger = makeLogger("Gas checker")
    let isGoodGas = false
    while (!isGoodGas) {
        try {
            const currentGas = await getCurrentGas()
            if (currentGas > maxGas) {
                logger.info(`Wait for gas ${maxGas}. Current gas: ${currentGas.toFixed(1)}`)
                await sleep(30 * 1000)
            } else {
                return true
            }
        } catch (e) {
            logger.error(`Error ${e.toString()}`)
        }
    }
}