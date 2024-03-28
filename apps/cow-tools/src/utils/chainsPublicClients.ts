import { createPublicClient, http } from "viem";
import { gnosis, mainnet, sepolia } from "viem/chains";

export type ChainType = typeof mainnet | typeof sepolia | typeof gnosis;

export type ChainName = "mainnet" | "sepolia" | "gnosis";

export type ChainId = typeof mainnet.id | typeof sepolia.id | typeof gnosis.id;

export function createClientForChain(chain: ChainType) {
  return createPublicClient({
    chain,
    transport: http(),
  });
}

export const publicClientsFromNames = {
  mainnet: createClientForChain(mainnet),
  sepolia: createClientForChain(sepolia),
  gnosis: createClientForChain(gnosis),
};

export const publicClientsFromIds = {
  [gnosis.id]: createClientForChain(gnosis),
  [mainnet.id]: createClientForChain(mainnet),
  [sepolia.id]: createClientForChain(sepolia),
} as const;
