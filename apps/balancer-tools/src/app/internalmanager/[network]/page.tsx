"use client";

import { PlusIcon } from "@radix-ui/react-icons";

import { Button } from "#/components";
import { LinkComponent } from "#/components/Link";
import { Spinner } from "#/components/Spinner";
import WalletNotConnected from "#/components/WalletNotConnected";
import { getNetwork } from "#/contexts/networks";
import { useAccount, useNetwork } from "#/wagmi";

import { BatchWithdrawButton } from "../(components)/BatchWithdrawButton";
import { TokenTable } from "../(components)/TokenTable";

export default function page() {
  const { isConnected, isReconnecting, isConnecting } = useAccount();

  const { chain } = useNetwork();

  const network = getNetwork(chain?.name);

  if (!isConnected && !isReconnecting && !isConnecting) {
    return <WalletNotConnected isInternalManager />;
  }

  if (isConnecting || isReconnecting) {
    return <Spinner />;
  }

  return (
    <div className="flex w-full justify-center">
      <div className="mt-20 flex w-4/6 flex-col gap-y-5">
        <div className="flex items-center justify-between gap-x-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl text-slate12">My Internal Balances</h1>
          </div>
          <div className="flex gap-4">
            <LinkComponent
              loaderColor="amber"
              href={`/internalmanager/${network}/deposit/`}
              content={
                <Button className="flex items-center gap-1" title="New deposit">
                  <PlusIcon />
                  Deposit Token
                </Button>
              }
            />
            <BatchWithdrawButton />
          </div>
        </div>
        <TokenTable />
      </div>
    </div>
  );
}
