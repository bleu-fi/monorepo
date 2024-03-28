import { gnosis, mainnet, sepolia } from "viem/chains";

import { truncateAddress } from "#/utils/truncate";

import { PRICE_CHECKERS, PriceCheckerArgument } from "./types";

const dynamicSlippageDescription =
  "This value represents the allowed slippage that you accepts between the quote and the order execution (including fees)";

export const convertOutputListOfAddresses = (output: string[]) =>
  String(output.map((address) => truncateAddress(address))).replaceAll(
    ",",
    ", ",
  );

const allowedSlippageInBpsArgument = {
  name: "allowedSlippageInBps",
  type: "uint256",
  label: "Allowed slippage (%)",
  inputType: "number",
  convertInput: (input: number) => BigInt(input * 100),
  convertOutput: (output: bigint) => Number(output) / 100,
  encodingLevel: 0,
  description: dynamicSlippageDescription,
} as PriceCheckerArgument;

export const priceCheckersArgumentsMapping = {
  [PRICE_CHECKERS.FIXED_MIN_OUT]: [
    {
      name: "minOut",
      type: "uint256",
      label: "Token to buy minimum amount",
      inputType: "number",
      convertInput: (input: number, decimals: number) =>
        BigInt(input * 10 ** decimals),
      convertOutput: (output: bigint, decimals: number) =>
        Number(output) / 10 ** decimals,
      encodingLevel: 0,
      description: "The minimum amount of tokens you want to receive.",
    },
  ] as PriceCheckerArgument[],
  [PRICE_CHECKERS.UNI_V2]: [
    allowedSlippageInBpsArgument,
  ] as PriceCheckerArgument[],
  [PRICE_CHECKERS.BALANCER]: [
    allowedSlippageInBpsArgument,
  ] as PriceCheckerArgument[],
  [PRICE_CHECKERS.SUSHI_SWAP]: [
    allowedSlippageInBpsArgument,
  ] as PriceCheckerArgument[],
  [PRICE_CHECKERS.CURVE]: [
    allowedSlippageInBpsArgument,
  ] as PriceCheckerArgument[],
  [PRICE_CHECKERS.CHAINLINK]: [
    allowedSlippageInBpsArgument,
    {
      name: "addressesPriceFeeds",
      type: "address[]",
      label: "Price feeds",
      convertOutput: convertOutputListOfAddresses,
      inputType: "text",
      encodingLevel: 1,
      description:
        "The price feeds addresses that will be used to calculate the expected amount of tokens you will receive.",
      link: "https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1",
    },
    {
      name: "revertPriceFeeds",
      type: "bool[]",
      label: "Revert price feeds",
      inputType: "checkbox",
      encodingLevel: 1,
      description:
        "If the price feed will revert, the price checker will revert. This means that if the price feed is A/B and you want B/A you will have to mark this option.",
    },
  ] as PriceCheckerArgument[],
  [PRICE_CHECKERS.UNI_V3]: [
    allowedSlippageInBpsArgument,
    {
      name: "tokenIn",
      type: "address[]",
      label: "Token In",
      inputType: "text",
      encodingLevel: 1,
      description: "The token you want to sell on each pool.",
    },
    {
      name: "tokenOut",
      type: "address[]",
      label: "Token Out",
      inputType: "text",
      encodingLevel: 1,
      description: "The token you want to buy on each pool.",
    },
    {
      name: "fees",
      type: "uint24[]",
      label: "Fees (%)",
      inputType: "number",
      step: 0.01,
      encodingLevel: 1,
      convertInput: (inputs: number[]) =>
        inputs.map((input) => BigInt(input * 100)),
      convertOutput: (outputs: string[]) =>
        outputs.map((output) => Number(output) / 100),
      description: "The fee of each selected pool.",
      link: "https://info.uniswap.org/#/pools",
    },
  ] as PriceCheckerArgument[],
  [PRICE_CHECKERS.META]: [
    allowedSlippageInBpsArgument,
    {
      name: "swapPath",
      type: "address[]",
      label: "Swap path",
      convertOutput: convertOutputListOfAddresses,
      inputType: "text",
      encodingLevel: 1,
      description: "The expected out path",
    },
    {
      name: "expectedOutAddresses",
      type: "address[]",
      label: "Expected Out Addresses",
      convertOutput: convertOutputListOfAddresses,
      inputType: "text",
      encodingLevel: 1,
      description: "The expected out path",
    },
    {
      name: "expectedOutData",
      type: "bytes[]",
      label: "Price checker arguments",
      inputType: "text",
      encodingLevel: 1,
      description: "The expected out arguments",
    },
  ] as PriceCheckerArgument[],
} as const;

