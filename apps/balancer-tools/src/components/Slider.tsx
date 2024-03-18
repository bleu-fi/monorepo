"use client";

import { slateDarkA } from "@radix-ui/colors";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import * as SliderPrimitive from "@radix-ui/react-slider";
import React from "react";
import { FieldError, RegisterOptions, useFormContext } from "react-hook-form";

import { cn } from "#/lib/utils";

import { Tooltip } from "./Tooltip";
import { FormControl, FormLabel, FormMessage } from "./ui/form";

interface ISlider
  extends Omit<
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    "name" | "min" | "max" | "defaultValue"
  > {
  name: string;
  unit: string;
  label: string;
  min?: string | number;
  defaultValue?: number;
  max?: string | number;
  validation?: RegisterOptions;
  tooltipText?: string;
  tooltipLink?: string;
}

const BaseSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  Omit<ISlider, "label" | "unit">
>(({ className, min, max, defaultValue, name, ...props }, ref) => {
  const minNumber = Number(min);
  const maxNumber = Number(max);
  const { getValues, setValue } = useFormContext();
  const meanValue = (minNumber + maxNumber) / 2;
  const value = getValues(name) !== undefined ? getValues(name) : meanValue;
  const defaultValueNumber = Number(defaultValue);

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex items-center select-none touch-none w-[200px] h-8 my-4 w-full",
        className,
      )}
      min={minNumber}
      max={maxNumber}
      defaultValue={[defaultValueNumber]}
      onValueChange={(value: unknown[]) => setValue(name, value[0])}
      value={[Number(value)]}
      {...props}
    >
      <SliderPrimitive.Track className="bg-blue4 relative grow rounded-full h-[3px]">
        <SliderPrimitive.Range className="absolute bg-blue7 rounded-full h-full" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className="block size-5 bg-blue7 shadow-[0_2px_10px] shadow-blackA7 rounded-[10px] hover:bg-violet3 focus:outline-none focus:shadow-[0_0_0_5px] focus:shadow-blackA8"
        aria-label="slider-thumb"
      >
        <h1 className="absolute ease-in-out duration-150 opacity-100 -translate-y-8 -translate-x-6 px-5 py-1 bg-blue7 text-center rounded-full text-white whitespace-nowrap text-xs font-bold">
          {value}
        </h1>
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  );
});

BaseSlider.displayName = SliderPrimitive.Root.displayName;

export const Slider = React.forwardRef<HTMLInputElement, ISlider>(
  ({
    name,
    label,
    validation,
    tooltipText,
    tooltipLink,
    unit,
    ...props
  }: ISlider) => {
    const {
      register,
      formState: { errors },
    } = useFormContext();

    if (!name) {
      throw new Error("Input component requires a name prop");
    }

    const error = errors[name] as FieldError | undefined;
    const errorMessage = error?.message;

    return (
      <div className="flex flex-col">
        <div className="flex flex-row justify-between">
          <FormLabel className="mb-2 block text-sm text-slate12">
            {label} {unit ? `(${unit})` : ""}
          </FormLabel>
          {tooltipText && tooltipLink && (
            <Tooltip content={tooltipText}>
              <a href={tooltipLink} target="_blank">
                <InfoCircledIcon color={slateDarkA.slateA11} />
              </a>
            </Tooltip>
          )}
        </div>
        <FormControl>
          <BaseSlider {...props} {...register(name, validation)} />
        </FormControl>
        {errorMessage && (
          <FormMessage className="mt-1 h-6 text-sm text-tomato10">
            <span>{errorMessage}</span>
          </FormMessage>
        )}
      </div>
    );
  },
);
