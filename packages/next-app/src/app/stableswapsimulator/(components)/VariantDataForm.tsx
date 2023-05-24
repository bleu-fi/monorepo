"use client";

import { StableSwapSimulatorDataSchema } from "@balancer-pool-metadata/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Input } from "#/components/Input";
import { Select, SelectItem } from "#/components/Select";
import { AnalysisData, useStableSwap } from "#/contexts/StableSwapContext";

export default function NewDataForm() {
  const {
    baselineData,
    variantData,
    setVariantData,
    setIndexAnalysisToken,
    indexAnalysisToken,
  } = useStableSwap();

  const {
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<typeof StableSwapSimulatorDataSchema._type>({
    resolver: zodResolver(StableSwapSimulatorDataSchema),
    mode: "onChange",
  });

  const handleChange = () => {
    if (Object.keys(errors).length) return;
    const data = getValues();
    setVariantData(data as AnalysisData);
  };

  useEffect(() => {
    if (variantData?.swapFee) setValue("swapFee", variantData?.swapFee);
    if (variantData?.ampFactor) setValue("ampFactor", variantData?.ampFactor);
  }, [variantData]);

  return (
    <div className="flex flex-col gap-4">
      <form id="variant-data-form" />
      <div className="flex flex-col">
        <label className="mb-2 block text-sm text-slate12">
          Analysis Token
        </label>
        <Select
          onValueChange={(i) => setIndexAnalysisToken(Number(i))}
          defaultValue={indexAnalysisToken.toString()}
        >
          {baselineData?.tokens.map(({ symbol }, index) => (
            <SelectItem value={index.toString()}>{symbol}</SelectItem>
          ))}
        </Select>
      </div>
      <Input
        {...register("swapFee", {
          required: true,
          value: variantData?.swapFee,
          valueAsNumber: true,
          onChange: handleChange,
        })}
        label="Swap fee"
        rightLabel={`baseline: ${baselineData?.swapFee}`}
        placeholder="Define the new swap fee"
        errorMessage={errors?.swapFee?.message}
        form="new-data-form"
      />
      <Input
        {...register("ampFactor", {
          required: true,
          value: variantData?.ampFactor,
          valueAsNumber: true,
          onChange: handleChange,
        })}
        label="Amp Factor"
        rightLabel={`baseline: ${baselineData?.ampFactor}`}
        placeholder="Define the new amp factor"
        errorMessage={errors?.ampFactor?.message}
        form="new-data-form"
      />
    </div>
  );
}
