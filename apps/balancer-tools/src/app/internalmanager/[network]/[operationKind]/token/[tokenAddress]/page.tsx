"use client";

import { SingleInternalBalanceQuery } from "@bleu-fi/gql/src/balancer/__generated__/Ethereum";
import {
  Address,
  addressRegex,
  buildBlockExplorerAddressURL,
  Network,
  NetworkChainId,
  networkFor,
} from "@bleu-fi/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { useAccount, useBalance, useNetwork } from "wagmi";

import { TokenSelect } from "#/app/internalmanager/(components)/TokenSelect";
import { ToastContent } from "#/app/metadata/[network]/pool/[poolId]/(components)/MetadataAttributesTable/TransactionModal";
import { Button } from "#/components";
import { Input } from "#/components/Input";
import { LinkComponent } from "#/components/Link";
import { Spinner } from "#/components/Spinner";
import { Toast } from "#/components/Toast";
import {
  STAGE_CN_MAPPING,
  TransactionProgressBar,
} from "#/components/TransactionProgressBar";
import { Form } from "#/components/ui/form";
import WalletNotConnected from "#/components/WalletNotConnected";
import { useInternalBalance } from "#/contexts/InternalManagerContext";
import { getNetwork } from "#/contexts/networks";
import { useCheckAllowance } from "#/hooks/internalmanager/useCheckAllowance";
import { useManageUserBalance } from "#/hooks/internalmanager/useManageUserBalance";
import { TransactionStatus } from "#/hooks/useTransaction";
import { internalBalances } from "#/lib/gql";
import {
  operationKindType,
  UserBalanceOpKind,
} from "#/lib/internal-balance-helper";
import { getInternalBalanceSchema } from "#/lib/schema";
import { ArrElement, GetDeepProp } from "#/utils/getTypes";
import { refetchRequest } from "#/utils/refetchRequest";

type TokenData = Omit<
  ArrElement<GetDeepProp<SingleInternalBalanceQuery, "userInternalBalances">>,
  "__typename"
>;

