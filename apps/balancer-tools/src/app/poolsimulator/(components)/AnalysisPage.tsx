"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { AlertCard } from "#/components/AlertCard";
import { Spinner } from "#/components/Spinner";
import { Tabs } from "#/components/Tabs";
import { usePoolSimulator } from "#/contexts/PoolSimulatorContext";

import { PoolTypeEnum } from "../(types)";
import { BetaLimits, getBetaLimits } from "../(utils)/getBetaLimits";
import {
  SwapCurveWorkerInputData,
  SwapCurveWorkerOutputData,
} from "../(workers)/swap-curve-calculation";
import { ImpactCurve } from "./Curves/ImpactCurve";
import { SwapCurve } from "./Curves/SwapCurve";
import { DepthCost } from "./DepthCost";
import { SwapSimulator } from "./SwapSimulator";
import { TokensDistribution } from "./TokensDistribution";

const stablePoolTypes = [
  PoolTypeEnum.Fx,
  PoolTypeEnum.MetaStable,
  PoolTypeEnum.GyroE,
];

export interface AmountsData {
  pairTokenSymbol: string;
  analysisTokenIn: number[];
  analysisTokenOut: number[];
  pairTokenIn: number[];
  pairTokenOut: number[];
  betaLimits?: BetaLimits;
}

const createAndPostSwapWorker = (
  messageData: SwapCurveWorkerInputData,
  setInitialAmounts: Dispatch<SetStateAction<AmountsData[]>>,
  setCustomAmounts: Dispatch<SetStateAction<AmountsData[]>>,
) => {
  const worker = new Worker(
    new URL("../(workers)/swap-curve-calculation.ts", import.meta.url),
  );

  worker.onmessage = (event: MessageEvent<SwapCurveWorkerOutputData>) => {
    const result = event.data.result;
    const type = event.data.type;

    if (!result) return;

    const setter = type === "initial" ? setInitialAmounts : setCustomAmounts;

    setter(result);
  };

  worker.postMessage(messageData);
};

