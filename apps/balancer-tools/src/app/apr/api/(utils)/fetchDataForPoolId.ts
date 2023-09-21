/* eslint-disable no-console */
import { Pool } from "#/lib/balancer/gauges";
import { fetcher } from "#/utils/fetcher";

import { Round } from "../../(utils)/rounds";
import { BASE_URL } from "../../(utils)/types";
import { PoolStatsResults } from "../route";
import { computeAverages } from "./computeAverages";
import { formatDateToMMDDYYYY } from "./date";

export async function fetchDataForPoolId(poolId: string) {
  const pool = new Pool(poolId);
  // TODO: this should be the date the pool had been added
  const gaugeAddedDate = new Date(pool.gauge.addedTimestamp * 1000);
  const roundGaugeAddedStartDate =
    Round.getRoundByDate(gaugeAddedDate).startDate;
  const formattedStartDate = formatDateToMMDDYYYY(roundGaugeAddedStartDate);
  const formattedEndDate = formatDateToMMDDYYYY(new Date());

  try {
    const gaugesData = await fetcher<PoolStatsResults>(
      `${BASE_URL}/apr/api?startAt=${formattedStartDate}&endAt=${formattedEndDate}&poolId=${poolId}`,
    );
    return {
      perDay: gaugesData.perDay,
      average: computeAverages(gaugesData.perDay),
    };
  } catch (error) {
    // TODO: BAL-782 - Add sentry here
    console.error("Error fetching data:", { poolId, error });
    return {
      perDay: {},
      average: {
        apr: {
          total: 0,
          breakdown: {
            veBAL: 0,
            swapFee: 0,
            tokens: {
              total: 0,
              breakdown: [],
            },
          },
        },
        balPriceUSD: 0,
        volume: 0,
        tvl: 0,
      },
    };
  }
}
