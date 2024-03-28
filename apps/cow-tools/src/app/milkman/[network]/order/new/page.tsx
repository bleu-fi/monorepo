"use client";

import { Address, Network } from "@bleu-fi/utils";
import { useSafeAppsSDK } from "@gnosis.pm/safe-apps-react-sdk";
import { gnosis, mainnet, sepolia } from "viem/chains";

import { TransactionCard } from "#/app/milkman/(components)/TransactionCard";
import WalletNotConnected from "#/components/WalletNotConnected";

export type tokenPriceChecker = {
  symbol: string;
  address: string;
  decimals: number;
};

export default function Page({
  params,
}: {
  params: {
    network: Network;
  };
}) {
  const { safe, connected } = useSafeAppsSDK();

  if (!connected) {
    return <WalletNotConnected />;
  }

  const addressLower = safe.safeAddress ? safe.safeAddress?.toLowerCase() : "";

  if (
    safe.chainId !== mainnet.id &&
    safe.chainId !== sepolia.id &&
    safe.chainId !== gnosis.id
  ) {
    return (
      <div className="flex h-full w-full flex-col items-center rounded-3xl px-12 py-16 md:py-20">
        <div className="text-center text-3xl text-amber9">
          You are on the wrong network
        </div>
        <div className="text-xl text-white">
          Please change to {params.network}
        </div>
      </div>
    );
  }

  return (
    <>
      <TransactionCard
        userAddress={addressLower as Address}
        chainId={safe.chainId}
      />
    </>
  );
}
