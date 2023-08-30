"use client";

import { networkFor } from "@bleu-balancer-tools/utils";
import {
  ChevronDownIcon,
  DashIcon,
  InfoCircledIcon,
  TriangleDownIcon,
  TriangleUpIcon,
} from "@radix-ui/react-icons";
import Image from "next/image";
import { useState } from "react";

import { Button } from "#/components";
import { Badge } from "#/components/Badge";
import { Spinner } from "#/components/Spinner";
import Table from "#/components/Table";
import { Tooltip } from "#/components/Tooltip";
import { Pool } from "#/lib/balancer/gauges";
import { fetcher } from "#/utils/fetcher";
import { formatNumber } from "#/utils/formatNumber";

import { PoolTypeEnum } from "../../(utils)/calculatePoolStats";
import { formatAPR, formatTVL } from "../../(utils)/formatPoolStats";
import { PoolStatsData, PoolStatsResults } from "../../api/route";

export function PoolListTable({
  roundId,
  initialData,
}: {
  roundId: string;
  initialData: PoolStatsResults;
}) {
  const [tableData, setTableData] = useState(initialData.perRound);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [sortField, setSortField] = useState("apr");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const handleSorting = (sortField: keyof PoolStatsData, sortOrder: string) => {
    if (sortField) {
      setTableData((prevTableData) => {
        const sortedArray = prevTableData.slice().sort((a, b) => {
          const aValue = a[sortField] as number | string;
          const bValue = b[sortField] as number | string;

          // Handle NaN values
          if (typeof aValue === "number" && isNaN(aValue)) return 1;
          if (typeof bValue === "number" && isNaN(bValue)) return -1;

          if (aValue < bValue) {
            return sortOrder === "asc" ? -1 : 1;
          } else if (aValue > bValue) {
            return sortOrder === "asc" ? 1 : -1;
          }
          return 0;
        });

        return sortedArray;
      });
    }
  };

  const handleSortingChange = (accessor: keyof PoolStatsData) => {
    const sortOrder =
      accessor === sortField && order === "desc" ? "asc" : "desc";
    setSortField(accessor);
    setOrder(sortOrder);
    handleSorting(accessor, sortOrder);
  };

  const loadMorePools = async () => {
    setIsLoadingMore(true);
    const aditionalPoolsData = await fetcher<PoolStatsResults>(
      `${
        process.env.NEXT_PUBLIC_SITE_URL
      }/apr/api/?roundId=${roundId}&sort=${sortField}&order=${order}&limit=10&offset=${
        Object.keys(tableData).length
      }&minTvl=1000`,
    );
    setTableData((prevTableData) => {
      return prevTableData.concat(aditionalPoolsData.perRound);
    });
    setIsLoadingMore(false);
  };

  return (
    <div className="flex flex-col justify-center text-white">
      <div className="flex justify-center text-white shadow-lg mb-5">
        <Table color="blue" shade={"darkWithBorder"}>
          <Table.HeaderRow>
            <Table.HeaderCell>Network</Table.HeaderCell>
            <Table.HeaderCell>Composition</Table.HeaderCell>
            <Table.HeaderCell classNames="text-end whitespace-nowrap">
              Type
            </Table.HeaderCell>
            <Table.HeaderCell
              classNames="text-end whitespace-nowrap hover:text-amber9"
              onClick={() => handleSortingChange("tvl")}
            >
              <div className="flex gap-x-1 items-center justify-end">
                <Tooltip
                  content={`This is the TVL calculated at the end of the round`}
                >
                  <InfoCircledIcon />
                </Tooltip>
                <span>TVL</span>
                {sortField == "tvl" ? OrderIcon(order) : OrderIcon("neutral")}
              </div>
            </Table.HeaderCell>
            <Table.HeaderCell
              classNames="text-end whitespace-nowrap hover:text-amber9"
              onClick={() => handleSortingChange("votingShare")}
            >
              <div className="flex gap-x-1 items-center">
                <span>Voting %</span>
                {sortField == "votingShare"
                  ? OrderIcon(order)
                  : OrderIcon("neutral")}
              </div>
            </Table.HeaderCell>
            <Table.HeaderCell
              classNames="text-end whitespace-nowrap hover:text-amber9"
              onClick={() => handleSortingChange("apr")}
            >
              <div className="flex gap-x-1 items-center">
                <Tooltip
                  content={`This is the APR calculate at the end of the round`}
                >
                  <InfoCircledIcon />
                </Tooltip>
                <span> APR</span>
                {sortField == "apr" ? OrderIcon(order) : OrderIcon("neutral")}
              </div>
            </Table.HeaderCell>
          </Table.HeaderRow>
          <Table.Body>
            {tableData.map((pool) => (
              <TableRow
                key={pool.poolId}
                poolId={pool.poolId}
                network={pool.network}
                roundId={roundId}
                tvl={pool.tvl}
                votingShare={pool.votingShare}
                apr={pool.apr.total}
              />
            ))}
            <Table.BodyRow>
              <Table.BodyCell colSpan={6}>
                <Button
                  className="w-full flex content-center justify-center gap-x-3 rounded-t-none rounded-b disabled:cursor-not-allowed"
                  shade="medium"
                  disabled={isLoadingMore}
                  onClick={loadMorePools}
                >
                  {isLoadingMore ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      Load More <ChevronDownIcon />
                    </>
                  )}
                </Button>
              </Table.BodyCell>
            </Table.BodyRow>
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}

