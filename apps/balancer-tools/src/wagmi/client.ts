import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { publicProvider } from "@wagmi/core/providers/public";
import { configureChains, createConfig } from "wagmi";
import {
  arbitrum,
  gnosis as gnosisChain,
  goerli,
  mainnet,
  optimism,
  polygon,
  polygonZkEvm as polygonZkEvmChain,
  sepolia,
} from "wagmi/chains";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

/**
 * Project ID is required by Rainbowkit Migration Guide to Viem
 * 2. Supply a WalletConnect Cloud projectId
 * https://www.rainbowkit.com/docs/migration-guide#2-supply-a-walletconnect-cloud-projectid
 * Credentials for WalletConnect are available at 1Password
 */

const projectId = "4f98524b2b9b5a80d14a519a8dcbecc2";

const gnosis = {
  ...gnosisChain,
  iconUrl:
    "https://cdn.sanity.io/images/r2mka0oi/production/bf37b9c7fb36c7d3c96d3d05b45c76d89072b777-1800x1800.png",
};

const polygonZkEvm = {
  ...polygonZkEvmChain,
  iconUrl:
    "https://raw.githubusercontent.com/balancer/frontend-v2/a53e98f1bd44b17cf002616100d23f8c1065f7b1/src/assets/images/icons/networks/zkevm.svg",
};

const RPC_ENDPOINT_MAP = {
  [mainnet.id]: "https://eth.llamarpc.com",
  [optimism.id]: "https://optimism.meowrpc.com",
  [arbitrum.id]: "https://arb1.arbitrum.io/rpc",
  [goerli.id]: "https://ethereum-goerli.publicnode.com",
  [gnosis.id]: "https://rpc.ankr.com/gnosis",
  [polygon.id]: "https://polygon.llamarpc.com",
  [polygonZkEvm.id]: "https://1rpc.io/zkevm",
  [sepolia.id]: "https://endpoints.omniatech.io/v1/eth/sepolia/public",
} as const;

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon, gnosis, arbitrum, optimism, polygonZkEvm, goerli, sepolia],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: RPC_ENDPOINT_MAP[chain.id as keyof typeof RPC_ENDPOINT_MAP],
      }),
    }),
    publicProvider(),
  ],
  { retryCount: 5 },
);

const { connectors } = getDefaultWallets({
  appName: "Balancer Tools",
  projectId,
  chains,
});

export const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});
