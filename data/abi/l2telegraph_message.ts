export const l2telegraphMsgAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_endpoint",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "cost",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "endpoint",
        "outputs": [
            {
                "internalType": "contract ILayerZeroEndpoint",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint16",
                "name": "_dstChainId",
                "type": "uint16"
            },
            {
                "internalType": "address",
                "name": "_userApplication",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "_payload",
                "type": "bytes"
            },
            {
                "internalType": "bool",
                "name": "_payInZRO",
                "type": "bool"
            },
            {
                "internalType": "bytes",
                "name": "_adapterParams",
                "type": "bytes"
            }
        ],
        "name": "estimateFees",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "nativeFee",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "zroFee",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "lastMessage",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint16",
                "name": "_dstChainId",
                "type": "uint16"
            },
            {
                "internalType": "bytes",
                "name": "_from",
                "type": "bytes"
            },
            {
                "internalType": "uint64",
                "name": "",
                "type": "uint64"
            },
            {
                "internalType": "bytes",
                "name": "_payload",
                "type": "bytes"
            }
        ],
        "name": "lzReceive",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "message",
                "type": "string"
            },
            {
                "internalType": "uint16",
                "name": "destChainId",
                "type": "uint16"
            },
            {
                "internalType": "bytes",
                "name": "_destination",
                "type": "bytes"
            }
        ],
        "name": "sendMessage",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_newCost",
                "type": "uint256"
            }
        ],
        "name": "setCost",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
]