export const milkmanAbi = [
  { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "orderContract",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "orderCreator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "fromToken",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "toToken",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "priceChecker",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "priceCheckerData",
        "type": "bytes"
      }
    ],
    "name": "SwapRequested",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DOMAIN_SEPARATOR",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
      {
        "internalType": "contract IERC20",
        "name": "fromToken",
        "type": "address"
      },
      {
        "internalType": "contract IERC20",
        "name": "toToken",
        "type": "address"
      },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "address", "name": "priceChecker", "type": "address" },
      { "internalType": "bytes", "name": "priceCheckerData", "type": "bytes" }
    ],
    "name": "cancelSwap",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IERC20",
        "name": "fromToken",
        "type": "address"
      },
      { "internalType": "bytes32", "name": "_swapHash", "type": "bytes32" }
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "orderDigest", "type": "bytes32" },
      { "internalType": "bytes", "name": "encodedOrder", "type": "bytes" }
    ],
    "name": "isValidSignature",
    "outputs": [{ "internalType": "bytes4", "name": "", "type": "bytes4" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
      {
        "internalType": "contract IERC20",
        "name": "fromToken",
        "type": "address"
      },
      {
        "internalType": "contract IERC20",
        "name": "toToken",
        "type": "address"
      },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "address", "name": "priceChecker", "type": "address" },
      { "internalType": "bytes", "name": "priceCheckerData", "type": "bytes" }
    ],
    "name": "requestSwapExactTokensForTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "swapHash",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
