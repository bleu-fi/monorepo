import { Address } from "@bleu-fi/utils";
import { mainnet, sepolia } from "viem/chains";

import { ChainId } from "#/utils/chainsPublicClients";
import { cowTokenList } from "#/utils/cowTokenList";

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

export async function fetchTokenUsdPrice({
  token,
  amount,
  chainId,
}: {
  token: {
    address: Address;
    decimals: number;
    symbol: string;
  };
  amount: number;
  chainId: ChainId;
}): Promise<number | undefined> {
  const chainIdCoinGecko = chainId === sepolia.id ? mainnet.id : chainId;

  // since coingecko can't handle testnet tokens, we use the ethereum version of the token to test
  const address =
    chainId === sepolia.id
      ? cowTokenList.find(
          (cowToken) =>
            cowToken.symbol === token.symbol &&
            cowToken.chainId === chainIdCoinGecko,
        )?.address
      : token.address;
  if (!address) {
    return;
  }

  const params = {
    contract_addresses: address,
    vs_currencies: "usd",
  };

  const url = `${COINGECKO_BASE_URL}/simple/token_price/ethereum/?${new URLSearchParams(
    params,
  )}`;

  return fetch(url)
    .then((res) => res.json())
    .then((res) => {
      return res[address.toLowerCase()]?.usd * amount;
    })
    .catch(() => {
      return undefined;
    });
}
