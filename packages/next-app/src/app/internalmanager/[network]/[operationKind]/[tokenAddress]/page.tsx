"use client";

import { SingleInternalBalanceQuery } from "@balancer-pool-metadata/gql/src/balancer-internal-manager/__generated__/Mainnet";
import { getInternalBalanceSchema } from "@balancer-pool-metadata/schema";
import {
  buildExplorerAddressURL,
  Network,
  NetworkChainId,
} from "@balancer-pool-metadata/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { tokenLogoUri } from "public/tokens/logoUri";
import { useEffect } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { useAccount, useNetwork } from "wagmi";

import { TokenSelect } from "#/app/internalmanager/(components)/TokenSelect";
import { ToastContent } from "#/app/metadata/[network]/pool/[poolId]/(components)/MetadataAttributesTable/TransactionModal";
import genericTokenLogo from "#/assets/generic-token-logo.png";
import { Button } from "#/components";
import { Input } from "#/components/Input";
import Spinner from "#/components/Spinner";
import { Toast } from "#/components/Toast";
import WalletNotConnected from "#/components/WalletNotConnected";
import { useInternalBalance } from "#/contexts/InternalManagerContext";
import { useInternalBalancesTransaction } from "#/hooks/useTransaction";
import { impersonateWhetherDAO, internalBalances } from "#/lib/gql";
import { UserBalanceOpKind } from "#/lib/internal-balance-helper";
import { refetchRequest } from "#/utils/fetcher";
import { ArrElement, GetDeepProp } from "#/utils/getTypes";

enum operationKindType {
  "deposit" = UserBalanceOpKind.DEPOSIT_INTERNAL,
  "withdraw" = UserBalanceOpKind.WITHDRAW_INTERNAL,
  "transfer" = UserBalanceOpKind.TRANSFER_INTERNAL,
}

export default function Page({
  params,
}: {
  params: {
    tokenAddress: `0x${string}`;
    network: Network;
    operationKind: operationKindType;
  };
}) {
  const { chain } = useNetwork();
  const { isConnected, isReconnecting, isConnecting } = useAccount();
  let { address } = useAccount();
  address = impersonateWhetherDAO(chain?.id.toString() || "1", address);

  const addressLower = address ? address?.toLowerCase() : "";

  const {
    notification,
    clearNotification,
    setIsNotifierOpen,
    isNotifierOpen,
    transactionUrl,
    setSelectedToken,
  } = useInternalBalance();

  const { data: internalBalanceTokenData, mutate } = internalBalances
    .gql(chain?.id.toString() || "1")
    .useSingleInternalBalance({
      userAddress: addressLower as `0x${string}`,
      tokenAddress: params.tokenAddress, // aqui acho que era pra ser selectedToken.address e refazer p hook toda vez que mudar o token
    });

  const tokenData = internalBalanceTokenData?.user?.userInternalBalances
    ? internalBalanceTokenData?.user?.userInternalBalances[0]
    : undefined;

  refetchRequest({
    mutate,
    chainId: chain?.id.toString() || "1",
    userAddress: addressLower as `0x${string}`,
  });

  useEffect(() => {
    if (!tokenData) return;
    setSelectedToken({
      address: tokenData?.tokenInfo.address as `0x${string}`,
      symbol: tokenData?.tokenInfo.symbol as string,
      logoUrl:
        tokenLogoUri[
          tokenData?.tokenInfo?.symbol as keyof typeof tokenLogoUri
        ] || genericTokenLogo,
    });
  }, [internalBalanceTokenData]);

  useEffect(() => {
    clearNotification();
  }, [isConnecting, addressLower]);

  if (!isConnected && !isReconnecting && !isConnecting) {
    return <WalletNotConnected isInternalManager />;
  }

  if (isConnecting || isReconnecting) {
    return <Spinner />;
  }

  if (chain?.name.toLowerCase() !== params.network) {
    return (
      <div className="w-full rounded-3xl items-center py-16 px-12 md:py-20 flex flex-col h-full">
        <div className="text-center text-amber9 text-3xl">
          You are on the wrong network
        </div>
        <div className="text-white text-xl">
          Please change to {params.network}
        </div>
      </div>
    );
  }

  if (tokenData?.balance === "0" || internalBalanceTokenData?.user === null) {
    return (
      <div className="w-full rounded-3xl items-center py-16 px-12 md:py-20 flex flex-col h-full">
        <div className="text-center text-amber9 text-3xl">
          Looks like you don't have this token
        </div>
        <div className="text-white text-xl">
          Please click
          <Link href={"/internalmanager"}>
            <span className="text-gray-400"> here </span>
          </Link>
          to check which tokens you have
        </div>
      </div>
    );
  }

  return (
    <>
      {tokenData && (
        <TransactionCard
          operationKindParam={params.operationKind as unknown as string}
          userAddress={addressLower as `0x${string}`}
          tokenData={tokenData}
          chainId={chain!.id}
        />
      )}
      {notification && (
        <Toast
          content={
            <ToastContent
              title={notification.title}
              description={notification.description}
              link={transactionUrl}
            />
          }
          isOpen={isNotifierOpen}
          setIsOpen={setIsNotifierOpen}
          variant={notification.variant}
        />
      )}
    </>
  );
}

