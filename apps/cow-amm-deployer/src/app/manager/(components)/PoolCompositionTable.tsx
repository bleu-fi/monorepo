import { formatNumber } from "@bleu-fi/utils/formatNumber";
import { tomatoDark } from "@radix-ui/colors";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { formatUnits } from "viem";

import Table from "#/components/Table";
import { Tooltip } from "#/components/Tooltip";
import { ICowAmm } from "#/lib/types";

import { TokenInfo } from "./TokenInfo";

export function PoolCompositionTable({ cowAmm }: { cowAmm: ICowAmm }) {
  const anyTokenWithoutUsdPrice =
    !cowAmm.token0.externalUsdPrice || !cowAmm.token1.externalUsdPrice;
  return (
    <Table
      color="foreground"
      shade="darkWithBorder"
      classNames="overflow-y-auto text-background"
    >
      <Table.HeaderRow>
        <Table.HeaderCell>Tokens</Table.HeaderCell>
        <Table.HeaderCell>Balance</Table.HeaderCell>
        <Table.HeaderCell>Price</Table.HeaderCell>
        <Table.HeaderCell>Value</Table.HeaderCell>
        <Table.HeaderCell>Weight</Table.HeaderCell>
      </Table.HeaderRow>
      <Table.Body>
        {[cowAmm.token0, cowAmm.token1].map((token) => {
          const valuePct =
            (Number(token.externalUsdValue) * 100) / cowAmm.totalUsdValue;
          return (
            <Table.BodyRow key={token.tokenInfo.address}>
              <Table.BodyCell>
                <TokenInfo
                  symbol={token.tokenInfo.symbol}
                  id={token.tokenInfo.address}
                  logoUri={token.tokenInfo.logoUri}
                />
              </Table.BodyCell>
              <Table.BodyCell>
                {formatNumber(
                  formatUnits(BigInt(token.balance), token.tokenInfo.decimals),
                  4,
                )}
              </Table.BodyCell>
              <Table.BodyCell>
                <div className="flex items-center flex-row gap-2">
                  <>$ {formatNumber(token.externalUsdPrice, 4)} </>
                  {!token.externalUsdPrice && <PriceErrorTooltip />}
                </div>
              </Table.BodyCell>
              <Table.BodyCell>
                <div className="flex items-center flex-row gap-2">
                  <>
                    ${" "}
                    {formatNumber(
                      token.externalUsdValue,
                      2,
                      "decimal",
                      "compact",
                      0.01,
                    )}
                  </>
                  {!token.externalUsdPrice && <PriceErrorTooltip />}
                </div>
              </Table.BodyCell>
              <Table.BodyCell>
                <div className="flex items-center flex-row gap-2">
                  <>
                    {anyTokenWithoutUsdPrice ? "-" : formatNumber(valuePct, 2)}{" "}
                    {valuePct && !anyTokenWithoutUsdPrice ? "%" : ""}
                  </>
                  {!token.externalUsdPrice && <PriceErrorTooltip />}
                </div>
              </Table.BodyCell>
            </Table.BodyRow>
          );
        })}
      </Table.Body>
    </Table>
  );
}

function PriceErrorTooltip() {
  return (
    <Tooltip content="Error fetching token USD price">
      <InfoCircledIcon className="size-4" color={tomatoDark.tomato10} />
    </Tooltip>
  );
}
