import { BASE_URL } from "#/app/apr/(utils)/types";
import { formatDateToMMDDYYYY } from "#/app/apr/api/(utils)/date";
import { PoolStatsData, PoolStatsResults } from "#/app/apr/api/route";
import { trimTrailingValues } from "#/lib/utils";
import { fetcher } from "#/utils/fetcher";

import HistoricalChart from "./HistoricalChart";

export default async function HistoricalCharts({
  startAt,
  endAt,
  poolId,
}: {
  startAt: Date;
  endAt: Date;
  poolId?: string;
}) {
  const url = `${BASE_URL}/apr/api/?poolId=${poolId}&startAt=${formatDateToMMDDYYYY(
    startAt
  )}&endAt=${formatDateToMMDDYYYY(endAt)}`;

  const results: PoolStatsResults = await fetcher(url);

  return (
    <HistoricalChart apiResult={results} startAt={startAt} endAt={endAt} />
  );
}

export function generateAndTrimAprCords(
  data: Record<string, PoolStatsData[]>, // Use Record<string, PoolStatsData[]> for the updated data format
  getValue: (result: PoolStatsData[]) => number,
  valueToTrim: number
): { x: (string | number)[]; y: (string | number)[] } {
  // Change the return type accordingly
  const cords = Object.entries(data).reduce(
    (cords, [date, results]) => {
      // Use destructuring to extract date and results
      cords.x.push(date); // Use date as the x value
      cords.y.push(getValue(results)); // Use map to get y values from each result
      return cords;
    },
    { x: [], y: [] } as { x: string[]; y: number[] }
  );

  const trimmedData = trimTrailingValues(cords.x, cords.y, valueToTrim); // No need to reverse
  return {
    x: trimmedData.trimmedIn,
    y: trimmedData.trimmedOut,
  };
}

export const getRoundName = (roundId?: string | number) =>
  roundId !== undefined ? `#${roundId}` : "#";
