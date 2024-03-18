import { Address, buildBlockExplorerAddressURL } from "@bleu-fi/utils";
import { ArrowTopRightIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { formatUnits } from "viem";

import { Dialog } from "#/components/Dialog";
import Table from "#/components/Table";
import { IMilkmanOrder } from "#/hooks/useUserMilkmanTransactions";
import { ChainId } from "#/utils/chainsPublicClients";
import { cowTokenList } from "#/utils/cowTokenList";

import { buildAccountCowExplorerUrl } from "../../utils/cowExplorer";
import { SwapStatus } from "../../utils/type";
import { TokenInfo } from "./TokenInfo";
import { TransactionInfo } from "./TransactionInfo";

export function TableRowOrder({
  order,
  orderStatus,
  tokenOutAmount,
}: {
  order: IMilkmanOrder;
  orderStatus: SwapStatus;
  tokenOutAmount?: string;
}) {
  const cowExplorerUrl = buildAccountCowExplorerUrl({
    chainId: order.orderEvent.chainId as ChainId,
    address: order.orderEvent.orderContract as Address,
  });

  const contractExplorerUrl = buildBlockExplorerAddressURL({
    chainId: order.orderEvent.chainId,
    address: order.orderEvent.orderContract as Address,
  })?.url;

  const tokenInDecimals =
    order.orderEvent.tokenIn?.decimals ||
    cowTokenList.find(
      (token) =>
        token.address == order.orderEvent.tokenIn?.address &&
        token.chainId == order.orderEvent.chainId,
    )?.decimals ||
    1;
  const tokenInAmount = formatUnits(
    order.orderEvent.tokenAmountIn,
    tokenInDecimals,
  );

  return (
    <Table.BodyRow key={order.orderEvent.id} classNames="bg-slate4">
      <Table.BodyCell>
        <Dialog
          customWidth="w-[100vw] max-w-[550px]"
          content={<TransactionInfo order={order.orderEvent} />}
        >
          <button>
            <InfoCircledIcon className="size-5 text-blue9 hover:text-blue10" />
          </button>
        </Dialog>
      </Table.BodyCell>
      <Table.BodyCell />
      <Table.BodyCell>
        <TokenInfo
          id={order.orderEvent.tokenIn?.address}
          symbol={order.orderEvent.tokenIn?.symbol}
          chainId={order.orderEvent.chainId}
          amount={tokenInAmount}
        />
      </Table.BodyCell>
      <Table.BodyCell>
        <TokenInfo
          id={order.orderEvent.tokenOut?.address}
          symbol={order.orderEvent.tokenOut?.symbol}
          chainId={order.orderEvent.chainId}
          amount={tokenOutAmount}
        />
      </Table.BodyCell>
      <Table.BodyCell>
        <div className="flex items-center gap-x-1">
          <span>{orderStatus}</span>
          {cowExplorerUrl &&
            contractExplorerUrl &&
            orderStatus != SwapStatus.TRANSACTION_ON_QUEUE && (
              <Link
                href={
                  orderStatus == SwapStatus.MILKMAN_CREATED ||
                  orderStatus == SwapStatus.CANCELED
                    ? contractExplorerUrl
                    : cowExplorerUrl
                }
                target="_blank"
              >
                <ArrowTopRightIcon className="hover:text-slate11" />
              </Link>
            )}
        </div>
      </Table.BodyCell>
      <Table.BodyCell>
        <span className="sr-only">Cancel</span>
      </Table.BodyCell>
    </Table.BodyRow>
  );
}
