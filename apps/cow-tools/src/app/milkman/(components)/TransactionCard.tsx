import { Address, NetworkChainId, networkFor } from "@bleu-fi/utils";
import { useState } from "react";
import { FieldValues } from "react-hook-form";

import { stages } from "#/app/milkman/(components)/SingleOrderForm/TransactionProgressBar";
import { TransactionStatus } from "#/app/milkman/utils/type";
import { useOrder } from "#/contexts/OrderContext";
import { ChainId } from "#/utils/chainsPublicClients";

import { FormHeader } from "./SingleOrderForm/Header";
import { FormOrderOverview } from "./SingleOrderForm/Overview";
import { FormSelectPriceChecker } from "./SingleOrderForm/PriceChecker";
import { OrderSummaryList } from "./SingleOrderForm/Summary";
import { TwapForm } from "./SingleOrderForm/Twap";

export function TransactionCard({
  userAddress,
  chainId,
}: {
  userAddress: Address;
  chainId?: NetworkChainId;
  walletAmount?: string;
  walletAmountBigNumber?: bigint;
}) {
  const { transactionStatus, setTransactionStatus } = useOrder();
  const network = networkFor(chainId);

  const [ordersData, setOrdersData] = useState<FieldValues[]>([]);
  const [currentOrderToEdit, setCurrentOrderToEdit] = useState<number>(0);

  function handleBack() {
    const currentStage = stages.find(
      (stage) => stage.name === transactionStatus,
    );
    setTransactionStatus(currentStage?.previousStage ?? transactionStatus);
  }

  function handleEdit() {
    setTransactionStatus(TransactionStatus.ORDER_OVERVIEW);
  }

  function handleContinue() {
    const currentStage = stages.find(
      (stage) => stage.name === transactionStatus,
    );
    setTransactionStatus(currentStage?.nextStage ?? transactionStatus);
  }

  const replaceOrderDataOnIndex = (data: FieldValues, index: number) => {
    const newOrdersData = [...ordersData];
    newOrdersData[index] = {
      ...newOrdersData[currentOrderToEdit],
      ...data,
    };
    setOrdersData(newOrdersData);
  };

  const FORM_CONTENTS: { [key in TransactionStatus]?: JSX.Element } = {
    [TransactionStatus.ORDER_OVERVIEW]: (
      <FormOrderOverview
        onSubmit={(data: FieldValues) => {
          replaceOrderDataOnIndex(data, currentOrderToEdit);
          handleContinue();
        }}
        userAddress={userAddress}
        defaultValues={ordersData[currentOrderToEdit]}
        chainId={chainId as ChainId}
      />
    ),
    [TransactionStatus.ORDER_STRATEGY]: (
      <FormSelectPriceChecker
        onSubmit={(data: FieldValues) => {
          replaceOrderDataOnIndex(data, currentOrderToEdit);
          handleContinue();
        }}
        defaultValues={ordersData[currentOrderToEdit]}
      />
    ),
    [TransactionStatus.ORDER_TWAP]: (
      <TwapForm
        onSubmit={(data: FieldValues) => {
          replaceOrderDataOnIndex(data, currentOrderToEdit);
          handleContinue();
        }}
        defaultValues={ordersData[currentOrderToEdit]}
        chainId={chainId as ChainId}
      />
    ),
    [TransactionStatus.ORDER_SUMMARY]: (
      <div className="flex flex-col gap-y-6 p-9">
        <OrderSummaryList
          orders={ordersData}
          handleEdit={handleEdit}
          chainId={chainId}
          setCurrentOrderToEdit={setCurrentOrderToEdit}
        />
      </div>
    ),
  };

  return (
    <div className="flex size-full items-center justify-center">
      <div className="my-4 flex flex-col rounded-lg border border-slate7 bg-blue3 text-white">
        <div className="divide-y divide-slate7 h-full">
          <FormHeader
            transactionStatus={transactionStatus}
            network={network}
            onClick={handleBack}
          />
          <div className="flex flex-col overflow-auto size-full max-h-[550px]">
            {FORM_CONTENTS[transactionStatus]}
          </div>
        </div>
      </div>
    </div>
  );
}