function TransactionCard({
  operationKindParam,
  userAddress,
  tokenData,
  chainId,
}: {
  operationKindParam: string;
  userAddress: `0x${string}`;
  tokenData: ArrElement<
    GetDeepProp<SingleInternalBalanceQuery, "userInternalBalances">
  >;
  chainId: NetworkChainId;
}) {
  const operationKindData = {
    [UserBalanceOpKind.DEPOSIT_INTERNAL]: {
      title: "Deposit to",
      description: "Deposit from your wallet to an internal balance",
      operationKindEnum: UserBalanceOpKind.DEPOSIT_INTERNAL,
    },
    [UserBalanceOpKind.WITHDRAW_INTERNAL]: {
      title: "Withdraw from",
      description: "Withdraw from your internal balance to a wallet",
      operationKindEnum: UserBalanceOpKind.WITHDRAW_INTERNAL,
    },
    [UserBalanceOpKind.TRANSFER_INTERNAL]: {
      title: "Transfer to",
      description:
        "Transfer from your internal balance to another internal balance",
      operationKindEnum: UserBalanceOpKind.TRANSFER_INTERNAL,
    },
  };
  const { title, operationKindEnum } =
    operationKindData[
      operationKindType[operationKindParam as keyof typeof operationKindType]
    ];

  const InternalBalanceSchema = getInternalBalanceSchema({
    totalBalance: tokenData.balance,
    userAddress: userAddress,
    operationKind: operationKindParam,
  });

  const { register, handleSubmit, setValue, formState, watch } = useForm({
    resolver: zodResolver(InternalBalanceSchema),
  });

  const { selectedToken } = useInternalBalance();

  register("tokenAddress");

  useEffect(() => {
    setValue("tokenAddress", selectedToken?.address);
  }, [selectedToken]);

  const { handleWithdraw } = useInternalBalancesTransaction({
    userAddress: userAddress,
    tokenDecimals: tokenData.tokenInfo.decimals,
    operationKind: operationKindEnum,
  });

  const explorerData = buildExplorerAddressURL({
    chainId,
    address: userAddress,
  });

  const receiverAddressValue = watch("receiverAddress");

  const addressRegex = /0x[a-fA-F0-9]{40}/;

  function handleOnSubtmit(data: FieldValues) {
    setValue("tokenAddress", selectedToken?.address);
    handleWithdraw(data);
  }

  return (
    <div className="flex items-center justify-center h-full">
      <form
        onSubmit={handleSubmit(handleOnSubtmit)}
        className="flex flex-col text-white bg-blue3 h-fit my-4 w-fit rounded-lg divide-y divide-gray-700 border border-gray-700"
      >
        <div className="relative w-full flex justify-center h-full">
          <Link href={"/internalmanager"}>
            <div className="absolute left-8 flex h-full items-center">
              <ArrowLeftIcon
                height={16}
                width={16}
                className="text-gray-500 hover:text-amber10 duration-200"
              />
            </div>
          </Link>
          <div className="flex flex-col items-center py-3 px-32">
            <div className="text-xl">{title} Internal Balance</div>
            <span className="text-gray-200 text-sm">
              Lorem ipsum dolor sit amet
            </span>
          </div>
        </div>
        <div className="p-9 flex flex-col gap-y-6">
          <div>
            <div className="flex justify-between gap-7 h-fit">
              <div className="w-1/2">
                <TokenSelect />
              </div>
              <div className="flex gap-2 items-end w-1/2">
                <div className="w-full">
                  <Input
                    type="string"
                    label="Amount"
                    placeholder={tokenData.balance}
                    {...register("tokenAmount")}
                    errorMessage={
                      formState.errors?.tokenAmount?.message as string
                    }
                  />
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs flex gap-x-1">
              <span className="text-gray-400">
                Wallet Balance: {tokenData.balance}
              </span>
              <button
                type="button"
                className="outline-none text-blue9 hover:text-amber9"
                onClick={() => {
                  setValue("tokenAmount", tokenData.balance);
                }}
              >
                Max
              </button>
            </div>
          </div>
          <div>
            <div>
              <Input
                type="string"
                label="Receiver Address"
                placeholder={userAddress}
                {...register("receiverAddress")}
                errorMessage={
                  formState.errors?.receiverAddress?.message as string
                }
              />
              <div className="mt-2 text-xs flex gap-x-1">
                {operationKindEnum === UserBalanceOpKind.TRANSFER_INTERNAL ? (
                  !addressRegex.test(receiverAddressValue) ? (
                    <span className="outline-none text-blue8 hover:cursor-not-allowed">
                      View on {explorerData.name}
                    </span>
                  ) : (
                    <a
                      href={explorerData.url}
                      target="_blank"
                      rel="noreferrer"
                      className="outline-none text-blue9 hover:text-amber9"
                    >
                      View on {explorerData.name}
                    </a>
                  )
                ) : (
                  <button
                    type="button"
                    className="outline-none text-blue9 hover:text-amber9"
                    onClick={() => {
                      setValue("receiverAddress", userAddress);
                    }}
                  >
                    Use Current Address
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            {operationKindEnum === UserBalanceOpKind.DEPOSIT_INTERNAL ? (
              <Button type="submit" className="w-full">
                <span>Approve use of {tokenData.tokenInfo.symbol}</span>
              </Button>
            ) : (
              <Button type="submit" className="w-full">
                <span>{title} Internal Balance</span>
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