export default function Page() {
  const {
    initialData,
    customData,
    initialAnalysisToken,
    customAnalysisToken,
    setCurrentTabTokenByIndex,
    initialCurrentTabToken: { symbol: currentTabTokenSymbol },
  } = usePoolSimulator();
  if (!initialData || !customData) return <Spinner />;

  const [initialAmountsSwapCurve, setInitialAmountsSwapCurve] = useState<
    AmountsData[]
  >([{}] as AmountsData[]);
  const [customAmountsSwapCurve, setCustomAmountsSwapCurve] = useState<
    AmountsData[]
  >([{}] as AmountsData[]);

  useEffect(() => {
    const messages: SwapCurveWorkerInputData[] = [
      {
        analysisToken: initialAnalysisToken,
        data: initialData,
        type: "initial",
      },
      {
        analysisToken: customAnalysisToken,
        data: customData,
        type: "custom",
      },
    ];

    messages.forEach((message) =>
      createAndPostSwapWorker(
        message,
        setInitialAmountsSwapCurve,
        setCustomAmountsSwapCurve,
      ),
    );
  }, [initialData, customData, initialAnalysisToken, customAnalysisToken]);

  const indexCurrentTabToken = initialData?.tokens.findIndex(
    ({ symbol }) =>
      symbol.toLowerCase() !== initialAnalysisToken.symbol.toLowerCase(),
  );
  const tokensSymbol = initialData.tokens.map((token) => token.symbol);
  const tabTokens = tokensSymbol.filter(
    (token) => token !== initialAnalysisToken.symbol,
  );

  function handleTabClick(event: React.FormEvent<HTMLButtonElement>) {
    const target = event.target as HTMLButtonElement;

    setCurrentTabTokenByIndex(tokensSymbol.indexOf(target.innerText));
  }

  const poolTypes = [initialData?.poolType, customData?.poolType];
  const poolsHaveDifferentPurpose =
    poolTypes.filter((type) => stablePoolTypes.includes(type)).length == 1; // length equal one means that

  const selectedInitialAmountsSwapCurve = initialAmountsSwapCurve.filter(
    (amount) => amount.pairTokenSymbol == currentTabTokenSymbol,
  )[0];

  const selectedCustomAmountsSwapCurve = customAmountsSwapCurve.filter(
    (amount) => amount.pairTokenSymbol == currentTabTokenSymbol,
  )[0];

  if (!selectedInitialAmountsSwapCurve || !selectedCustomAmountsSwapCurve)
    return <Spinner />;

  [initialData, customData].forEach((pool, index) => {
    const amountData = [
      selectedInitialAmountsSwapCurve,
      selectedCustomAmountsSwapCurve,
    ][index];
    if (pool.poolType == PoolTypeEnum.Fx && pool.poolParams?.beta) {
      const analysisData = [initialAnalysisToken, customAnalysisToken][index];
      const pairTokens = pool.tokens.filter(
        (token) => token.symbol !== analysisData.symbol,
      );
      pairTokens.forEach((pairToken) => {
        const amounts = [initialAmountsSwapCurve, customAmountsSwapCurve][
          index
        ].filter((amount) => amount.pairTokenSymbol == pairToken.symbol)[0];
        amountData.betaLimits = getBetaLimits({
          ...amounts,
          analysisTokenInitialBalance: analysisData?.balance || 0,
          tabTokenInitialBalance: pairToken?.balance || 0,
          analysisTokenRate: analysisData?.rate || 0,
          tabTokenRate: pairToken?.rate || 0,
          beta: pool.poolParams?.beta || 0,
        });
      });
    }
  });

  return (
    <>
      <div className="flex lg:max-h-[calc(100vh-132px)] w-full flex-col gap-y-20 lg:overflow-auto pr-8 pt-8">
        {/* (h-screen - (header's height + footer's height)) = graph's height space */}
        {poolsHaveDifferentPurpose && (
          <AlertCard
            style="warning"
            title="Pools with purposes"
            message="One of the pools was made for stable assets, while the other for non-stable. This may lead to results with different scale ranges."
          />
        )}
        <div>
          <div className="flex size-full flex-col lg:flex-row gap-5">
            <SwapSimulator />
            <TokensDistribution />
          </div>
        </div>
        <div className="w-full flex justify-center">
          <div className="w-[95%] xl:w-[95%] max-w-[calc(100vw-320px)]">
            <DepthCost
              initialBetaLimits={selectedInitialAmountsSwapCurve.betaLimits}
              customBetaLimits={selectedCustomAmountsSwapCurve.betaLimits}
            />
          </div>
        </div>
        <div className="w-full flex justify-center">
          <div className="w-[95%] xl:w-[95%] max-w-[calc(100vw-320px)]">
            <Tabs
              defaultValue={tokensSymbol[indexCurrentTabToken]}
              value={tokensSymbol[indexCurrentTabToken]}
            >
              <Tabs.ItemTriggerWrapper>
                {tabTokens.map((symbol) => (
                  <Tabs.ItemTrigger
                    tabName={symbol}
                    key={symbol}
                    onClick={handleTabClick}
                  >
                    <span>{symbol}</span>
                  </Tabs.ItemTrigger>
                ))}
              </Tabs.ItemTriggerWrapper>
              {tabTokens.map((symbol) => (
                <div key={symbol}>
                  <Tabs.ItemContent tabName={symbol} classNames="bg-blue1">
                    <div className="flex flex-col gap-y-10 py-4">
                      <SwapCurve
                        initialAmounts={selectedInitialAmountsSwapCurve}
                        customAmounts={selectedCustomAmountsSwapCurve}
                      />
                      <ImpactCurve />
                    </div>
                  </Tabs.ItemContent>
                </div>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
