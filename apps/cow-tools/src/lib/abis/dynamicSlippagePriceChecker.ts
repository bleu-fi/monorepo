export const dynamicSlippagePriceCheckerAbi = [
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      {
        internalType: "address",
        name: "_expectedOutCalculator",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "EXPECTED_OUT_CALCULATOR",
    outputs: [
      {
        internalType: "contract IExpectedOutCalculator",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "NAME",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_amountIn", type: "uint256" },
      { internalType: "address", name: "_fromToken", type: "address" },
      { internalType: "address", name: "_toToken", type: "address" },
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "uint256", name: "_minOut", type: "uint256" },
      { internalType: "bytes", name: "_data", type: "bytes" },
    ],
    name: "checkPrice",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
];
