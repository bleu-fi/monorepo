"use client";
import { InternalBalanceQuery } from "@bleu-fi/gql/src/balancer/__generated__/Ethereum";
import { Address, networkFor } from "@bleu-fi/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { tokenLogoUri } from "public/tokens/logoUri";
import { useEffect } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { useAccount, useNetwork } from "wagmi";

import { ToastContent } from "#/app/metadata/[network]/pool/[poolId]/(components)/MetadataAttributesTable/TransactionModal";
import { Button } from "#/components";
import { Input } from "#/components/Input";
import { LinkComponent } from "#/components/Link";
import { Spinner } from "#/components/Spinner";
import Table from "#/components/Table";
import { Toast } from "#/components/Toast";
import { Form } from "#/components/ui/form";
import WalletNotConnected from "#/components/WalletNotConnected";
import { useInternalBalance } from "#/contexts/InternalManagerContext";
import { useManageUserBalance } from "#/hooks/internalmanager/useManageUserBalance";
import { TransactionStatus } from "#/hooks/useTransaction";
import { internalBalances } from "#/lib/gql";
import { UserBalanceOpKind } from "#/lib/internal-balance-helper";
import { AddressSchema } from "#/lib/schema";
import { ArrElement, GetDeepProp } from "#/utils/getTypes";
import { refetchRequest } from "#/utils/refetchRequest";

export function WithdrawAll() {
  const {
    notification,
    setIsNotifierOpen,
    isNotifierOpen,
    transactionUrl,
    clearNotification,
    transactionStatus,
  } = useInternalBalance();
  const { chain } = useNetwork();
  const { isConnected, isReconnecting, isConnecting } = useAccount();
  const { address } = useAccount();

  const addressLower = address ? address?.toLowerCase() : "";

  const network = networkFor(chain?.id);

  const { data: tokenData, mutate } = internalBalances
    .gql(chain?.id.toString() || "1")
    .useInternalBalance({
      userAddress: addressLower as Address,
    });

  refetchRequest({
    mutate,
    chainId: chain?.id.toString() || "1",
    userAddress: addressLower as Address,
  });

  const form = useForm({
    resolver: zodResolver(AddressSchema),
  });

  const { register, setValue } = form;

  const { handleTransaction } = useManageUserBalance();

  function handleOnSubmit(data: FieldValues) {
    if (!tokenData?.user?.userInternalBalances) return;
    const tokenInfo = tokenData.user.userInternalBalances.map((token) => {
      return {
        tokenAddress: token.tokenInfo?.address as Address,
        tokenDecimals: token.tokenInfo?.decimals as number,
        tokenAmount: token.balance,
        receiverAddress: data.receiverAddress,
      };
    });
    handleTransaction({
      data: tokenInfo,
      operationKind: UserBalanceOpKind.WITHDRAW_INTERNAL,
      userAddress: addressLower as Address,
    });
  }

  useEffect(() => {
    clearNotification();
  }, [isConnecting, addressLower]);

  if (!isConnected && !isReconnecting && !isConnecting) {
    return <WalletNotConnected isInternalManager />;
  }

  if (isConnecting || isReconnecting || !tokenData) {
    return <Spinner />;
  }

  return (
    <div className="flex h-full items-center justify-center">
      <Form
        onSubmit={handleOnSubmit}
        className="my-4 flex size-fit flex-col divide-y divide-slate7 rounded-lg border border-slate7 bg-blue3 text-white"
        {...form}
      >
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
            loaderColor="amber"
          />
          <div className="flex min-w-[530px] flex-col items-center py-3">
            <div className="text-xl">Batch Withdraw from Internal Balances</div>
          </div>
        </div>
        <div className="flex flex-col gap-y-6 p-9">
          <div>
            <span className="block text-sm text-slate12">Summary</span>
            <Table color="blue">
              <Table.Body>
                {tokenData?.user?.userInternalBalances?.map(
                  (
                    token: ArrElement<
                      GetDeepProp<InternalBalanceQuery, "userInternalBalances">
                    >,
                  ) => (
                    <Table.BodyRow key={token.tokenInfo?.address}>
                      <Table.BodyCell customWidth="w-12">
                        <Image
                          src={
                            tokenLogoUri[
                              token?.tokenInfo
                                ?.symbol as keyof typeof tokenLogoUri
                            ] || "/assets/generic-token-logo.png"
                          }
                          className="rounded-full"
                          alt="Token Logo"
                          height={28}
                          width={28}
                          quality={100}
                        />
                      </Table.BodyCell>
                      <Table.BodyCell>
                        <div className="flex flex-col">
                          <div className="text-sm font-medium">
                            {token.tokenInfo?.name} ({token.tokenInfo?.symbol})
                          </div>
                        </div>
                      </Table.BodyCell>
                      <Table.BodyCell>
                        <div className="flex flex-col">
                          <div className="text-sm font-medium">
                            {token.balance}
                          </div>
                        </div>
                      </Table.BodyCell>
                    </Table.BodyRow>
                  ),
                )}
              </Table.Body>
            </Table>
          </div>
          <div>
            <Input
              type="string"
              label="Recipient"
              placeholder={addressLower}
              {...register("receiverAddress")}
            />
            <div className="mt-2 flex gap-x-1 text-xs">
              <button
                type="button"
                className="text-blue9 outline-none hover:text-amber9"
                onClick={() => {
                  setValue("receiverAddress", addressLower);
                }}
              >
                Use Current Address
              </button>
            </div>
          </div>
          <div className="flex justify-center">
            <Button type="submit" className="w-full">
              <span>
                {transactionStatus === TransactionStatus.SUBMITTING
                  ? "Waiting ..."
                  : "Withdraw All Internal Balance"}
              </span>
            </Button>
          </div>
        </div>
      </Form>
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
    </div>
  );
}
