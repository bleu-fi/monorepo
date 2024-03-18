"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { Spinner } from "#/components/Spinner";
import { usePoolSimulator } from "#/contexts/PoolSimulatorContext";

import AnalysisPage from "./(components)/AnalysisPage";

enum dataStatus {
  NONE = "none",
  IMPORTED = "imported",
}

export default function Page() {
  const { isGraphLoading, initialData, isAnalysis } = usePoolSimulator();
  const [poolDataStatus, setPoolDataStatus] = useState<dataStatus>(
    dataStatus.NONE,
  );

  const content = {
    [dataStatus.NONE]: {
      title: "Please set the initial parameters!",
      subtitle: (
        <>
          Alternatively, import parameters from a pool clicking on the search
          button
        </>
      ),
    },
    [dataStatus.IMPORTED]: {
      title: "Your parameters were successfully imported!",
      subtitle: (
        <div className="flex flex-col">
          Feel free to change them or directly go to the next step.
          <span>
            Alternatively, import parameters from another pool clicking on the
            search button
          </span>
        </div>
      ),
    },
  };
  useEffect(() => {
    if (initialData.poolType) {
      setPoolDataStatus(dataStatus.IMPORTED);
    } else {
      setPoolDataStatus(dataStatus.NONE);
    }
  }, [initialData]);

  return isAnalysis ? (
    <AnalysisPage />
  ) : (
    <div className="flex size-full flex-col justify-center rounded-3xl">
      {isGraphLoading || poolDataStatus === dataStatus.NONE ? (
        <Spinner />
      ) : (
        <div className="flex flex-col items-center">
          <div className="text-center text-3xl text-amber9">
            {content[poolDataStatus].title}
          </div>
          <div className="text-center text-lg text-slate11">
            {content[poolDataStatus].subtitle}
          </div>
          <Image
            src={"/assets/connect-wallet.svg"}
            height={500}
            width={500}
            alt=""
          />
        </div>
      )}
    </div>
  );
}
