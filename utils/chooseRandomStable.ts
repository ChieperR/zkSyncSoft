import {random} from "./common";
import {tokens} from "./types";

export const chooseRandomStable = (howManyStables: number = 3): tokens => {
    const randomNumber = random(1, howManyStables)

    switch (randomNumber) {
        case 1:
            return 'USDC'
        case 2:
            return 'USDT'
        case 3:
            return 'DAI'
        default:
            return 'USDC'
    }
}