export const priceCheckerAddressesMapping = {
  [sepolia.id]: {
    [PRICE_CHECKERS.FIXED_MIN_OUT]:
      "0x0x8a671d24957381e267080674531dc2e82a95c049",
    [PRICE_CHECKERS.UNI_V2]: "0x",
    [PRICE_CHECKERS.BALANCER]: "0x",
    [PRICE_CHECKERS.SUSHI_SWAP]: "0x",
    [PRICE_CHECKERS.CHAINLINK]: "0x",
    [PRICE_CHECKERS.UNI_V3]: "0x",
    [PRICE_CHECKERS.CURVE]: "0x",
    [PRICE_CHECKERS.META]: "0x",
  },
  [gnosis.id]: {
    [PRICE_CHECKERS.FIXED_MIN_OUT]:
      "0x978414CBBE776d3F56E78c6e522dd01B1A608EfC",
    [PRICE_CHECKERS.UNI_V2]: "0x",
    [PRICE_CHECKERS.BALANCER]: "0x",
    [PRICE_CHECKERS.SUSHI_SWAP]: "0x",
    [PRICE_CHECKERS.CHAINLINK]: "0x",
    [PRICE_CHECKERS.UNI_V3]: "0x",
    [PRICE_CHECKERS.CURVE]: "0x",
    [PRICE_CHECKERS.META]: "0x",
  },
  [mainnet.id]: {
    [PRICE_CHECKERS.FIXED_MIN_OUT]:
      "0xcfb9Bc9d2FA5D3Dd831304A0AE53C76ed5c64802",
    [PRICE_CHECKERS.UNI_V2]: "0x17fb579f14F8Fa9d1daCE1716Fd0E70B952E145b",
    [PRICE_CHECKERS.BALANCER]: "0xBeA6AAC5bDCe0206A9f909d80a467C93A7D6Da7c",
    [PRICE_CHECKERS.SUSHI_SWAP]: "0x50d03c63344acd9B723243046F680D83D007A2de",
    [PRICE_CHECKERS.CHAINLINK]: "0xe80a1C615F75AFF7Ed8F08c9F21f9d00982D666c",
    [PRICE_CHECKERS.UNI_V3]: "0x2F965935f93718bB66d53a37a97080785657f0AC",
    [PRICE_CHECKERS.CURVE]: "0x39BF89C4fD9A82c262aD9b0434B4dFafCcFD0727",
    [PRICE_CHECKERS.META]: "0xf447Bf3CF8582E4DaB9c34C5b261A7b6AD4D6bDD",
  },
};

export const expectedOutCalculatorAddressesMapping = {
  [sepolia.id]: {
    [PRICE_CHECKERS.FIXED_MIN_OUT]: "0x",
    [PRICE_CHECKERS.UNI_V2]: "0x",
    [PRICE_CHECKERS.BALANCER]: "0x",
    [PRICE_CHECKERS.SUSHI_SWAP]: "0x",
    [PRICE_CHECKERS.CHAINLINK]: "0x",
    [PRICE_CHECKERS.UNI_V3]: "0x",
    [PRICE_CHECKERS.CURVE]: "0x",
    [PRICE_CHECKERS.META]: "0x",
  },
  [gnosis.id]: {
    [PRICE_CHECKERS.FIXED_MIN_OUT]: "0x",
    [PRICE_CHECKERS.UNI_V2]: "0x",
    [PRICE_CHECKERS.BALANCER]: "0x",
    [PRICE_CHECKERS.SUSHI_SWAP]: "0x",
    [PRICE_CHECKERS.CHAINLINK]: "0x",
    [PRICE_CHECKERS.UNI_V3]: "0x",
    [PRICE_CHECKERS.CURVE]: "0x",
    [PRICE_CHECKERS.META]: "0x",
  },
  [mainnet.id]: {
    [PRICE_CHECKERS.FIXED_MIN_OUT]: "0x",
    [PRICE_CHECKERS.UNI_V2]: "0x91aC3CE5b1379933138E20A32a157729C8d28028",
    [PRICE_CHECKERS.BALANCER]: "0xbd0f0A6dcA84cE967336702f875e99D723213849",
    [PRICE_CHECKERS.SUSHI_SWAP]: "0xd6b20d7d7bdaF450714c26F237a3e5E2418237F1",
    [PRICE_CHECKERS.CHAINLINK]: "0xe23fc134382de3eAF871C249C90bf3Acb846C5ab",
    [PRICE_CHECKERS.UNI_V3]: "0xEb80C478f72ac353736be8954eE1aD1B167551F9",
    [PRICE_CHECKERS.CURVE]: "0x227665A7D708f861b224A372B011447d6172B668",
    [PRICE_CHECKERS.META]: "0x830f28591CAc072f74721e51B0954539817b14B9",
  },
};

