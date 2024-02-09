import {Hex} from "viem";
import {contractsList} from "../utils/types";

export const addresses: contractsList = {
    zeroAddress: '0x0000000000000000000000000000000000000000',
    nativeToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    WETH: '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91',
    USDC: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
    USDT: '0x493257fD37EDB34451f62EDf8D2a0C418852bA4C',
    DAI: '0x4b9eb6c0b6ea15176bbf62841c6b2a8a398cb656',
}

export const decimals: {
    USDC: number,
    USDT: number,
    DAI: number,
} = {
    USDC: 6,
    USDT: 6,
    DAI: 18,
}

export const maverickContracts: contractsList = {
    router: '0x39E098A153Ad69834a9Dac32f0FCa92066aD03f4',
    poolInformation: '0x57D47F505EdaA8Ae1eFD807A860A79A28bE06449',
    USDCToETHPool: '0x41C8cf74c27554A8972d3bf3D2BD4a14D8B604AB',
}

export const pancakeContracts: contractsList = {
    router: '0xf8b59f3c3Ab33200ec80a8A58b2aA5F5D2a8944C',
    quoter: '0x3d146FcE6c1006857750cBe8aF44f76a28041CCc',
}

export const spacefiRouterContractAddress = '0xbE7D1FD1f6748bbDefC4fbaCafBb11C6Fc506d1d'

export const l2telegraphContracts: contractsList = {
    message: '0x0D4a6D5964F3b618d8e46BCfBF2792b0D769fBDa',
    nft: '0xD43A183C97dB9174962607A8b6552CE320eAc5aA',
}

export const l2telegraphMsgDestContracts: {
    [key: number]: Hex
} = {
    102: '0x2f4572C09D6bE78F9adc18FE26fB298546eEf58e', // bnb
    106: '0x811bcF49225ffE8039989a30cf5C03f60660753d', // avalanche
    109: '0x523d5581A0bb8BB2Bc9f23B5202894E31124eA3e', // polygon
    110: '0x479e97FdE57A70bcC85e861EDB71bB613600d55a', // arbitrum
    111: '0xa5B72e35E35d219c3274Cee227FbE4D317915E0C', // optimism
    112: '0xf268D9232Ef928FD2b861a4eC8A7b4195B9e47a7', // fantom
    150: '0xDC60fd9d2A4ccF97f292969580874De69E6c326E', // klaytn
    158: '0x1e3F506a665995727456f24e8CcbC4Cab0077Bad', // polygon zkevm
    159: '0x5B10aE182C297ec76fE6fe0E3Da7c4797ceDE02D', // canto
    173: '0x36a358b3Ba1FB368E35b71ea40c7f4Ab89bFd8e1', // tenet
    175: '0x5F26EA1E4D47071a4d9A2c2611C2ae0665d64b6d', // arb nova
    176: '0x46A9f7E1DB25A3c9CFEF6F2635033a9b6E9548dF', // meter
    177: '0x3Aef52924De5638652c525569373A3D94E0b202f', // kava
    181: '0xDC60fd9d2A4ccF97f292969580874De69E6c326E', // mantle
    183: '0x7599d1275831c9fc63f9a27a3c67fe0c8fc19a47', // linea
    184: '0x64e0F6164ac110b67Df9A4848707fFbcB86C87a9', // base
    199: '0xDC60fd9d2A4ccF97f292969580874De69E6c326E', // telos
    202: '0xDC60fd9d2A4ccF97f292969580874De69E6c326E', // opbnb
    210: '0xDC60fd9d2A4ccF97f292969580874De69E6c326E', // astar
    212: '0xDC60fd9d2A4ccF97f292969580874De69E6c326E', // conflux
    214: '0x9F63DBdF90837384872828d1Ed6Eb424A7F7f939', // scroll
}

export const l2telegraphNftDestContracts: {
    [key: number]: Hex
} = {
    102: '0xc162cf8c4c6697ab8e613ce0cd37c0ab97ba5a60', // bnb
    106: '0x9539c9f145d2bf0eb7ed0824fe8583cd62410d3e', // avalanche
    109: '0xf9e15dd2a618bf1c0cf60f544a80f8ec774c6813', // polygon
    110: '0x80be0f5b780e093b3f53bd5df8d1cf09aabf690f', // arbitrum
    111: '0x64e0f6164ac110b67df9a4848707ffbcb86c87a9', // optimism
    112: '0x80be0f5b780e093b3f53bd5df8d1cf09aabf690f', // fantom
    158: '0xdc60fd9d2a4ccf97f292969580874de69e6c326e', // polygon zkevm
    175: '0x5b10ae182c297ec76fe6fe0e3da7c4797cede02d', // arb nova
    176: '0x1a77bb02fba60251dccc1611e7321d7cf6f1feef', // meter
    183: '0xdc60fd9d2a4ccf97f292969580874de69e6c326e', // linea
    184: '0x36a358b3ba1fb368e35b71ea40c7f4ab89bfd8e1', // base
    202: '0x64e0f6164ac110b67df9a4848707ffbcb86c87a9', // opbnb
    212: '0x36a358b3ba1fb368e35b71ea40c7f4ab89bfd8e1', // conflux
}

export const dmailContractAddress = '0x981F198286E40F9979274E0876636E9144B8FB8E'

export const openoceanContractAddress = '0x36A1aCbbCAfca2468b85011DDD16E7Cb4d673230'

export const odosRouterContract = '0x4bBa932E9792A2b917D47830C93a9BC79320E4f7'

export const inchRouterContract = '0x6e2B76966cbD9cF4cC2Fa0D76d24d5241E0ABC2F'