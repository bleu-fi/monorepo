/* eslint-disable no-console */
import { Address } from "@bleu-balancer-tools/utils";
import * as Sentry from "@sentry/nextjs";

import * as balEmissions from "#/lib/balancer/emissions";
import { Pool } from "#/lib/balancer/gauges";
import { withCache } from "#/lib/cache";
import { pools } from "#/lib/gql/server";

import { PoolStatsData, PoolTokens, tokenAPR } from "../api/route";
import { getBALPriceByRound, getTokenPriceByDate } from "./getBALPriceByRound";
import { getPoolRelativeWeight } from "./getRelativeWeight";
import { Round } from "./rounds";
import { getPoolTokensAprForDate } from "./tokenYield";
import { PoolTypeEnum } from "./types";

export interface calculatePoolData extends Omit<PoolStatsData, "apr"> {
  apr: {
    total: number;
    breakdown: {
      veBAL: number | null;
      swapFee: number;
      tokens: {
        total: number;
        breakdown: tokenAPR[];
      };
    };
  };
}

const WEEKS_IN_YEAR = 52;
const SECONDS_IN_DAY = 86400;
const SECONDS_IN_YEAR = 365 * SECONDS_IN_DAY;

const fetchPoolAveragesInRange = withCache(
  async function fetchPoolAveragesInRangeFn(
    poolId: string,
    network: string,
    from: number,
    to: number
  ): Promise<[number, number, string, { symbol: string; balance: string }[]]> {
    const res = await pools.gql(network).poolSnapshotInRange({
      poolId,
      from: from - SECONDS_IN_DAY,
      to,
    });

    res.poolSnapshots = res.poolSnapshots.sort(
      (a, b) => a.timestamp - b.timestamp
    );

    if (res.poolSnapshots.length === 0) {
      return [0, 0, "", []];
    }

    const avgLiquidity =
      res.poolSnapshots.reduce(
        (acc, snapshot) => acc + parseFloat(snapshot.liquidity),
        0
      ) / res.poolSnapshots.length;

    const avgVolume =
      res.poolSnapshots.reduce((sum, current, currentIndex) => {
        if (currentIndex === 0) return 0;

        const currentDayVolume = current.swapVolume;
        const previousDayVolume =
          res.poolSnapshots[currentIndex - 1].swapVolume;

        return sum + (currentDayVolume - previousDayVolume);
      }, 0) /
      (res.poolSnapshots.length - 1);

    return [
      avgLiquidity,
      avgVolume,
      res.poolSnapshots[0].pool.symbol ?? "",
      res.poolSnapshots[0].pool.tokens ?? [],
    ];
  }
);

const calculateTokensStats = async function calculateTokensStatsFn(
  round: Round,
  poolTokenData: PoolTokens[],
  poolNetwork: string,
  tokenBalance: { symbol: string; balance: string }[]
) {
  const tokensPrices = await Promise.all(
    poolTokenData.map(async (token) => {
      const tokenPrice = await getTokenPriceByDate(
        round.endDate,
        token.address,
        parseInt(poolNetwork)
      );
      if (tokenPrice === undefined) {
        console.warn(
          `Failed fetching price for ${token.symbol}, with address ${token.address}`
        );
      }
      //TODO: some work arround to get token price
      return tokenPrice === undefined ? 1 : tokenPrice;
    })
  );

  const totalValue = poolTokenData.reduce((acc, token, idx) => {
    const balance = parseFloat(tokenBalance?.[idx]?.balance);
    if (!isNaN(balance)) {
      return acc + tokensPrices[idx] * balance;
    }
    return acc;
  }, 0);

  const tokenPromises = poolTokenData.map(async (token, idx) => {
    token.price = tokensPrices[idx];
    token.balance = parseFloat(tokenBalance?.[idx]?.balance);
    token.percentageValue =
      ((tokensPrices[idx] * parseFloat(tokenBalance?.[idx]?.balance)) /
        totalValue) *
      100;
    return token;
  });

  return Promise.all(tokenPromises);
}