export default function Page({
  params,
}: {
  params: {
    tokenAddress: Address;
    network: Network;
    operationKind: keyof typeof operationKindType;
  };
}) {
  const { chain } = useNetwork();
  const [tokenData, setTokenData] = useState<TokenData | undefined>(undefined);
  const { isConnected, isReconnecting, isConnecting } = useAccount();
  const { address } = useAccount();

  const addressLower = address ? address?.toLowerCase() : "";

  const {
    notification,
    clearNotification,
    setIsNotifierOpen,
    isNotifierOpen,
    transactionUrl,
  } = useInternalBalance();

  const { data: internalBalanceTokenData, mutate } = internalBalances
    .gql(chain?.id.toString() || "1")
    .useSingleInternalBalance({
      userAddress: addressLower as Address,
      tokenAddress: params.tokenAddress,
    });

  refetchRequest({
    mutate,
    chainId: chain?.id.toString() || "1",
    userAddress: addressLower as Address,
  });

  const { data: walletAmount } = useBalance({
    address: addressLower as Address,
    token: params.tokenAddress,
  });

  const tokenInfo = internalBalanceTokenData?.user
    ?.userInternalBalances?.[0] || {
    balance: "0",
    tokenInfo: {
      __typename: "Token",
      address: params.tokenAddress,
      decimals: walletAmount?.decimals || 0,
      symbol: walletAmount?.symbol || "",
      name: walletAmount?.symbol || "",
    },
  };

  useEffect(() => {
    setTokenData(tokenInfo);
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

  if (
    (operationKindType[params.operationKind] !== operationKindType.deposit &&
      (tokenData?.balance === "0" ||
        internalBalanceTokenData?.user === null)) ||
    (operationKindType[params.operationKind] === operationKindType.deposit &&
      walletAmount?.value.toString() === "0")
  ) {
    return (
      <div className="flex size-full flex-col items-center rounded-3xl px-12 py-16 md:py-20">
        <div className="text-center text-3xl text-amber9">
          Looks like you don't have this token
        </div>
        <div className="text-xl text-white">
          Please click
          <LinkComponent
            href={`/internalmanager/${network}`}
            content={<span className="text-slate11"> here </span>}
            loaderColor="amber"
          />
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
          userAddress={addressLower as Address}
          tokenData={tokenData}
          chainId={chain?.id}
          walletAmount={walletAmount?.formatted}
          walletAmountBigNumber={walletAmount?.value}
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
  walletAmount,
  walletAmountBigNumber,
}: {
  operationKindParam: string;
  userAddress: Address;
  tokenData: ArrElement<
    GetDeepProp<SingleInternalBalanceQuery, "userInternalBalances">
  >;
  chainId?: NetworkChainId;
  walletAmount?: string;
  walletAmountBigNumber?: bigint;
}) {
  const network = networkFor(chainId);

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

  const { handleTransaction } = useManageUserBalance();
  const { checkAllowance } = useCheckAllowance();

  const InternalBalanceSchema = getInternalBalanceSchema({
    totalBalance:
      operationKindEnum === UserBalanceOpKind.DEPOSIT_INTERNAL
        ? walletAmountBigNumber
        : tokenData.balance,
    userAddress: userAddress,
    operationKind: operationKindParam,
    decimals: tokenData.tokenInfo?.decimals as number,
  });

  const form = useForm({
    resolver: zodResolver(InternalBalanceSchema),
  });
  const { register, setValue, watch } = form;
  const receiverAddressValue = watch("receiverAddress");
  const tokenAmount = watch("tokenAmount");

  useEffect(() => {
    register("receiverAddress");
    setValue("tokenAddress", tokenData.tokenInfo?.address);
  }, []);

  useEffect(() => {
    if (
      operationKindEnum === UserBalanceOpKind.DEPOSIT_INTERNAL &&
      tokenData.tokenInfo?.address
    ) {
      checkAllowance({
        tokenAddress: tokenData.tokenInfo.address as Address,
        tokenAmount,
        tokenDecimals: tokenData.tokenInfo.decimals,
        userAddress,
      });
    }
  }, [tokenAmount]);

  const explorerData = buildBlockExplorerAddressURL({
    chainId,
    address: receiverAddressValue,
  });

  function handleOnSubmit(data: FieldValues) {
    const transactionData = {
      receiverAddress: data.receiverAddress,
      tokenAddress: tokenData.tokenInfo?.address as Address,
      tokenAmount: data.tokenAmount,
      tokenDecimals: tokenData.tokenInfo?.decimals as number,
    };

    handleTransaction({
      data: [transactionData],
      operationKind: operationKindEnum,
      userAddress,
    });
  }

  const { transactionStatus } = useInternalBalance();

  const stage = STAGE_CN_MAPPING[transactionStatus];

  return (
    <div className="flex h-full items-center justify-center">
      <Form
        {...form}
        onSubmit={handleOnSubmit}
        className="my-4 flex size-fit flex-col divide-y divide-slate7 rounded-lg border border-slate7 bg-blue3 text-white"
      >
        <div className="relative flex size-full justify-center">
          <LinkComponent
            loaderColor="amber"
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
                <TokenSelect
                  token={tokenData}
                  operationKind={operationKindParam}
                />
              </div>
              <div className="flex w-1/2 items-end gap-2">
                <div className="w-full">
                  <Input
                    type="string"
                    label="Amount"
                    placeholder={
                      operationKindEnum === UserBalanceOpKind.DEPOSIT_INTERNAL
                        ? walletAmount
                        : tokenData.balance
                    }
                    {...register("tokenAmount")}
                  />
                </div>
              </div>
            </div>
            <div className="mt-2 flex gap-x-1 text-xs">
              <span className="text-slate10">
                {operationKindEnum === UserBalanceOpKind.DEPOSIT_INTERNAL ? (
                  <span>Wallet Balance: {walletAmount}</span>
                ) : (
                  <span>Internal Balance: {tokenData.balance}</span>
                )}
              </span>
              <button
                type="button"
                className="text-blue9 outline-none hover:text-amber9"
                onClick={() => {
                  operationKindEnum === UserBalanceOpKind.DEPOSIT_INTERNAL
                    ? setValue("tokenAmount", walletAmount)
                    : setValue("tokenAmount", tokenData.balance);
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
                label="Recipient"
                placeholder={userAddress}
                {...register("receiverAddress")}
              />
              <div className="mt-2 flex gap-x-1 text-xs">
                {operationKindEnum === UserBalanceOpKind.TRANSFER_INTERNAL &&
                explorerData ? (
                  !addressRegex.test(receiverAddressValue) ? (
                    <span className="text-blue8 outline-none hover:cursor-not-allowed">
                      View on {explorerData.name}
                    </span>
                  ) : (
                    <a
                      href={explorerData.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue9 outline-none hover:text-amber9"
                    >
                      View on {explorerData.name}
                    </a>
                  )
                ) : (
                  <button
                    type="button"
                    className="text-blue9 outline-none hover:text-amber9"
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
          {operationKindEnum === UserBalanceOpKind.DEPOSIT_INTERNAL && (
            <TransactionProgressBar stage={stage} />
          )}
          <div className="flex justify-center">
            <OperationButton
              operationKindEnum={operationKindEnum}
              tokenSymbol={tokenData.tokenInfo?.symbol as string}
              title={title}
            />
          </div>
        </div>
      </Form>
    </div>
  );
}

function OperationButton({
  operationKindEnum,
  tokenSymbol,
  title,
}: {
  operationKindEnum: UserBalanceOpKind;
  tokenSymbol: string;
  title: string;
}) {
  const { transactionStatus, hasEnoughAllowance } = useInternalBalance();

  if (operationKindEnum === UserBalanceOpKind.DEPOSIT_INTERNAL) {
    if (transactionStatus === TransactionStatus.AUTHORIZING) {
      return (
        <Button
          type="submit"
          className="w-full"
          disabled={hasEnoughAllowance === undefined}
        >
          <span>Approve use of {tokenSymbol}</span>
        </Button>
      );
    } else if (transactionStatus === TransactionStatus.WAITING_APPROVAL) {
      return (
        <Button type="submit" className="w-full" disabled>
          <span>Waiting ...</span>
        </Button>
      );
    }
  }

  if (transactionStatus === TransactionStatus.SUBMITTING) {
    return (
      <Button type="submit" className="w-full" disabled>
        <span>Waiting ...</span>
      </Button>
    );
  }
  return (
    <Button
      type="submit"
      className="w-full"
      disabled={transactionStatus === TransactionStatus.CONFIRMED}
    >
      <span>{title} Internal Balance</span>
    </Button>
  );
}
