import {
    Chain,
    createPublicClient,
    createWalletClient, defineChain,
    Hex,
    http,
    HttpTransport,
    PrivateKeyAccount, publicActions, PublicClient,
    WalletClient
} from "viem"
import {privateKeyToAccount} from "viem/accounts"
import {rpc} from "../../rpc_config"

export const zkSync = /*#__PURE__*/ defineChain({
    id: 324,
    name: 'Zksync',
    network: 'zksync',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: {
            http: [rpc['ZkSync']],
            webSocket: ['wss://mainnet.era.zksync.io/ws'],
        },
        public: {
            http: [rpc['ZkSync']],
            webSocket: ['wss://mainnet.era.zksync.io/ws'],
        },
    },
    blockExplorers: {
        default: {
            name: 'zkExplorer',
            url: 'https://explorer.zksync.io',
        },
    },
    contracts: {
        multicall3: {
            address: '0xF9cda624FBC7e059355ce98a31693d299FACd963',
        },
    },
})

function getZksyncPublicClient(): PublicClient {
    return createPublicClient(
        {chain: zkSync,
            transport: http()
        })
}

function getZksyncWalletClient(privateKey: Hex): WalletClient<HttpTransport, Chain, PrivateKeyAccount> {
    return createWalletClient({
        chain: zkSync,
        account: privateKeyToAccount(privateKey),
        transport: http()
    }).extend(publicActions)
}

export {getZksyncPublicClient, getZksyncWalletClient}