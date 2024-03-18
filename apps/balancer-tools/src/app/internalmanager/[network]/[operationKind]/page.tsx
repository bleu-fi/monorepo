"use client";

import { Address, Network, NetworkChainId, networkFor } from "@bleu-fi/utils";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useEffect } from "react";
import { useAccount, useNetwork } from "wagmi";

import { TokenSelect } from "#/app/internalmanager/(components)/TokenSelect";
import { Button } from "#/components";
import { BaseInput } from "#/components/Input";
import { LinkComponent } from "#/components/Link";
import { Spinner } from "#/components/Spinner";
import {
  STAGE_CN_MAPPING,
  TransactionProgressBar,
} from "#/components/TransactionProgressBar";
import WalletNotConnected from "#/components/WalletNotConnected";
import { useInternalBalance } from "#/contexts/InternalManagerContext";
import { getNetwork } from "#/contexts/networks";
import {
  operationKindType,
  UserBalanceOpKind,
} from "#/lib/internal-balance-helper";

export default function Page({
  params,
}: {
  params: {
    network: Network;
    operationKind: operationKindType;
  };
}) {
  const { chain } = useNetwork();
  const { isConnected, isReconnecting, isConnecting } = useAccount();
  const { address } = useAccount();

  const addressLower = address ? address?.toLowerCase() : "";

  const { clearNotification } = useInternalBalance();

  useEffect(() => {
    clearNotification();
  }, [isConnecting, addressLower]);

  if (!isConnected && !isReconnecting && !isConnecting) {
    return <WalletNotConnected isInternalManager />;
  }

  if (isConnecting || isReconnecting) {
    return <Spinner />;
  }

  const network = getNetwork(chain?.name);

  if (network !== params.network) {
    return (
      <div className="flex size-full flex-col items-center rounded-3xl px-12 py-16 md:py-20">
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
        operationKindParam={params.operationKind as unknown as string}
        chainId={chain?.id}
        userAddress={addressLower as Address}
      />
    </>
  );
}

function TransactionCard({
  operationKindParam,
  userAddress,
  chainId,
}: {
  operationKindParam: string;
  userAddress: Address;
  chainId?: NetworkChainId;
}) {
  const operationKindData = {
    [UserBalanceOpKind.DEPOSIT_INTERNAL]: {
      title: "Deposit to",
      description: "Deposit from your wallet to an Internal Balance",
      operationKindEnum: UserBalanceOpKind.DEPOSIT_INTERNAL,
    },
    [UserBalanceOpKind.WITHDRAW_INTERNAL]: {
      title: "Withdraw from",
      description: "Withdraw from your Internal Balance to a wallet",
      operationKindEnum: UserBalanceOpKind.WITHDRAW_INTERNAL,
    },
    [UserBalanceOpKind.TRANSFER_INTERNAL]: {
      title: "Transfer to",
      description: "Transfer between Internal Balances",
      operationKindEnum: UserBalanceOpKind.TRANSFER_INTERNAL,
    },
  };
  const { title, description, operationKindEnum } =
    operationKindData[
      operationKindType[operationKindParam as keyof typeof operationKindType]
    ];

  const { transactionStatus } = useInternalBalance();

  const stage = STAGE_CN_MAPPING[transactionStatus];

  const network = networkFor(chainId);

  return (
    <div className="flex h-full items-center justify-center">
      <form className="my-4 flex size-fit flex-col divide-y divide-slate7 rounded-lg border border-slate7 bg-blue3 text-white">
        <div className="relative flex size-full justify-center">
          <LinkComponent
            href={`/internalmanager/${network}`}
            content={
              <div className="absolute left-8 flex h-full items-center">
                <ArrowLeftIcon
                  height={16}
                  width={16}
                  className="text-slate10 duration-200 hover:text-amber10"
                />
              </div>
            }
          />
          <div className="flex min-w-[530px] flex-col items-center py-3">
            <div className="text-xl">{title} Internal Balance</div>
            <span className="text-sm text-slate11">{description}</span>
          </div>
        </div>
        <div className="flex flex-col gap-y-6 p-9">
          <div>
            <div className="flex h-fit justify-between gap-7">
              <div className="w-1/2">
                <TokenSelect operationKind={operationKindParam} />
              </div>
              <div className="flex w-1/2 items-end gap-2">
                <div className="w-full">
                  <span className="mb-2 block text-sm text-slate12">
                    Amount
                  </span>
                  <BaseInput type="string" placeholder={"0.01"} />
                </div>
              </div>
            </div>
          </div>
          <div>
            <span className="block text-sm text-slate12">Recipient</span>
            <BaseInput type="string" placeholder={userAddress} />
          </div>
          {operationKindEnum === UserBalanceOpKind.DEPOSIT_INTERNAL && (
            <TransactionProgressBar stage={stage} />
          )}
          <div className="flex justify-center">
            <Button type="submit" className="w-full" disabled={true}>
              <span>Select a Token</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
