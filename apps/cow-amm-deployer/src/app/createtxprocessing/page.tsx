"use client";

import { useSafeAppsSDK } from "@gnosis.pm/safe-apps-react-sdk";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Address } from "viem";

import { Spinner } from "#/components/Spinner";
import { checkIsAmmRunning, fetchLastAmmInfo } from "#/hooks/useRunningAmmInfo";
import { ChainId } from "#/utils/chainsPublicClients";

export default function Page() {
  const {
    safe: { safeAddress, chainId },
  } = useSafeAppsSDK();
  const router = useRouter();

  async function redirectToHomeIfAmmIsRunningAndIndexed() {
    const isAmmRunning = await fetchLastAmmInfo({
      chainId: chainId as ChainId,
      safeAddress: safeAddress as Address,
    }).then((data) =>
      checkIsAmmRunning(chainId as ChainId, safeAddress as Address, data.hash),
    );
    if (isAmmRunning) {
      router.push("/manager");
    }
  }
  useEffect(() => {
    const intervalId = setInterval(
      redirectToHomeIfAmmIsRunningAndIndexed,
      1000,
    );
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex size-full flex-col items-center px-12 py-16 md:py-20">
      <div className="text-center text-3xl text-yellow/30">
        The transaction is being processed
      </div>
      <Spinner />
    </div>
  );
}
