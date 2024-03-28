"use client";

import { NetworkChainId, NetworkFromNetworkChainId } from "@bleu-fi/utils";
import { useSafeAppsSDK } from "@gnosis.pm/safe-apps-react-sdk";
import { redirect } from "next/navigation";
import { gnosis, mainnet, sepolia } from "viem/chains";

export default function Page() {
  const {
    safe: { chainId },
  } = useSafeAppsSDK();

  if (chainId == gnosis.id || chainId == mainnet.id || chainId == sepolia.id) {
    redirect(
      `/milkman/${NetworkFromNetworkChainId[chainId as NetworkChainId]}`,
    );
  } else redirect("/milkman/mainnet");
}
