import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import React from "react";

interface ICheckbox {
  id: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}

export function Checkbox({ id, checked, onChange, label }: ICheckbox) {
  return (
    <div className="my-1 flex items-center">
      <CheckboxPrimitive.Root
        className="flex h-[15px] w-[15px] appearance-none items-center justify-center rounded-[4px] bg-white shadow-[0_2px_10px] shadow-blackA7 outline-none hover:bg-violet3 focus:shadow-[0_0_0_2px_black]"
        checked={checked}
        onClick={() => onChange()}
        id={id}
      >
        <CheckboxPrimitive.Indicator className="text-violet11">
          <CheckIcon />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <label
        htmlFor={id}
        className="pl-[15px] text-[15px] leading-8 text-white"
      >
        {label}
      </label>
    </div>
  );
}
