"use client";

import {
  capitalize,
  networkFor,
  networkIdFor,
  networksOnBalancer,
} from "@bleu-balancer-tools/utils";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useState } from "react";

import { Dialog } from "#/components/Dialog";
import { BaseInput } from "#/components/Input";
import { SearchPoolForm } from "#/components/SearchPoolForm";

export default function HeaderEndButton() {
  const { network } = useParams();
  const searchParams = useSearchParams();
  const startAtParam = searchParams.get("startAt");
  const endAtParam = searchParams.get("endAt");

  const router = useRouter();
  const [startAtInput, setStartAtInput] = useState("");
  const [endAtInput, setEndAtInput] = useState("");

  React.useEffect(() => {
    if (startAtParam && endAtParam) {
      setStartAtInput(startAtParam);
      setEndAtInput(endAtParam);
    }
  }, [searchParams]);

  const handlePoolClick = ({
    network,
    poolId,
  }: {
    network: string;
    poolId: string;
  }) => {
    router.push(
      `/apr/pool/${networkFor(
        network,
      )}/${poolId}?startAt=${startAtParam}&endAt=${endAtParam}`,
    );
  };
  const avaliableNetworks = Object.keys(networksOnBalancer).map((key) => ({
    value: key,
    label: capitalize(networksOnBalancer[key]),
  }));
  return (
    <div className="flex gap-6">
      <Dialog
        title="Find pool"
        content={
          <SearchPoolForm
            availableNetworks={avaliableNetworks}
            defaultValueNetwork={networkIdFor(network as string)}
            onSubmit={handlePoolClick}
            showPools
            onlyVotingGauges
          />
        }
      >
        <div className="flex items-center gap-x-2 text-sm font-normal text-slate12 bg-blue4 border border-blue6 px-2 rounded-[4px] cursor-pointer h-[35px]">
          <MagnifyingGlassIcon width="20" height="20" strokeWidth={1} />
          <span className="font-medium pr-1">Find pool</span>
        </div>
      </Dialog>
      <BaseInput
        value={startAtInput}
        onChange={(e) => {
          setStartAtInput((e.target as HTMLInputElement).value);
          router.push(
            `/apr/?startAt=${
              (e.target as HTMLInputElement).value
            }&endAt=${endAtInput}&`,
          );
        }}
      />
      <BaseInput
        value={endAtInput}
        onChange={(e) => {
          setEndAtInput((e.target as HTMLInputElement).value);
          router.push(
            `/apr/?startAt=${startAtInput}&endAt=${
              (e.target as HTMLInputElement).value
            }&`,
          );
        }}
      />
    </div>
  );
}
