export const dmailAbi = [
    {
        "name": null,
        "type": "constructor",
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "gas": null,
        "_isFragment": true
    },
    {
        "name": "AdminChanged",
        "anonymous": false,
        "inputs": [
            {
                "name": "previousAdmin",
                "type": "address",
                "indexed": false,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            },
            {
                "name": "newAdmin",
                "type": "address",
                "indexed": false,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            }
        ],
        "type": "event",
        "_isFragment": true
    },
    {
        "name": "Approval",
        "anonymous": false,
        "inputs": [
            {
                "name": "owner",
                "type": "address",
                "indexed": true,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            },
            {
                "name": "spender",
                "type": "address",
                "indexed": true,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            },
            {
                "name": "value",
                "type": "uint256",
                "indexed": false,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "uint256",
                "_isParamType": true
            }
        ],
        "type": "event",
        "_isFragment": true
    },
    {
        "name": "BeaconUpgraded",
        "anonymous": false,
        "inputs": [
            {
                "name": "beacon",
                "type": "address",
                "indexed": true,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            }
        ],
        "type": "event",
        "_isFragment": true
    },
    {
        "name": "Initialized",
        "anonymous": false,
        "inputs": [
            {
                "name": "version",
                "type": "uint8",
                "indexed": false,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "uint8",
                "_isParamType": true
            }
        ],
        "type": "event",
        "_isFragment": true
    },
    {
        "name": "Message",
        "anonymous": false,
        "inputs": [
            {
                "name": "subject",
                "type": "string",
                "indexed": true,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "string",
                "_isParamType": true
            },
            {
                "name": "from_address",
                "type": "address",
                "indexed": true,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            },
            {
                "name": "to",
                "type": "string",
                "indexed": true,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "string",
                "_isParamType": true
            }
        ],
        "type": "event",
        "_isFragment": true
    },
    {
        "name": "OwnershipTransferred",
        "anonymous": false,
        "inputs": [
            {
                "name": "previousOwner",
                "type": "address",
                "indexed": true,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            },
            {
                "name": "newOwner",
                "type": "address",
                "indexed": true,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            }
        ],
        "type": "event",
        "_isFragment": true
    },
    {
        "name": "Paused",
        "anonymous": false,
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "indexed": false,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            }
        ],
        "type": "event",
        "_isFragment": true
    },
    {
        "name": "Transfer",
        "anonymous": false,
        "inputs": [
            {
                "name": "from",
                "type": "address",
                "indexed": true,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            },
            {
                "name": "to",
                "type": "address",
                "indexed": true,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            },
            {
                "name": "value",
                "type": "uint256",
                "indexed": false,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "uint256",
                "_isParamType": true
            }
        ],
        "type": "event",
        "_isFragment": true
    },
    {
        "name": "Unpaused",
        "anonymous": false,
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "indexed": false,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            }
        ],
        "type": "event",
        "_isFragment": true
    },
    {
        "name": "Upgraded",
        "anonymous": false,
        "inputs": [
            {
                "name": "implementation",
                "type": "address",
                "indexed": true,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            }
        ],
        "type": "event",
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "allowance",
        "constant": true,
        "inputs": [
            {
                "name": "owner",
                "type": "address",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            },
            {
                "name": "spender",
                "type": "address",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            }
        ],
        "outputs": [
            {
                "name": null,
                "type": "uint256",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "uint256",
                "_isParamType": true
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "gas": null,
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "approve",
        "constant": false,
        "inputs": [
            {
                "name": "spender",
                "type": "address",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "uint256",
                "_isParamType": true
            }
        ],
        "outputs": [
            {
                "name": null,
                "type": "bool",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "bool",
                "_isParamType": true
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "gas": null,
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "balanceOf",
        "constant": true,
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            }
        ],
        "outputs": [
            {
                "name": null,
                "type": "uint256",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "uint256",
                "_isParamType": true
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "gas": null,
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "burn",
        "constant": false,
        "inputs": [
            {
                "name": "amount",
                "type": "uint256",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "uint256",
                "_isParamType": true
            }
        ],
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "gas": null,
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "burnFrom",
        "constant": false,
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "uint256",
                "_isParamType": true
            }
        ],
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "gas": null,
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "decimals",
        "constant": true,
        "inputs": [],
        "outputs": [
            {
                "name": null,
                "type": "uint8",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "uint8",
                "_isParamType": true
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "gas": null,
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "decreaseAllowance",
        "constant": false,
        "inputs": [
            {
                "name": "spender",
                "type": "address",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            },
            {
                "name": "subtractedValue",
                "type": "uint256",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "uint256",
                "_isParamType": true
            }
        ],
        "outputs": [
            {
                "name": null,
                "type": "bool",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "bool",
                "_isParamType": true
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "gas": null,
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "increaseAllowance",
        "constant": false,
        "inputs": [
            {
                "name": "spender",
                "type": "address",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            },
            {
                "name": "addedValue",
                "type": "uint256",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "uint256",
                "_isParamType": true
            }
        ],
        "outputs": [
            {
                "name": null,
                "type": "bool",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "bool",
                "_isParamType": true
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "gas": null,
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "initialize",
        "constant": false,
        "inputs": [],
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "gas": null,
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "mint",
        "constant": false,
        "inputs": [
            {
                "name": "to",
                "type": "address",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "uint256",
                "_isParamType": true
            }
        ],
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "gas": null,
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "name",
        "constant": true,
        "inputs": [],
        "outputs": [
            {
                "name": null,
                "type": "string",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "string",
                "_isParamType": true
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "gas": null,
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "owner",
        "constant": true,
        "inputs": [],
        "outputs": [
            {
                "name": null,
                "type": "address",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "gas": null,
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "pause",
        "constant": false,
        "inputs": [],
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "gas": null,
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "paused",
        "constant": true,
        "inputs": [],
        "outputs": [
            {
                "name": null,
                "type": "bool",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "bool",
                "_isParamType": true
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "gas": null,
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "proxiableUUID",
        "constant": true,
        "inputs": [],
        "outputs": [
            {
                "name": null,
                "type": "bytes32",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "bytes32",
                "_isParamType": true
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "gas": null,
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "renounceOwnership",
        "constant": false,
        "inputs": [],
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "gas": null,
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "send_mail",
        "constant": false,
        "inputs": [
            {
                "name": "to",
                "type": "string",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "string",
                "_isParamType": true
            },
            {
                "name": "subject",
                "type": "string",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "string",
                "_isParamType": true
            }
        ],
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "gas": null,
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "symbol",
        "constant": true,
        "inputs": [],
        "outputs": [
            {
                "name": null,
                "type": "string",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "string",
                "_isParamType": true
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "gas": null,
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "totalSupply",
        "constant": true,
        "inputs": [],
        "outputs": [
            {
                "name": null,
                "type": "uint256",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "uint256",
                "_isParamType": true
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "gas": null,
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "transfer",
        "constant": false,
        "inputs": [
            {
                "name": "to",
                "type": "address",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "uint256",
                "_isParamType": true
            }
        ],
        "outputs": [
            {
                "name": null,
                "type": "bool",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "bool",
                "_isParamType": true
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "gas": null,
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "transferFrom",
        "constant": false,
        "inputs": [
            {
                "name": "from",
                "type": "address",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            },
            {
                "name": "to",
                "type": "address",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "uint256",
                "_isParamType": true
            }
        ],
        "outputs": [
            {
                "name": null,
                "type": "bool",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "bool",
                "_isParamType": true
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "gas": null,
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "transferOwnership",
        "constant": false,
        "inputs": [
            {
                "name": "newOwner",
                "type": "address",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            }
        ],
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "gas": null,
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "unpause",
        "constant": false,
        "inputs": [],
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "gas": null,
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "upgradeTo",
        "constant": false,
        "inputs": [
            {
                "name": "newImplementation",
                "type": "address",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            }
        ],
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "gas": null,
        "_isFragment": true
    },
    {
        "type": "function",
        "name": "upgradeToAndCall",
        "constant": false,
        "inputs": [
            {
                "name": "newImplementation",
                "type": "address",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "address",
                "_isParamType": true
            },
            {
                "name": "data",
                "type": "bytes",
                "indexed": null,
                "components": null,
                "arrayLength": null,
                "arrayChildren": null,
                "baseType": "bytes",
                "_isParamType": true
            }
        ],
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "gas": null,
        "_isFragment": true
    }
]