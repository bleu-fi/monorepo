import {
  amberDark,
  blueDark,
  brownDark,
  goldDark,
  greenDark,
  pinkDark,
  purpleDark,
  tomatoDark,
} from "@radix-ui/colors";

import { PlotTitle } from "#/components/Plot";
import { Tooltip } from "#/components/Tooltip";
import { usePoolSimulator } from "#/contexts/PoolSimulatorContext";

import { TokensData } from "../(types)";

const colors = [
  blueDark.blue9,
  amberDark.amber9,
  purpleDark.purple9,
  tomatoDark.tomato9,
  greenDark.green9,
  pinkDark.pink9,
  brownDark.brown9,
  goldDark.gold9,
];

export function TokensDistribution() {
  const { initialData, customData } = usePoolSimulator();
  return (
    <div className="flex w-full lg:w-1/4 flex-col gap-y-4 text-slate12">
      <PlotTitle
        title="Tokens Distribution"
        tooltip="Indicates how much each token balance represent of the pool total"
        justifyCenter={false}
      />
      <div className="flex flex-col">
        <label className="mb-2 block text-sm">Initial Distribution</label>
        <TokenDistributionChart tokens={initialData?.tokens} />
      </div>
      <div className="flex flex-col">
        <label className="mb-2 block text-sm ">Custom Distribution</label>
        <TokenDistributionChart tokens={customData?.tokens} />
      </div>
      <div className="flex flex-row gap-x-2 flex-wrap">
        {initialData?.tokens.map((token, index) => (
          <div
            key={token.symbol}
            className="flex items-center justify-center gap-x-1 text-sm"
          >
            <div
              className="size-3 rounded-full"
              style={{ backgroundColor: colors[index] }}
            />
            {token.symbol}
          </div>
        ))}
      </div>
    </div>
  );
}

function TokenDistributionChart({ tokens }: { tokens: TokensData[] }) {
  const balancesSum = tokens.reduce((sum, tokens) => sum + tokens.balance, 0);
  const balancesPercent = tokens.map(
    (token) => (token.balance * 100) / balancesSum,
  );
  const lastBalanceWidth =
    100 -
    balancesPercent
      .slice(0, -1)
      .reduce((sum, percent) => sum + Math.floor(percent), 0);

  return (
    <div className="flex h-5 w-full flex-1 overflow-hidden rounded-2xl">
      {balancesPercent.map((balancePercent, index) => (
        <Tooltip
          key={tokens[index].symbol}
          content={`${tokens[index].symbol}: ${balancePercent.toFixed(2)}% (${
            tokens[index].balance
          })`}
        >
          <div
            key={tokens[index].symbol}
            className="h-5"
            style={{
              width:
                index + 1 == balancesPercent.length
                  ? `${lastBalanceWidth.toFixed()}%`
                  : `${balancePercent.toFixed()}%`,
              backgroundColor: colors[index],
            }}
          />
        </Tooltip>
      ))}
    </div>
  );
}
