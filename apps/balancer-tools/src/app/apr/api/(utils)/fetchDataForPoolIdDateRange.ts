/* eslint-disable no-console */
import {
  calculatePoolData,
  calculatePoolStats,
} from "../../(utils)/calculatePoolStats";
import { computeAverages } from "./computeAverages";
import { formatDateToMMDDYYYY, generateDateRange } from "./date";

const MAX_RETRIES = 3; // specify the number of retry attempts
const RETRY_DELAY = 1000; // delay between retries in milliseconds

export async function fetchDataForPoolIdDateRange(
  poolId: string,
  startDate: Date,
  endDate: Date,
) {
  const allDaysBetween = generateDateRange(startDate, endDate);
  const perDayData: { [key: string]: calculatePoolData[] } = {};

  for (const dayDate of allDaysBetween) {
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
      try {
        const data = await calculatePoolStats({ startDate, endDate, poolId });
        perDayData[formatDateToMMDDYYYY(dayDate)] = [data] || [];
        break;
      } catch (error) {
        attempts++;
        console.error(
          `Attempt ${attempts} - Error fetching data for pool ${poolId} and date ${formatDateToMMDDYYYY(
            dayDate,
          )}:`,
          error,
        );

        if (attempts >= MAX_RETRIES) {
          // TODO: BAL-782 - Add sentry here
          console.error("Max retries reached. Giving up fetching data.");
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }

  return {
    perDay: perDayData,
    average: computeAverages(perDayData),
  };
}
