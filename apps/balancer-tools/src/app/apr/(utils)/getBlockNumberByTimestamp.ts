import { NetworkChainId, networkUrls } from "@bleu-balancer-tools/utils";

import { withCache } from "#/lib/cache";
import { blocks } from "#/lib/gql/server";

const MINUTE_IN_SECONDS = 60;


const getExplorerApiURL = (chainId: NetworkChainId, timestamp: number): string => {
  return networkUrls[chainId].apiUrl + `?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before`;
}

const bestGuess = withCache(async function bestGuessFn(
  chainId: number,
  timestamp: number
): Promise<number> {
  const url = getExplorerApiURL(chainId, timestamp);
  const response = await fetch(url);
  const data = await response.json();
  return parseInt(data.result);
});

function getTimestamps(time: Date): Record<string, string> {
  const timestamp_gte = Math.floor(time.getTime()).toString();
  const timestamp_lt = Math.floor(
    time.getTime() + MINUTE_IN_SECONDS * 10
  ).toString();
  return { timestamp_gte, timestamp_lt };
}

const getBlockNumberByTimestamp = withCache(
  async function getBlockNumberByTimestampFn(
    chain: number,
    endTime: Date
  ): Promise<number> {
    if (endTime > new Date()) {
      return -1;
    }

    const timestamps = getTimestamps(endTime);

    const data = await blocks.gql(String(chain)).Blocks(timestamps);


    if (!data.blocks.length) {
      return bestGuess(chain, parseInt(timestamps.timestamp_gte));
    }

    return parseInt(data.blocks[0].number);
  }
);

export default getBlockNumberByTimestamp;
