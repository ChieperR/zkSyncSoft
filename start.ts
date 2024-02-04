import {privateKeyConvert, readWallets} from "./utils/wallet"
import {random, shuffle, sleep,} from "./utils/common"
import { generalConfig } from "./config"
import {Hex} from "viem";
import {Syncswap} from "./modules/syncswap";
import {privateKeyToAccount} from "viem/accounts";
import {makeLogger} from "./utils/logger";
import {Muteio} from "./modules/muteio";
import {Maverick} from "./modules/maverick";
import {Pancake} from "./modules/pancake";
import {L2Telegraph} from "./modules/l2telegraph";
import {Dmail} from "./modules/dmail";
import {Odos} from "./modules/odos";
import {Openocean} from "./modules/openocean";

let privateKeysTmp = readWallets('./private_keys.txt')
shuffle(privateKeysTmp)

let privateKeys = privateKeysTmp.slice(0, random(generalConfig.accountsPerRun[0], generalConfig.accountsPerRun[1])).map(privateKeyConvert)


const accountWork = async (privateKey: Hex, logger: any) => {
    const txForRun = random(generalConfig.maxTxPerRun[0], generalConfig.maxTxPerRun[1])
    const sleepTimeBeforeStart = random(generalConfig.sleepBeforeWallet[0], generalConfig.sleepBeforeWallet[1])
    const walletAddress = privateKeyToAccount(privateKey).address

    logger.info(`Waiting ${sleepTimeBeforeStart} sec before wallet ${walletAddress} work will start and make ${txForRun} transactions`)
    await sleep(sleepTimeBeforeStart * 1000)

    for (let i = 0; i < txForRun; i++) {
        const sleepTime = random(generalConfig.sleepBetweenTx[0], generalConfig.sleepBetweenTx[1])
        const numberOfModules = generalConfig.modules.length
        const module = generalConfig.modules[random(0, numberOfModules - 1)]

        switch (module) {
            case 'syncswap':
                const syncswap = await Syncswap(privateKey)
                await syncswap.roundSwap()
                break
            case 'muteio':
                const muteio = await Muteio(privateKey)
                await muteio.roundSwap()
                break
            case 'maverick':
                const maverick = await Maverick(privateKey)
                await maverick.roundSwap() // Only USDC
                break
            case 'pancake':
                const pancake = await Pancake(privateKey)
                await pancake.roundSwap()
                break
            case 'odos':
                const odos = await Odos(privateKey)
                await odos.roundSwap()
                break
            case 'openocean':
                const openocean = await Openocean(privateKey)
                await openocean.roundSwap()
                break
            case 'l2telegraphMsg':
                const l2telegraphMsg = await L2Telegraph(privateKey)
                await l2telegraphMsg.sendMessage()
                break
            case 'l2telegraphNft':
                const l2telegraphNft = await L2Telegraph(privateKey)
                await l2telegraphNft.mintAndBridge()
                break
            case 'dmail':
                const dmail = await Dmail(privateKey)
                await dmail.sendMail()
                break
        }

        if (i === txForRun - 1) {
            logger.warn(`${walletAddress} done all ${txForRun} transactions`)
        } else {
            logger.info(`${walletAddress} | Waiting ${sleepTime} sec until next tx...`)
            await sleep(sleepTime * 1000)
        }
    }
}

const start = async () => {
    const logger = makeLogger("ChieperSoft")

    for (let privateKey of privateKeys) {
        accountWork(privateKey, logger)
    }
}

await start()