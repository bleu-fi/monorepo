"use client";

import { useSafeAppsSDK } from "@gnosis.pm/safe-apps-react-sdk";
import { useState } from "react";
import { FieldValues } from "react-hook-form";
import { formatUnits } from "viem";

import { Button } from "#/components/Button";
import { Spinner } from "#/components/Spinner";
import WalletNotConnected from "#/components/WalletNotConnected";
import { useRunningAMM } from "#/hooks/useRunningAmmInfo";
import { TRANSACTION_TYPES } from "#/lib/transactionFactory";
import { ICowAmm } from "#/lib/types";
import { supportedChainIds } from "#/utils/chainsPublicClients";

import { UnsuportedChain } from "../../components/UnsuportedChain";
import { FormWrapper } from "./(components)/FormWrapper";

function cowAmmToFormValues(cowAmm: ICowAmm): FieldValues {
  return {
    token0: cowAmm.token0.tokenInfo,
    token1: cowAmm.token1.tokenInfo,
    minTradedToken0: formatUnits(
      BigInt(cowAmm.minTradedToken0),
      cowAmm.token0.tokenInfo.decimals,
    ),
    priceOracle: cowAmm.priceOracle,
    balancerPoolId: cowAmm.priceOracleData.balancerPoolId,
    uniswapV2Pair: cowAmm.priceOracleData.uniswapV2PairAddress,
  };
}

export default function Page() {
  const { safe, connected } = useSafeAppsSDK();
  const { loaded, isAmmRunning, cowAmm } = useRunningAMM();
  const [goToForm, setGoToForm] = useState(false);

  if (!connected) {
    return <WalletNotConnected />;
  }

  if (!loaded) {
    return <Spinner />;
  }

  const transactionType = isAmmRunning
    ? TRANSACTION_TYPES.EDIT_COW_AMM
    : TRANSACTION_TYPES.CREATE_COW_AMM;

  const defaultValues =
    isAmmRunning && cowAmm ? cowAmmToFormValues(cowAmm) : undefined;

  if (!supportedChainIds.includes(safe.chainId)) {
    return <UnsuportedChain />;
  }

  if (!goToForm && !isAmmRunning) {
    return (
      <div className="flex size-full justify-center">
        <div className="flex flex-col items-center gap-8 justify-center">
          <h2 className="mt-8 leading-snug text-center w-3/4 text-2xl">
            <b className="text-yellow">Attention</b>, deploying a CoW AMM
            Liquidity pool requires a safe wallet. Keep in mind, that the{" "}
            <b className="text-yellow">
              Safe used for deploying liquidity should only be used for this
              purpose
            </b>
            , as the tokens held in the safe will be used for the pool creation.
            CoW AMM utilizes all available token balances on the Safe for the
            token pairs that you have created a liquidity pool, thus,{" "}
            <b className="text-yellow">
              disabling other functionalities a Safe might be used for.
            </b>
          </h2>
          <Button
            size="lg"
            className="flex items-center gap-1 py-8 px-7 text-xl"
            title="Go to the app"
            onClick={() => setGoToForm(true)}
          >
            I am aware and want to continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <FormWrapper
      transactionType={transactionType}
      defaultValues={defaultValues}
    />
  );
}
