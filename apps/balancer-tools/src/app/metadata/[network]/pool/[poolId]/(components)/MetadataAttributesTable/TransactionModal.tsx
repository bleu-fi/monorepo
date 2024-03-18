"use client";
import { Address } from "@bleu-fi/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import cn from "clsx";
import { useState } from "react";

import { Button } from "#/components";
import { Toast } from "#/components/Toast";
import {
  STAGE_CN_MAPPING,
  TransactionProgressBar,
} from "#/components/TransactionProgressBar";
import { usePoolMetadata } from "#/contexts/PoolMetadataContext";
import {
  TransactionStatus,
  useMetadataTransaction,
} from "#/hooks/useTransaction";

function ConfirmationAlert({ handleSubmit }: { handleSubmit: () => void }) {
  return (
    <div className="mt-4 px-1">
      <div className="w-full space-y-6">
        <h1 className="my-2 text-xl text-amber9">Are you sure?</h1>
        <span className=" text-slate12">
          This procedure will cost gas fee. You make sure there is no data to
          change before updating.{" "}
        </span>
      </div>
      <div className="mt-7 flex gap-5">
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Cancel</Button>
        </DialogPrimitive.Close>
        <Button shade="light" onClick={() => handleSubmit()}>
          I'm sure
        </Button>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="border-6 mx-2 size-4 animate-spin rounded-full border-solid border-amber10 border-l-slate7"></div>
  );
}

export function ToastContent({
  title,
  description,
  link,
}: {
  title: string;
  description: string;
  link?: string;
}) {
  return (
    <div className="flex h-14 flex-row items-center justify-between px-4 py-8">
      <div className="flex flex-col justify-between space-y-1">
        <h1 className="text-xl font-medium text-slate12">{title}</h1>
        <h3 className="mb-2 leading-3 text-slate11">{description}</h3>
      </div>
      {link && (
        <a target="_blank" href={link} className="text-slate12">
          <ArrowTopRightIcon width={24} height={24} />
        </a>
      )}
    </div>
  );
}

function ProcessTransaction({ poolId }: { poolId: Address }) {
  const { metadata } = usePoolMetadata();
  const {
    handleTransaction,
    isNotifierOpen,
    isTransactionDisabled,
    notification,
    transactionStatus,
    setIsNotifierOpen,
    transactionUrl,
  } = useMetadataTransaction({ poolId, metadata });

  const stage = STAGE_CN_MAPPING[transactionStatus];

  const modalDescription =
    transactionStatus === TransactionStatus.AUTHORIZING ||
    transactionStatus === TransactionStatus.PINNING
      ? "Pinning the JSON file to IPFS will be necessary for your approval."
      : transactionStatus === TransactionStatus.CONFIRMED
        ? "Congratulations, you have updated your pool metadata."
        : "Now, to finishing, confirm on your wallet to set metadata on-chain. ";

  return (
    <div className="mt-4 px-1">
      <div className="w-full space-y-6">
        <span className="my-5 text-lg text-slate12">{modalDescription}</span>
        <div className="mt-44">
          <TransactionProgressBar stage={stage} />
        </div>
        <Toast
          content={
            <ToastContent
              title={notification?.title || ""}
              description={notification?.description || ""}
              link={transactionUrl}
            />
          }
          isOpen={isNotifierOpen}
          setIsOpen={setIsNotifierOpen}
          variant={notification?.variant}
        />

        <div className="flex justify-center">
          <Button
            onClick={handleTransaction}
            disabled={isTransactionDisabled}
            className={cn(
              "flex justify-center items-center",
              isTransactionDisabled
                ? "w-full text-amber10 border border-amber4"
                : "w-full text-slate12 bg-amber4 hover:bg-amber3 focus-visible:bg-amber3 disabled:bg-amber2",
            )}
          >
            {isTransactionDisabled &&
              transactionStatus !== TransactionStatus.CONFIRMED && <Loading />}
            {transactionStatus}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TransactionModal({
  poolId,
}: React.PropsWithChildren<{
  poolId: Address;
}>) {
  const [approved, setApproved] = useState(false);

  function handleSubmit() {
    setApproved(true);
  }

  return approved ? (
    <ProcessTransaction poolId={poolId} />
  ) : (
    <ConfirmationAlert handleSubmit={handleSubmit} />
  );
}