function TableRow({
  poolId,
  roundId,
  network,
  tvl,
  votingShare,
  apr,
}: {
  poolId: string;
  roundId: string;
  network: string;
  tvl: number;
  votingShare: number;
  apr: number;
}) {
  const poolRedirectURL = `/apr/pool/${networkFor(
    network,
  )}/${poolId}/round/${roundId}`;
  const pool = new Pool(poolId);
  const tokens = pool.tokens;
  const poolType = pool.poolType as keyof typeof PoolTypeEnum;

  return (
    <Table.BodyRow classNames="hover:bg-blue4 hover:cursor-pointer duration-500">
      <Table.BodyCellLink href={poolRedirectURL} tdClassNames="w-6">
        <Image
          src={`/assets/network/${networkFor(network)}.svg`}
          height={25}
          width={25}
          alt={`Logo for ${networkFor(network)}`}
        />
      </Table.BodyCellLink>
      <Table.BodyCellLink
        href={poolRedirectURL}
        linkClassNames="gap-2"
        tdClassNames="w-11/12"
      >
        {tokens.map((token) => (
          <Badge color="blue">
            {token.symbol}
            {token.weight ? (
              <span className="text-xs ml-1 text-slate-400">
                {(parseFloat(token.weight) * 100).toFixed()}%
              </span>
            ) : (
              ""
            )}
          </Badge>
        ))}
      </Table.BodyCellLink>

      <Table.BodyCellLink linkClassNames="float-right" href={poolRedirectURL}>
        {PoolTypeEnum[poolType]}
      </Table.BodyCellLink>

      <Table.BodyCellLink linkClassNames="float-right" href={poolRedirectURL}>
        {formatTVL(tvl)}
      </Table.BodyCellLink>

      <Table.BodyCellLink linkClassNames="float-right" href={poolRedirectURL}>
        {formatNumber(votingShare * 100).concat("%")}
      </Table.BodyCellLink>

      <Table.BodyCellLink linkClassNames="float-right" href={poolRedirectURL}>
        {formatAPR(apr)}
      </Table.BodyCellLink>
    </Table.BodyRow>
  );
}

function OrderIcon(order: "asc" | "desc" | "neutral") {
  if (order === "asc") {
    return <TriangleUpIcon />;
  } else if (order === "desc") {
    return <TriangleDownIcon />;
  } else {
    return <DashIcon />;
  }
}
