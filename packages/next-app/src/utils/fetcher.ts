import gql from "#/lib/gql";

export async function fetcher<JSON = unknown>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(input, init);
  return res.json();
}

export async function fetchOwnedPools(address: string, chainId: string) {
  if (!address) return { pools: [] };
  const data = await gql(chainId).Pool({
    owner: address,
  });
  return data;
}
