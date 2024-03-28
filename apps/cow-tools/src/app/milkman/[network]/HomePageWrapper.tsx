"use client";

import {
  Network,
  NetworkChainId,
  NetworkFromNetworkChainId,
} from "@bleu-fi/utils";
import { useSafeAppsSDK } from "@gnosis.pm/safe-apps-react-sdk";
import { PlusIcon } from "@radix-ui/react-icons";
import { gnosis, mainnet, sepolia } from "viem/chains";

import { Button } from "#/components";
import { LinkComponent } from "#/components/Link";
import WalletNotConnected from "#/components/WalletNotConnected";

import { OrderTable } from "../(components)/OrderTable";

export function HomePageWrapper({
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
    <div className="flex w-full justify-center">
      <div className="my-10 flex w-9/12 flex-col gap-y-5">
        <div className="flex items-center justify-between gap-x-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl text-slate12">Milkman transactions</h1>
            <span>
              Here is a list of your Milkman transaction with its status.
            </span>
          </div>
          <div className="flex gap-4">
            <LinkComponent
              loaderColor="amber"
              href={`/milkman/${
                NetworkFromNetworkChainId[safe.chainId as NetworkChainId]
              }/order/new`}
              content={
                <Button
                  className="flex items-center gap-1 py-3 px-6"
                  title="New order"
                >
                  <PlusIcon />
                  New order
                </Button>
              }
            />
          </div>
        </div>
        <OrderTable />
      </div>
    </div>
  );
}
