# ZkSync Soft

It is a software for automate interacting with the zkSync blockchain and DeFi products in it

## Install
`npm install`

Add private keys in `private_keys.txt`

Run `npm start`

Settings in `config.ts`

## Modules

* SyncSwap
* Mute.io
* Maverick
* Pancake
* iZUMi (iZiSwap)
* Space.fi
* Zkswap
* Odos
* 1inch
* Openocean
* Dmail
* L2Telegraph Message
* L2Telegraph Mint and Bridge

## Features

* Asynchronous/Multi-threading. All accounts run together, with a randomized delayed start time
* Two modes of operation. Random modules or custom modules
* Three modes of token approvals. Exact amount, x3 of amount or infinite amount.
* Tight script customization in config.ts
* All dexes swap ETH -> Stable (USDC/USDT/DAI) -> ETH.
* Configured different possible stables for different dexes based on liquidity
* Use of proxies in swap aggregators (Odos, openocean, 1inch)
* Gas limitation on ETH. Current gas is checked before each transaction
* Dense logging of all actions in the console + log file
* In L2Telegraph source chain is selected randomly from all possible chains, based on your L0 commission limit
* Anti-slippage protection. Slippage is configured in config, the price in the protocol is compared to the price on the Binance. If the price on the Binance with the slippage is higher, the transaction is canceled

## Settings

1. Enter all privates in private_keys.txt
2. It is recommended, but not necessary to add at least several proxies in proxies.txt, odos sometimes bans by IP. Proxies such as http://login:password@ip:port
3. configure config.ts. Everything is described in detail inside
4. `npm start`