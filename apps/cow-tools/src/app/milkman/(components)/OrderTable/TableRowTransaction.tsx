import { buildBlockExplorerTxUrl } from "@bleu-fi/utils";
import { formatDateToLocalDatetime } from "@bleu-fi/utils/date";
import {
  ArrowTopRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";

import Table from "#/components/Table";
import { IUserMilkmanTransaction } from "#/hooks/useUserMilkmanTransactions";
import { ICowOrder } from "#/lib/cow/fetchCowOrder";
import { fetchTokenInfo } from "#/lib/fetchTokenInfo";
import { ChainId } from "#/utils/chainsPublicClients";
import { cowTokenList } from "#/utils/cowTokenList";

import { SwapStatus, TransactionStatus } from "../../utils/type";
import { CancelButton } from "./CancelButton";
import { TableRowOrder } from "./TableRowOrder";
import { TokenInfo } from "./TokenInfo";

export function TableRowTransaction({
  transaction,
}: {
  transaction: IUserMilkmanTransaction;
}) {
  const [tokenOutAmounts, setTokenOutAmounts] = useState<string[]>();

  useEffect(() => {
    const newTokenOutAmountPromises = transaction.orders.map((order) => {
      const filledCowOrder = order.cowOrders.filter(
        (cowOrder) => cowOrder.status == "fulfilled",
      )[0];

      if (filledCowOrder) {
        return fetchTokenInfo(
          filledCowOrder.buyToken,
          order.orderEvent.chainId as ChainId,
          "decimals",
        ).then((decimals) => {
          return formatUnits(
            BigInt(filledCowOrder.executedBuyAmount || 0),
            decimals as number,
          );
        });
      }
      return Promise.resolve("");
    });

    Promise.all(newTokenOutAmountPromises).then((values) =>
      setTokenOutAmounts(values),
    );
  }, []);

  function getSwapStatus(
    hasToken?: boolean,
    cowOrders?: ICowOrder[],
    transactionProcessed?: boolean,
  ) {
    if (!cowOrders || hasToken === undefined || !transactionProcessed) {
      return SwapStatus.TRANSACTION_ON_QUEUE;
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

    if (
      orderStatus.every((status) => status === SwapStatus.TRANSACTION_ON_QUEUE)
    ) {
      return TransactionStatus.TRANSACTION_ON_QUEUE;
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
    getSwapStatus(order.hasToken, order.cowOrders, transaction.processed),
  );
  const transactionStatus = getTransactionStatus(orderStatus);
  const txUrl = buildBlockExplorerTxUrl({
    chainId: transaction.orders[0].orderEvent.chainId,
    txHash: transaction.id,
  });

  const [showOrdersRows, setShowOrdersRows] = useState(false);

  const equalTokensIn = transaction.orders.every(
    (order) =>
      order.orderEvent.tokenIn?.address ==
      transaction.orders[0].orderEvent.tokenIn?.address,
  );

  const equalTokensOut = transaction.orders.every(
    (order) =>
      order.orderEvent.tokenOut?.address ==
      transaction.orders[0].orderEvent.tokenOut?.address,
  );

  const decimalsTokenIn =
    transaction.orders[0].orderEvent.tokenIn?.decimals ||
    cowTokenList.find(
      (token) =>
        token.address == transaction.orders[0].orderEvent.tokenIn?.address &&
        token.chainId == transaction.orders[0].orderEvent.chainId,
    )?.decimals ||
    1;

  const totalAmountTokenIn = transaction.orders.reduce(
    (acc, order) =>
      acc +
      Number(formatUnits(order.orderEvent.tokenAmountIn, decimalsTokenIn)),
    0,
  );

  const totalAmountTokenOut = tokenOutAmounts?.reduce(
    (acc, amount) => acc + Number(amount),
    0,
  );

  return (
    <>
      <Table.BodyRow key={transaction.id}>
        <Table.BodyCell>
          <button onClick={() => setShowOrdersRows(!showOrdersRows)}>
            {showOrdersRows ? (
              <ChevronUpIcon className="size-5 text-blue9 hover:text-blue10" />
            ) : (
              <ChevronDownIcon className="size-5 text-blue9 hover:text-blue10" />
            )}
          </button>
        </Table.BodyCell>
        <Table.BodyCell>
          {transaction.blockTimestamp
            ? formatDateToLocalDatetime(
                new Date(transaction.blockTimestamp * 1000),
              )
            : "Pending..."}
        </Table.BodyCell>
        <Table.BodyCell>
          <TokenInfo
            id={
              equalTokensIn
                ? transaction.orders[0].orderEvent.tokenIn?.address
                : `0x`
            }
            symbol={
              equalTokensIn
                ? transaction.orders[0].orderEvent.tokenIn?.symbol
                : "Multiple Tokens"
            }
            chainId={transaction.orders[0].orderEvent.chainId}
            amount={equalTokensIn ? totalAmountTokenIn : undefined}
          />
        </Table.BodyCell>
        <Table.BodyCell>
          <TokenInfo
            id={
              equalTokensOut
                ? transaction.orders[0].orderEvent.tokenOut?.address
                : `0x`
            }
            symbol={
              equalTokensOut
                ? transaction.orders[0].orderEvent.tokenOut?.symbol
                : "Multiple Tokens"
            }
            chainId={transaction.orders[0].orderEvent.chainId}
            amount={
              equalTokensOut && transactionStatus === TransactionStatus.EXECUTED
                ? totalAmountTokenOut
                : undefined
            }
          />
        </Table.BodyCell>
        <Table.BodyCell>
          <div className="flex items-center gap-x-1">
            <span>{transactionStatus}</span>
            {txUrl &&
              transactionStatus != TransactionStatus.TRANSACTION_ON_QUEUE && (
                <Link href={txUrl} target="_blank">
                  <ArrowTopRightIcon className="hover:text-slate11" />
                </Link>
              )}
          </div>
        </Table.BodyCell>
        <Table.BodyCell>
          <CancelButton
            disabled={
              ![
                TransactionStatus.ORDER_PLACED,
                TransactionStatus.PARTIALLY_EXECUTED,
                TransactionStatus.MILKMAN_CREATED,
              ].includes(transactionStatus)
            }
            transaction={transaction}
            orderStatus={orderStatus}
          />
        </Table.BodyCell>
      </Table.BodyRow>
      {showOrdersRows &&
        transaction.orders.map((order, index) => (
          <TableRowOrder
            key={order.orderEvent.id}
            order={order}
            orderStatus={orderStatus[index]}
            tokenOutAmount={tokenOutAmounts?.[index]}
          />
        ))}
    </>
  );
}
