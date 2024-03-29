import { plumDarkA } from "@radix-ui/colors";
import { PlotType } from "plotly.js";

import { PoolStatsResults } from "#/app/apr/(utils)/fetchDataTypes";

import { generateAprCords } from "..";

export default function HistoricalSwapFeeChartData(
  results: PoolStatsResults,
  yaxis: string = "y",
): Plotly.Data {
  const normalBarColor = plumDarkA.plumA9;

  const collectedSwapFeeData = generateAprCords(
    results.perDay,
    (result) => result.collectedFeesUSD,
  );

  const colletedSwapFeePerRoundData = {
    name: "Collected SwapFee",
    yaxis: yaxis,
    hovertemplate: "Fees (USD): %{y:$,.2f}<extra></extra>",
    x: collectedSwapFeeData.x,
    y: collectedSwapFeeData.y,
    marker: {
      color: normalBarColor,
      opacity: 1,
    },
    line: { shape: "linear" } as const,
    type: "bar" as PlotType,
    offsetgroup: 1,
  };
  return colletedSwapFeePerRoundData;
}