export const validFromDecorator = {
  [sepolia.id]: "0x8A671d24957381e267080674531Dc2E82a95c049" as const,
  [gnosis.id]: "0x3a855f744F1bD76BC36B05d18cD1ba101a65b25c" as const,
  [mainnet.id]: "0x67FE9d6bbeeccb8c7Fe694BE62E08b5fCB5486D7" as const,
};

export const deployedPriceCheckersByChain = {
  [gnosis.id]: [PRICE_CHECKERS.FIXED_MIN_OUT] as const,
  [sepolia.id]: [PRICE_CHECKERS.FIXED_MIN_OUT] as const,
  [mainnet.id]: [
    PRICE_CHECKERS.FIXED_MIN_OUT,
    PRICE_CHECKERS.UNI_V2,
    PRICE_CHECKERS.BALANCER,
    PRICE_CHECKERS.CHAINLINK,
    PRICE_CHECKERS.UNI_V3,
    PRICE_CHECKERS.META,
    PRICE_CHECKERS.CURVE,
  ],
};

export const priceCheckerHasExpectedOutCalculatorMapping = {
  [PRICE_CHECKERS.FIXED_MIN_OUT]: false,
  [PRICE_CHECKERS.UNI_V2]: true,
  [PRICE_CHECKERS.BALANCER]: true,
  [PRICE_CHECKERS.SUSHI_SWAP]: true,
  [PRICE_CHECKERS.CHAINLINK]: true,
  [PRICE_CHECKERS.UNI_V3]: true,
  [PRICE_CHECKERS.CURVE]: true,
  [PRICE_CHECKERS.META]: true,
} as const;

export const priceCheckerTooltipMessageMapping = {
  [PRICE_CHECKERS.FIXED_MIN_OUT]:
    "This basic price checker accepts orders if the received token amount exceeds your set minimum. It requires you to calculate and predict prices, especially for orders that take time to process.",
  [PRICE_CHECKERS.UNI_V2]:
    "This checker uses Uniswap V2 pools to estimate your token returns. It constructs a path using WETH as an intermediary (if not already a pair token) to calculate expected token amounts.",
  [PRICE_CHECKERS.BALANCER]:
    "Designed for trading BAL80-WETH20 BPT to BAL or WETH, this checker uses BAL infrastructure and Chainlink oracles to estimate expected token returns.",
  [PRICE_CHECKERS.SUSHI_SWAP]:
    "This checker calculates expected token returns using SushiSwap pools. Similar to UNI_V2, it uses WETH as a middle token in the path if it's not part of the token pair.",
  [PRICE_CHECKERS.CURVE]:
    "Utilizing Curve pools, this checker estimates token returns. The path is constructed using the Curve registry and router.",
  [PRICE_CHECKERS.CHAINLINK]:
    "The Chainlink checker calculates expected token returns using a series of price feeds. It only verifies if the checker will not revert; constructing an inaccurate path may result in lower token returns.",
  [PRICE_CHECKERS.UNI_V3]:
    "This checker uses Uniswap V3 pools to estimate token returns. It ensures the checker doesn't revert, leaving the path construction to you. Incorrect paths may lead to reduced token returns.",
  [PRICE_CHECKERS.META]:
    "This versatile checker calculates token returns using various protocols. It checks for non-reversion, but path construction is user-dependent, with incorrect paths possibly leading to lower returns.",
};
