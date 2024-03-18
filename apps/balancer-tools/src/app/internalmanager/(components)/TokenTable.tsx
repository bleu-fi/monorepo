"use client";
import { InternalBalanceQuery } from "@bleu-fi/gql/src/balancer/__generated__/Ethereum";
import { Address } from "@bleu-fi/utils";
import { formatNumber } from "@bleu-fi/utils/formatNumber";
import {
  MinusCircledIcon,
  PlusCircledIcon,
  WidthIcon,
} from "@radix-ui/react-icons";
import { upperFirst } from "lodash";
import Image from "next/image";
import { tokenLogoUri } from "public/tokens/logoUri";
import { useAccount, useNetwork } from "wagmi";

import { ToastContent } from "#/app/metadata/[network]/pool/[poolId]/(components)/MetadataAttributesTable/TransactionModal";
import { LinkComponent } from "#/components/Link";
import Table from "#/components/Table";
import { Toast } from "#/components/Toast";
import { useInternalBalance } from "#/contexts/InternalManagerContext";
import { getNetwork } from "#/contexts/networks";
import { internalBalances } from "#/lib/gql";
import { ArrElement, GetDeepProp } from "#/utils/getTypes";
import { refetchRequest } from "#/utils/refetchRequest";

export function TokenTable() {
  const { chain } = useNetwork();
  const { address } = useAccount();

  const addressLower = address ? address?.toLowerCase() : "";

  const { notification, setIsNotifierOpen, isNotifierOpen, transactionUrl } =
    useInternalBalance();

  const { data: internalBalanceData, mutate } = internalBalances
    .gql(chain?.id.toString() || "1")
    .useInternalBalance({
      userAddress: addressLower as Address,
    });

  refetchRequest({
    mutate,
    chainId: chain?.id.toString() || "1",
    userAddress: addressLower as Address,
  });

  const tokensWithBalance = internalBalanceData?.user?.userInternalBalances;

  return (
    <div className="flex size-full flex-1 justify-center text-white">
      {(internalBalanceData?.user === null ||
        tokensWithBalance?.length === 0) && (
        <div className="mt-24 flex flex-col items-center justify-center">
          <div className="text-2xl font-semibold">No tokens found</div>
          <div className="flex flex-col items-center text-sm text-slate11">
            You don&apos;t have any tokens in your internal balance on{" "}
            <span>{chain?.name}, make a deposit or change the network.</span>
          </div>
        </div>
      )}
      {tokensWithBalance && tokensWithBalance?.length > 0 && (
        <Table shade={"darkWithBorder"}>
          <Table.HeaderRow>
            <Table.HeaderCell>
              <span className="sr-only">Token Logo</span>
            </Table.HeaderCell>
            <Table.HeaderCell>Token</Table.HeaderCell>
            <Table.HeaderCell>Balance</Table.HeaderCell>
            <Table.HeaderCell>Manage</Table.HeaderCell>
          </Table.HeaderRow>
          <Table.Body>
            {tokensWithBalance.map((token) => (
              <TableRow
                key={token.tokenInfo?.address}
                token={token}
                chainName={chain!.name}
              />
            ))}
          </Table.Body>
        </Table>
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
    </div>
  );
}

function TableRow({
  token,
  chainName,
}: {
  token: ArrElement<GetDeepProp<InternalBalanceQuery, "userInternalBalances">>;
  chainName: string;
}) {
  const network = getNetwork(chainName);

  return (
    <Table.BodyRow key={token.tokenInfo?.address}>
      <Table.BodyCell customWidth="w-12">
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-white p-1">
            <Image
              src={
                tokenLogoUri[
                  token?.tokenInfo?.symbol as keyof typeof tokenLogoUri
                ] || "/assets/generic-token-logo.png"
              }
              className="rounded-full"
              alt="Token Logo"
              height={28}
              width={28}
              quality={100}
            />
          </div>
        </div>
      </Table.BodyCell>
      <Table.BodyCell>
        {token.tokenInfo?.name} ({token.tokenInfo?.symbol})
      </Table.BodyCell>
      <Table.BodyCell>
        {formatNumber(token.balance, 4, "decimal", "standard")}
      </Table.BodyCell>
      <Table.BodyCell>
        <div className="flex items-center gap-2">
          {transactionButtons.map((button) => (
            <TransactionButton
              key={button.operation}
              tokenAddress={token.tokenInfo?.address as Address}
              icon={button.icon}
              operation={button.operation}
              network={network}
              disabled={button?.disabled}
            />
          ))}
        </div>
      </Table.BodyCell>
    </Table.BodyRow>
  );
}

const transactionButtons = [
  {
    icon: <PlusCircledIcon width={22} height={22} />,
    operation: "deposit",
    disabled: false,
  },
  {
    icon: <MinusCircledIcon width={22} height={22} />,
    operation: "withdraw",
  },
  {
    icon: (
      <div className="flex size-5 items-center justify-center rounded-full border-DEFAULT border-slate9">
        <WidthIcon width={16} height={16} />
      </div>
    ),
    operation: "transfer",
  },
];

function TransactionButton({
  network,
  icon,
  operation,
  disabled = false,
  tokenAddress,
}: {
  network: string;
  icon: React.ReactElement;
  operation: string;
  tokenAddress: Address;
  disabled?: boolean;
}) {
  return (
    <>
      {!disabled ? (
        <LinkComponent
          href={`/internalmanager/${network}/${operation}/token/${tokenAddress}`}
          content={
            <button
              type="button"
              title={upperFirst(operation)}
              className="flex size-[22px] items-center justify-center leading-none"
            >
              {icon}
            </button>
          }
        />
      ) : (
        <button
          type="button"
          title={upperFirst(operation)}
          className="leading-none disabled:cursor-not-allowed disabled:text-slate8"
          disabled={disabled}
        >
          {icon}
        </button>
      )}
    </>
  );
}
