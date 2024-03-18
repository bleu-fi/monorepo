"use client";

import { capitalize, networksOnBalancer } from "@bleu-fi/utils";
import * as Accordion from "@radix-ui/react-accordion";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import * as Popover from "@radix-ui/react-popover";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useCallback, useEffect, useState } from "react";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "#/components/Accordion";
import { Badge } from "#/components/Badge";
import { Checkbox } from "#/components/Checkbox";
import { BaseInput } from "#/components/Input";

import { INITIAL_MIN_TVL } from "../(utils)/getFilteredUrl";
import { PoolTypeEnum } from "../(utils)/types";

interface SelectedAttributesType {
  [key: string]: string | string[] | null;
  network: string[];
  types: string[];
  minTvl: string | null;
  maxTvl: string | null;
  minApr: string | null;
  maxApr: string | null;
}

export function MoreFiltersButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const filters = [
    {
      name: "network",
      label: "Network",
      options: Object.values(networksOnBalancer).map(capitalize),
    },
    { name: "types", label: "Pool type", options: Object.values(PoolTypeEnum) },
  ];

  const [selectedAttributes, setSelectedAttributes] =
    useState<SelectedAttributesType>({
      network: [] as string[],
      types: [] as string[],
      minTvl: String(INITIAL_MIN_TVL),
      maxTvl: null,
      minApr: null,
      maxApr: null,
    });

  useEffect(() => {
    const valuesAttributes = ["minTvl", "maxTvl", "minApr", "maxApr"];
    const arrayAttributes = ["network", "types"];
    const updatedAttributes = { ...selectedAttributes };
    valuesAttributes.forEach((value) => {
      const paramValue = searchParams.get(value);
      if (paramValue !== null) {
        updatedAttributes[value] = paramValue;
      }
    });

    arrayAttributes.forEach((value) => {
      if (searchParams.has(value)) {
        updatedAttributes[value] = searchParams.get(value)?.split(",") || [];
      }
    });
    setSelectedAttributes(updatedAttributes);
  }, []);

  const pushQueryparamsURL = useCallback(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    Object.entries(selectedAttributes).map(([name, values]) => {
      if (values && values.length) {
        current.set(name, Array.isArray(values) ? values.join(",") : values);
      } else {
        current.delete(name);
      }
    });

    if (!searchParams.has("sort")) {
      current.set("sort", "apr");
      current.set("order", "desc");
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(pathname + query, { scroll: false });
  }, [selectedAttributes]);

  const handleAttributeChange = (type: string, value: string) => {
    setSelectedAttributes((prevAttributes) => {
      const currentAttributes = prevAttributes[type];
      let updatedAttributes;

      if (Array.isArray(currentAttributes)) {
        updatedAttributes = currentAttributes.includes(value)
          ? currentAttributes.filter((v) => v !== value)
          : [...currentAttributes, value];
      } else {
        updatedAttributes = [value];
      }

      return {
        ...prevAttributes,
        [type]: updatedAttributes,
      };
    });
  };

  const handleOnMinMaxChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedAttributes((prevAttributes) => {
      const updatedAttributes = {
        ...prevAttributes,
        [event.target.name]: event.target.value,
      };
      return updatedAttributes;
    });
  };

  useEffect(() => {
    pushQueryparamsURL();
  }, [selectedAttributes]);

  const countNonNullValues = useCallback(
    () =>
      Object.values(selectedAttributes).reduce((count, value) => {
        if (value !== null && (!Array.isArray(value) || value.length > 0)) {
          return count + 1;
        }
        return count;
      }, 0),
    [selectedAttributes],
  );

  return (
    <>
      <Popover.Root>
        <Popover.Trigger asChild>
          <div className="flex sm:h-full items-center gap-x-2 text-sm font-normal text-slate12 bg-blue4 border border-blue6 px-2 rounded-[4px] cursor-pointer select-none h-auto max-h-8">
            <MixerHorizontalIcon />
            <span className="font-medium pr-1"> More Filters</span>
            {!!countNonNullValues() && (
              <Badge size="sm" color="blue">
                {countNonNullValues()}
              </Badge>
            )}
          </div>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            className="PopoverContent"
            sideOffset={5}
          >
            <div className="p-2 flex overflow-y-scroll rounded border-DEFAULT border-blue6 bg-blue3 scrollbar-thin scrollbar-track-blue2 scrollbar-thumb-slate12 w-60">
              <Accordion.Root className="w-full" type="single" collapsible>
                {filters.map(({ name, label, options }) => (
                  <AccordionItem value={label} key={label}>
                    <AccordionTrigger>{label}</AccordionTrigger>
                    <AccordionContent>
                      <div className="ml-2 flex flex-col">
                        {options.map((option) => (
                          <div key={option} className="flex items-center">
                            <Checkbox
                              id={`${name}-${option}`}
                              checked={
                                !!selectedAttributes[name]?.includes(option)
                              }
                              onChange={() =>
                                handleAttributeChange(name, option)
                              }
                              label={option}
                            />
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
                <AccordionItemMinMax
                  name="Tvl"
                  label="TVL"
                  onChange={handleOnMinMaxChange}
                  selectedAttributes={selectedAttributes}
                />
                <AccordionItemMinMax
                  name="Apr"
                  label="APR"
                  onChange={handleOnMinMaxChange}
                  selectedAttributes={selectedAttributes}
                />
              </Accordion.Root>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </>
  );
}

export default function AccordionItemMinMax({
  name,
  label,
  onChange,
  selectedAttributes,
}: {
  name: keyof SelectedAttributesType;
  label: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  selectedAttributes: SelectedAttributesType;
}) {
  return (
    <AccordionItem value={String(name)}>
      <AccordionTrigger>{label}</AccordionTrigger>
      <AccordionContent>
        <div className="py-2 flex flex-col">
          <div className="flex items-center gap-1">
            <BaseInput
              className="flex-1"
              name={`min${name}`}
              placeholder="min"
              onChange={onChange}
              value={selectedAttributes[`min${name}`] || ""}
            />
            <span>-</span>
            <BaseInput
              className="flex-1"
              name={`max${name}`}
              placeholder="max"
              onChange={onChange}
              value={selectedAttributes[`max${name}`] || ""}
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
