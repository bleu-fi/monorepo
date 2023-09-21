export { default as parseFixed } from "./parseFixed";

export type Address = `0x${string}`;

export enum Network {
  Ethereum = "ethereum",
  Polygon = "polygon",
  Arbitrum = "arbitrum",
  Gnosis = "gnosis",
  Optimism = "optimism",
  Goerli = "goerli",
  Sepolia = "sepolia",
  PolygonZKEVM = "polygon-zkevm",
  Base = "base",
  Avalanche = "avax",
}

export enum NetworkChainId {
  ETHEREUM = 1,
  POLYGON = 137,
  ARBITRUM = 42_161,
  GNOSIS = 100,
  OPTIMISM = 10,
  GOERLI = 5,
  SEPOLIA = 11_155_111,
  POLYGONZKEVM = 1_101,
  BASE = 8453,
  AVAX = 43114,
}

export const networkUrls = {
  [NetworkChainId.ETHEREUM]: {
    url: "https://etherscan.io/",
    apiUrl: "https://api.etherscan.io/api",
    name: "Etherscan",
  },
  [NetworkChainId.POLYGON]: {
    url: "https://polygonscan.com/",
    apiUrl: "https://api.polygonscan.com/api",
    name: "Polygon Chain Explorer",
  },
  [NetworkChainId.ARBITRUM]: {
    url: "https://arbiscan.io/",
    apiUrl: "https://api.arbiscan.io/api",
    name: "Arbitrum Chain Explorer",
  },
  [NetworkChainId.GNOSIS]: {
    url: "https://gnosisscan.io/",
    apiUrl: "https://api.gnosisscan.io/api",
    name: "Gnosis Chain Explorer",
  },
  [NetworkChainId.OPTIMISM]: {
    url: "https://optimistic.etherscan.io/",
    apiUrl: "https://api.optimistic.etherscan.io/api",
    name: "Optimistic Chain Explorer",
  },
  [NetworkChainId.GOERLI]: {
    url: "https://goerli.etherscan.io/",
    apiUrl: "https://api.goerli.etherscan.io/api",
    name: "Goerli Chain Explorer",
  },
  [NetworkChainId.SEPOLIA]: {
    url: "https://sepolia.etherscan.io/",
    apiUrl: "https://api.sepolia.etherscan.io/api",
    name: "Sepolia Chain Explorer",
  },
  [NetworkChainId.POLYGONZKEVM]: {
    url: "https://zkevm.polygonscan.com/",
    apiUrl: "https://api.zkevm.polygonscan.com/api",
    name: "Polygon zkEVM Chain Explorer",
  },
  [NetworkChainId.BASE]: {
    url: "https://basescan.org/",
    apiUrl: "https://api.basescan.org/api",
    name: "Base Chain Explorer",
  },
  [NetworkChainId.AVAX]: {
    url: "https://snowtrace.io/",
    apiUrl: "https://api.snowtrace.io/api",
    name: "Avalanche C-Chain Explorer",
  },
} as const;

export function buildBlockExplorerTxUrl({
  chainId,
  txHash,
}: {
  chainId?: NetworkChainId;
  txHash: Address;
}) {
  if (!chainId) return undefined;
  const networkUrl = networkUrls[chainId as keyof typeof networkUrls];
  return `${networkUrl.url}tx/${txHash}`;
}

export function buildBlockExplorerTokenURL({
  chainId,
  tokenAddress,
}: {
  chainId?: NetworkChainId;
  tokenAddress: Address;
}) {
  if (!chainId) return undefined;
  const networkUrl = networkUrls[chainId as keyof typeof networkUrls];
  return `${networkUrl.url}token/${tokenAddress}`;
}

export function buildBlockExplorerAddressURL({
  chainId,
  address,
}: {
  chainId?: NetworkChainId;
  address: Address;
}) {
  if (!chainId) return undefined;
  const networkUrl = networkUrls[chainId as keyof typeof networkUrls];
  return {
    url: `${networkUrl.url}address/${address}`,
    name: networkUrl.name,
  };
}

export const DELEGATE_OWNER = "0xBA1BA1ba1BA1bA1bA1Ba1BA1ba1BA1bA1ba1ba1B";

// TODO: is this still supposed to be here?
export const networkMultisigs = {
  [Network.Ethereum]: "0x10A19e7eE7d7F8a52822f6817de8ea18204F2e4f",
  [Network.Polygon]: "0xeE071f4B516F69a1603dA393CdE8e76C40E5Be85",
  [Network.Arbitrum]: "0xaF23DC5983230E9eEAf93280e312e57539D098D0",
};

export const networkIdEnumMap = {
  "1": Network.Ethereum,
  "137": Network.Polygon,
  "42161": Network.Arbitrum,
  "100": Network.Gnosis,
  "10": Network.Optimism,
  "5": Network.Goerli,
  "11155111": Network.Sepolia,
  "1101": Network.PolygonZKEVM,
  "43114": Network.Avalanche,
  "8453": Network.Base,
};

const filteredKeys = [
  String(NetworkChainId.ETHEREUM),
  String(NetworkChainId.OPTIMISM),
  String(NetworkChainId.GNOSIS),
  String(NetworkChainId.POLYGON),
  String(NetworkChainId.POLYGONZKEVM),
  String(NetworkChainId.ARBITRUM),
  String(NetworkChainId.AVAX),
  String(NetworkChainId.BASE),
];

export const networksOnBalancer = Object.fromEntries(
  Object.entries(networkIdEnumMap).filter(([key]) =>
    filteredKeys.includes(key),
  ),
);

export function networkFor(key?: string | number) {
  if (!key) {
    return Network.Ethereum;
  }
  return networkIdEnumMap[key.toString() as keyof typeof networkIdEnumMap];
}

export function networkIdFor(name?: string) {
  if (!name) {
    return "1";
  }

  return unsafeNetworkIdFor(name) || "1";
}

export function unsafeNetworkIdFor(name: string) {
  return Object.keys(networkIdEnumMap).find(
    (key) => networkIdEnumMap[key as keyof typeof networkIdEnumMap] === name,
  );
}

export function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export const addressRegex = /0x[a-fA-F0-9]{40}$/;

/**
 * Formats a date in the "Month Day, Year" (American) format.
 *
 * @param {Date} date - The input date to be formatted.
 * @returns {string} A string representing the formatted date.
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
