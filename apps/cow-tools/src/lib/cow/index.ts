import { gnosis, mainnet, sepolia } from "viem/chains";

const COW_API_BASE_URL = "https://api.cow.fi/";

export const COW_API_URL_BY_CHAIN_ID = {
  [mainnet.id]: COW_API_BASE_URL + "mainnet",
  [gnosis.id]: COW_API_BASE_URL + "xdai",
  [sepolia.id]: COW_API_BASE_URL + "sepolia",
};