export const calculatePoolStats = withCache(
  async function calculatePoolStatsFn({
    startDate,
    endDate,
    poolId,
  }: {
    startDate: Date;
    endDate: Date;
    poolId: string;
  }): Promise<calculatePoolData> {
    const pool = new Pool(poolId);
    const network = String(pool.network ?? 1);

    // TODO: decide what to do about rounds altogether
    const round = Round.getRoundByDate(endDate);

    const [
      balPriceUSD,
      [tvl, volume, symbol, tokenBalance],
      votingShare,
      [feeAPR, collectedFeesUSD],
      tokensAPR,
    ] = await Promise.all([
      getBALPriceByRound(startDate, endDate),
      fetchPoolAveragesInRange(
        poolId,
        network,
        startDate.getTime() / 1000,
        endDate.getTime() / 1000
      ),
      getPoolRelativeWeight(poolId, endDate.getTime() / 1000),
      getFeeApr(
        poolId,
        network,
        startDate.getTime() / 1000,
        endDate.getTime() / 1000
      ),
      //TODO: on #BAL-795 use another strategy for cache using the poolId
      getPoolTokensAprForDate(
        network,
        poolId as Address,
        //Currently, this is calculating the APR on the last day of the round.
        //This should be changed on #BAL-799
        round.activeRound
          ? Math.round(new Date().getTime() / 1000)
          : round.endDate.getTime() / 1000
      ),
    ]);

    const tokens = await calculateTokensStats(
      round,
      pool.tokens,
      network,
      tokenBalance
    );

    const apr = calculateRoundAPR(
      round,
      votingShare,
      tvl,
      balPriceUSD,
      feeAPR,
      tokensAPR
    );

    if (apr.total === null || apr.breakdown.veBAL === null) {
      Sentry.captureMessage("vebalAPR resulted in null", {
        level: "warning",
        extra: { balPriceUSD, tvl, votingShare, poolId, apr },
      });
    }

    return {
      roundId: Number(round.value),
      poolId,
      apr,
      balPriceUSD,
      tvl,
      volume,
      votingShare,
      symbol,
      network,
      collectedFeesUSD,
      tokens: tokens as PoolTokens[],
      type: pool.poolType as keyof typeof PoolTypeEnum,
    };
  }
);

function calculateRoundAPR(
  round: Round,
  votingShare: number,
  tvl: number,
  balPriceUSD: number,
  feeAPR: number,
  tokensAPR: tokenAPR[]
) {
  const emissions = balEmissions.weekly(round.endDate.getTime() / 1000);
  const vebalAPR =
    balPriceUSD && tvl && votingShare
      ? ((WEEKS_IN_YEAR * (emissions * votingShare * balPriceUSD)) / tvl) * 100
      : null;

  return {
    //TODO: on #BAL-795 add tokenAPR to the total
    total: (vebalAPR || 0) + feeAPR,
    breakdown: {
      veBAL: vebalAPR,
      swapFee: feeAPR,
      tokens: {
        total: tokensAPR.reduce((acc, token) => acc + token.yield, 0),
        breakdown:
          tokensAPR.map((token) => ({
            address: token.address,
            symbol: token.symbol,
            yield: token.yield,
          })),
      },
    },
  };
}

const getFeeApr = withCache(async function getFeeAprFn(
  poolId: string,
  network: string,
  from: number,
  to: number
): Promise<[number, number]> {
  const lastdayBeforeStartRound = from - SECONDS_IN_DAY;
  const lastdayOfRound = to;

  const res = await pools.gql(network).poolSnapshotInRange({
    poolId,
    from: lastdayBeforeStartRound,
    to: lastdayOfRound,
  });

  const startRoundData = res.poolSnapshots[res.poolSnapshots.length - 1];

  const endRoundData = res.poolSnapshots[0];

  if (!startRoundData || !endRoundData) {
    return [0, 0];
  }

  const feeDiff = endRoundData?.swapFees - startRoundData?.swapFees;

  const feeApr = 10_000 * (feeDiff / endRoundData?.liquidity);
  // reference for 10_000 https://github.com/balancer/balancer-sdk/blob/f4879f06289c6f5f9766ead1835f4f4b096ed7dd/balancer-js/src/modules/pools/apr/apr.ts#L85
  const annualizedFeeApr =
    feeApr *
    (SECONDS_IN_YEAR / (endRoundData?.timestamp - startRoundData?.timestamp));

  return [isNaN(annualizedFeeApr) ? 0 : annualizedFeeApr / 100, feeDiff];
});
