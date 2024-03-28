import { Address } from "@bleu-fi/utils";
import { BaseTransaction } from "@gnosis.pm/safe-apps-sdk";
import { erc20ABI } from "@wagmi/core";
import { encodeFunctionData } from "viem";

import { milkmanAbi } from "#/lib/abis/milkman";
import { ChainId } from "#/utils/chainsPublicClients";

import {
  encodePriceCheckerData,
  encodePriceCheckerDataWithValidFromDecorator,
} from "./encode";
import {
  priceCheckerAddressesMapping,
  validFromDecorator,
} from "./priceCheckersMappings";
import { argType, PRICE_CHECKERS } from "./types";

// Milkman's address is the same for all chains supported chains (mainnet, goerli, sepolia, and gnosis)
export const MILKMAN_ADDRESS = "0x11C76AD590ABDFFCD980afEC9ad951B160F02797";

export enum TRANSACTION_TYPES {
  ERC20_APPROVE = "ERC20_APPROVE",
  MILKMAN_ORDER = "MILKMAN_ORDER",
  MILKMAN_CANCEL = "MILKMAN_CANCEL",
}
export interface BaseArgs {
  type: TRANSACTION_TYPES;
}

export interface ERC20ApproveArgs extends BaseArgs {
  type: TRANSACTION_TYPES.ERC20_APPROVE;
  tokenAddress: Address;
  spender: Address;
  amount: bigint;
}

export interface MilkmanOrderArgs extends BaseArgs {
  type: TRANSACTION_TYPES.MILKMAN_ORDER;
  tokenAddressToSell: Address;
  tokenAddressToBuy: Address;
  toAddress: Address;
  amount: bigint;
  priceChecker: PRICE_CHECKERS;
  isValidFromNeeded: boolean;
  validFrom: string;
  args: argType[];
  twapDelay: number;
  chainId: ChainId;
}

export interface MilkmanCancelArgs extends BaseArgs {
  type: TRANSACTION_TYPES.MILKMAN_CANCEL;
  contractAddress: Address;
  tokenAddressToSell: Address;
  tokenAddressToBuy: Address;
  toAddress: Address;
  amount: bigint;
  priceChecker: Address;
  priceCheckerData: `0x${string}`;
}

interface ITransaction<T> {
  createRawTx(args: T): BaseTransaction;
}

class ERC20ApproveRawTx implements ITransaction<ERC20ApproveArgs> {
  createRawTx({
    tokenAddress,
    spender,
    amount,
  }: ERC20ApproveArgs): BaseTransaction {
    return {
      to: tokenAddress,
      value: "0",
      data: encodeFunctionData({
        abi: erc20ABI,
        functionName: "approve",
        args: [spender, amount],
      }),
    };
  }
}

class MilkmanOrderRawTx implements ITransaction<MilkmanOrderArgs> {
  createRawTx({
    tokenAddressToSell,
    tokenAddressToBuy,
    toAddress,
    amount,
    priceChecker,
    isValidFromNeeded,
    validFrom,
    twapDelay,
    chainId,
    args,
  }: MilkmanOrderArgs): BaseTransaction {
    const priceCheckerAddress = priceCheckerAddressesMapping[chainId][
      priceChecker
    ] as Address;
    const priceCheckerData = encodePriceCheckerData(priceChecker, args);

    return {
      to: MILKMAN_ADDRESS,
      value: "0",
      data: encodeFunctionData({
        abi: milkmanAbi,
        functionName: "requestSwapExactTokensForTokens",
        args: [
          amount,
          tokenAddressToSell,
          tokenAddressToBuy,
          toAddress,
          isValidFromNeeded ? validFromDecorator[chainId] : priceCheckerAddress,
          isValidFromNeeded
            ? encodePriceCheckerDataWithValidFromDecorator({
                priceCheckerAddress,
                priceCheckerData,
                validFrom,
                twapDelay,
              })
            : priceCheckerData,
        ],
      }),
    };
  }
}

class MilkmanCancelRawTx implements ITransaction<MilkmanCancelArgs> {
  createRawTx({
    contractAddress,
    tokenAddressToSell,
    tokenAddressToBuy,
    toAddress,
    amount,
    priceChecker,
    priceCheckerData,
  }: MilkmanCancelArgs): BaseTransaction {
    return {
      to: contractAddress,
      value: "0",
      data: encodeFunctionData({
        abi: milkmanAbi,
        functionName: "cancelSwap",
        args: [
          amount,
          tokenAddressToSell,
          tokenAddressToBuy,
          toAddress,
          priceChecker,
          priceCheckerData,
        ],
      }),
    };
  }
}

export interface TransactionBindings {
  [TRANSACTION_TYPES.ERC20_APPROVE]: ERC20ApproveArgs;
  [TRANSACTION_TYPES.MILKMAN_ORDER]: MilkmanOrderArgs;
  [TRANSACTION_TYPES.MILKMAN_CANCEL]: MilkmanCancelArgs;
}

export type AllTransactionArgs = TransactionBindings[keyof TransactionBindings];

const TRANSACTION_CREATORS: {
  [key in keyof TransactionBindings]: new () => ITransaction<
    TransactionBindings[key]
  >;
} = {
  [TRANSACTION_TYPES.ERC20_APPROVE]: ERC20ApproveRawTx,
  [TRANSACTION_TYPES.MILKMAN_ORDER]: MilkmanOrderRawTx,
  [TRANSACTION_TYPES.MILKMAN_CANCEL]: MilkmanCancelRawTx,
};

export class TransactionFactory {
  static createRawTx<T extends TRANSACTION_TYPES>(
    type: T,
    args: TransactionBindings[T],
  ): BaseTransaction {
    const TransactionCreator = TRANSACTION_CREATORS[type];
    const txCreator = new TransactionCreator();
    return txCreator.createRawTx(args);
  }
}
