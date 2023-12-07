export const ENDPOINT_V3 = "https://api-v3.balancer.fi/graphql";
const BASE_ENDPOINT_V2 =
  "https://api.thegraph.com/subgraphs/name/balancer-labs";

const BASE_REWARDS_ENDPOINT =
  "https://api.thegraph.com/subgraphs/name/bleu-fi/balancer-gauges";
export const NETWORK_TO_BALANCER_ENDPOINT_MAP = {
  ethereum: `${BASE_ENDPOINT_V2}/balancer-v2`,
  polygon: `${BASE_ENDPOINT_V2}/balancer-polygon-v2`,
  "polygon-zkevm":
    "https://api.studio.thegraph.com/query/40456/balancer-gauges-polygon-zk/version/latest",
  arbitrum: `${BASE_ENDPOINT_V2}/balancer-arbitrum-v2`,
  gnosis: `${BASE_ENDPOINT_V2}/balancer-gnosis-chain-v2`,
  optimism: `${BASE_ENDPOINT_V2}/balancer-optimism-v2`,
  base: "https://api.studio.thegraph.com/query/40456/balancer-gauges-base/version/latest",
  avalanche: `${BASE_ENDPOINT_V2}/balancer-avalanche-v2`,
} as const;

export const NETWORK_TO_REWARDS_ENDPOINT_MAP = {
  ethereum: `${BASE_REWARDS_ENDPOINT}`,
  polygon: `${BASE_REWARDS_ENDPOINT}-polygon`,
  "polygon-zkevm":
    "https://api.studio.thegraph.com/query/40456/balancer-gauges-polygon-zk/version/latest",
  arbitrum: `${BASE_REWARDS_ENDPOINT}-arbitrum`,
  gnosis: `${BASE_REWARDS_ENDPOINT}-gnosis`,
  optimism: `${BASE_REWARDS_ENDPOINT}-optimism`,
  base: "https://api.studio.thegraph.com/query/40456/balancer-gauges-base/version/latest",
  avalanche: `${BASE_REWARDS_ENDPOINT}-avalanche`,
};

export const VOTING_GAUGES_QUERY = `
query VeBalGetVotingList {
    veBalGetVotingList {
        chain
        id
        address
        symbol
        type
        gauge {
            address
            isKilled
            addedTimestamp
            relativeWeightCap
        }
        tokens {
            address
            logoURI
            symbol
            weight
        }
    }
}
`;
export const POOLS_WITHOUT_GAUGE_QUERY = `
query PoolsWherePoolType($latestId: String!) {
  pools(
    first: 1000,
    where: {
      id_gt: $latestId,
    }
  ) {
    id
    address
    symbol
    poolType
    createTime
    poolTypeVersion
    tokens {
      isExemptFromYieldProtocolFee
      address
      symbol
      weight
      index
    }
  }
}
`;
export const POOLS_SNAPSHOTS = `
query PoolSnapshots($latestId: String!) {
  poolSnapshots(
    first: 1000,
    where: {
      id_gt: $latestId,
    }
  ) {
    id
    pool {
      id
      protocolYieldFeeCache
      protocolSwapFeeCache
    }
    amounts
    totalShares
    swapVolume
    protocolFee
    swapFees
    liquidity
    timestamp
  }
}
`;

export const RATE_PROVIDER_SNAPSHOTS = `
query PoolRateProviders($latestId: String!) {
  priceRateProviders(
    first: 1000,
    where: {
      id_gt: $latestId,
    }
  ) {
    id
    poolId {
      id
    }
    token {
      address
    }
    address
  }
}
`;

export const POOL_REWARDS = `
query PoolRewards($latestId: ID!) {
  rewardTokenDeposits(where: {rate_gt: 0, totalSupply_gt: 0, id_gt: $latestId}) {
		gauge{
      poolId
    }
    id
    rate
    totalSupply
    periodStart
    periodFinish
  }
}`;
