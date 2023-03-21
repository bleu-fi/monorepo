import { ENDPOINTS, Network } from "@balancer-admin-tools/balancer-gql/codegen";
import { getSdkWithHooks as arbitrumSdk } from "@balancer-admin-tools/balancer-gql/src/gql/__generated__/arbitrum";
import { getSdkWithHooks as goerliSdk } from "@balancer-admin-tools/balancer-gql/src/gql/__generated__/goerli";
import { getSdkWithHooks as mainnetSdk } from "@balancer-admin-tools/balancer-gql/src/gql/__generated__/mainnet";
import { getSdkWithHooks as polygonSdk } from "@balancer-admin-tools/balancer-gql/src/gql/__generated__/polygon";
import { GraphQLClient } from "graphql-request";

const currentNetwork =
  typeof localStorage !== "undefined"
    ? localStorage.getItem("networkId") ?? "1"
    : "1";

const networkIdEnumMap = {
  "1": Network.mainnet,
  "5": Network.goerli,
  "137": Network.polygon,
  "42161": Network.arbitrum,
};

function networkFor(key: string | number) {
  return (
    networkIdEnumMap[key.toString() as keyof typeof networkIdEnumMap] ||
    Network.mainnet
  );
}

const networkSdks = {
  [Network.mainnet]: mainnetSdk,
  [Network.polygon]: polygonSdk,
  [Network.arbitrum]: arbitrumSdk,
  [Network.goerli]: goerliSdk,
};

const client = new GraphQLClient(ENDPOINTS[networkFor(currentNetwork)]);

const gql = networkSdks[networkFor(currentNetwork)](client);

export default gql;
