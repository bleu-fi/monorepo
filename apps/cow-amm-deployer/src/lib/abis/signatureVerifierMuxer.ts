export const signatureVerifierMuxerAbi = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "domainSeparator",
        type: "bytes32",
      },
      {
        internalType: "contract ISafeSignatureVerifier",
        name: "newVerifier",
        type: "address",
      },
    ],
    name: "setDomainVerifier",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "handler",
        type: "address",
      },
    ],
    name: "setFallbackHandler",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "safe", type: "address" },
      { name: "domainSeparator", type: "bytes32" },
    ],
    name: "domainVerifiers",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
] as const;
