import { formatNumber } from "@bleu/ui";
import { useAccount } from "wagmi";

import { TokenLogo } from "#/components/TokenLogo";
import { IToken, ITokenExtended } from "#/lib/fetchAmmData";
import { ChainId } from "#/utils/chainsPublicClients";

export function TokenInfo({
  token,
  showBalance = true,
}: {
  token: IToken | ITokenExtended;
  showBalance?: boolean;
}) {
  const { chainId } = useAccount();
  return (
    <div className="flex items-center gap-x-1">
      <div className="flex items-center justify-center">
        <div className="rounded-full bg-white p-1">
          <TokenLogo
            tokenAddress={token.address}
            chainId={chainId as ChainId}
            className="rounded-full"
            alt="Token Logo"
            height={22}
            width={22}
            quality={100}
          />
        </div>
      </div>
      {token.symbol}{" "}
      {"balance" in token &&
        showBalance &&
        `(${formatNumber(token.balance, 4, "decimal", "compact", 0.001)})`}
    </div>
  );
}
