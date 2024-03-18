"use client";

import Image from "next/image";

import { Button } from "./Button";
import Fathom from "./Fathom";
import { LinkComponent } from "./Link";

export function HomeWrapper({
  isAmmRunning,
  goToSafe = false,
}: {
  isAmmRunning: boolean;
  goToSafe?: boolean;
}) {
  const href = isAmmRunning ? "/manager" : "/new";
  const title = goToSafe
    ? "Open App in Safe"
    : isAmmRunning
      ? "Manage your CoW AMM"
      : "Create a CoW AMM";

  return (
    <div className="flex size-full justify-center">
      <div className="flex flex-col items-center gap-8 justify-center">
        <Image
          src="/assets/cow-amm.svg"
          height={100}
          width={400}
          alt="CoW AMM Logo"
        />
        <h2 className="text-6xl mt-8 leading-snug text-center w-full font-serif">
          The first <i className="text-purple">MEV-Capturing AMM</i>,
          <br /> brought to you by <i className="text-yellow">CoW DAO</i>
        </h2>
        <span className="text-prose w-3/4 text-lg text-center">
          CoW AMM is a production-ready implementation of an FM-AMM that
          supplies liquidity for trades made on CoW Protocol. Solvers compete
          with each other for the right to trade against the AMM
        </span>
        <LinkComponent
          href={
            goToSafe
              ? `https://app.safe.global/share/safe-app?appUrl=https%3A%2F%2Fdeploy-cow-amm.bleu.fi%2F&chain=eth`
              : href
          }
          content={
            <Button
              size="lg"
              className="flex items-center gap-1 py-8 px-7 text-xl"
              title="Go to the app"
            >
              {title}
            </Button>
          }
        />
        <Fathom />
      </div>
    </div>
  );
}
