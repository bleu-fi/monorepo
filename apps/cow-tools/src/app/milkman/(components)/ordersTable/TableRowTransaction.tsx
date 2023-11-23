import { buildBlockExplorerTxUrl } from "@bleu-fi/utils";
import { formatNumber } from "@bleu-fi/utils/formatNumber";
import {
  ArrowTopRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";
import { useState } from "react";
import { formatUnits } from "viem";

import Table from "#/components/Table";
import {
  ICowOrder,
  IUserMilkmanTransaction,
} from "#/hooks/useUserMilkmanTransactions";

import { SwapStatus, TransactionStatus } from "../../utils/type";
import { CancelButton } from "./CancelButton";
import { TableRowOrder } from "./TableRowOrder";
import { TokenInfo } from "./TokenInfo";

export function TableRowTransaction({
  transaction,
}: {
  transaction: IUserMilkmanTransaction;
}) {
  function getSwapStatus(hasToken?: boolean, cowOrders?: ICowOrder[]) {
    if (!cowOrders || hasToken === undefined) {
      return SwapStatus.MILKMAN_CREATED;
    }

    const anyOrderWasExecuted = cowOrders.some(
      (order) => order.status == "fulfilled",
    );

    if (anyOrderWasExecuted) {
      return SwapStatus.EXECUTED;
    }

    if (!anyOrderWasExecuted && !hasToken) {
      return SwapStatus.CANCELED;
    }

    if (cowOrders.length > 0 && hasToken) {
      return SwapStatus.ORDER_PLACED;
    }

    return SwapStatus.MILKMAN_CREATED;
  }

  function getTransactionStatus(orderStatus: SwapStatus[]) {
    if (orderStatus.every((status) => status === SwapStatus.CANCELED)) {
      return TransactionStatus.CANCELED;
    }
    if (orderStatus.every((status) => status === SwapStatus.EXECUTED)) {
      return TransactionStatus.EXECUTED;
    }

    if (
      orderStatus.every(
        (status) =>
          status === SwapStatus.CANCELED || status === SwapStatus.EXECUTED,
      )
    ) {
      return TransactionStatus.EXECUTED_AND_CANCELED;
    }
    if (orderStatus.some((status) => status === SwapStatus.EXECUTED)) {
      return TransactionStatus.PARTIALLY_EXECUTED;
    }

    const allOrdersPlaced = orderStatus.every(
      (status) => status === SwapStatus.ORDER_PLACED,
    );

    if (allOrdersPlaced) {
      return TransactionStatus.ORDER_PLACED;
    }

    return TransactionStatus.MILKMAN_CREATED;
  }

  const orderStatus = transaction.orders.map((order) =>
    getSwapStatus(order.hasToken, order.cowOrders),
  );
  const transactionStatus = getTransactionStatus(orderStatus);
  const txUrl = buildBlockExplorerTxUrl({
    chainId: transaction.orders[0].orderEvent.chainId,
    txHash: transaction.id,
  });

  const [showOrdersRows, setShowOrdersRows] = useState(false);

  const equalTokensIn = transaction.orders.every(
    (order) =>
      order.orderEvent.tokenIn?.id ==
      transaction.orders[0].orderEvent.tokenIn?.id,
  );

  const equalTokensOut = transaction.orders.every(
    (order) =>
      order.orderEvent.tokenOut?.id ==
      transaction.orders[0].orderEvent.tokenOut?.id,
  );

  const decimalsTokenIn =
    transaction.orders[0].orderEvent.tokenIn?.decimals || 18;

  const totalAmountTokenIn = transaction.orders.reduce(
    (acc, order) =>
      acc +
      Number(formatUnits(order.orderEvent.tokenAmountIn, decimalsTokenIn)),
    0,
  );

  return (
    <>
      <Table.BodyRow key={transaction.id}>
        <Table.BodyCell>
          <button onClick={() => setShowOrdersRows(!showOrdersRows)}>
            {showOrdersRows ? (
              <ChevronUpIcon className="h-5 w-5 text-blue9 hover:text-blue10" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-blue9 hover:text-blue10" />
            )}
          </button>
        </Table.BodyCell>
        <Table.BodyCell>
          {equalTokensIn ? (
            <TokenInfo
              id={transaction.orders[0].orderEvent.tokenIn?.id}
              symbol={transaction.orders[0].orderEvent.tokenIn?.symbol}
              chainId={transaction.orders[0].orderEvent.chainId}
            />
          ) : (
            "Multiple Tokens"
          )}
        </Table.BodyCell>
        <Table.BodyCell>
          {equalTokensIn
            ? formatNumber(totalAmountTokenIn, 4, "decimal", "standard", 0.0001)
            : "Multiple Tokens"}
        </Table.BodyCell>
        <Table.BodyCell>
          {equalTokensOut ? (
            <TokenInfo
              id={transaction.orders[0].orderEvent.tokenOut?.id}
              symbol={transaction.orders[0].orderEvent.tokenOut?.symbol}
              chainId={transaction.orders[0].orderEvent.chainId}
            />
          ) : (
            "Multiple Tokens"
          )}
        </Table.BodyCell>
        <Table.BodyCell>
          <div className="flex items-center gap-x-1">
            <span>{transactionStatus}</span>
            {txUrl && (
              <Link href={txUrl} target="_blank">
                <ArrowTopRightIcon className="hover:text-slate11" />
              </Link>
            )}
          </div>
        </Table.BodyCell>
        <Table.BodyCell>
          <CancelButton
            disabled={[
              TransactionStatus.EXECUTED,
              TransactionStatus.CANCELED,
              TransactionStatus.EXECUTED_AND_CANCELED,
            ].includes(transactionStatus)}
            transaction={transaction}
          />
        </Table.BodyCell>
      </Table.BodyRow>
      {showOrdersRows &&
        transaction.orders.map((order, index) => (
          <TableRowOrder
            key={order.orderEvent.id}
            order={order.orderEvent}
            orderStatus={orderStatus[index]}
          />
        ))}
    </>
  );
}