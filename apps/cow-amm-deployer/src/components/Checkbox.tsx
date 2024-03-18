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
    <div className="flex items-center">
      <CheckboxPrimitive.Root
        className="flex size-[15px] appearance-none items-center justify-center bg-white outline-none hover:text-foreground ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
        checked={checked}
        onClick={() => onChange()}
        id={id}
      >
        <CheckboxPrimitive.Indicator className="text-brown1">
          <CheckIcon />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <label htmlFor={id} className="pl-[15px] text-[15px] leading-8">
        {label}
      </label>
    </div>
  );
}
