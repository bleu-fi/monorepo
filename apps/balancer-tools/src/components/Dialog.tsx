"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import cn from "clsx";
import * as React from "react";

export function Dialog({
  children,
  content,
  title,
  subtitle,
  customWidth,
  noPadding = false,
  isOpen,
  setIsOpen,
  onClose,
}: React.PropsWithChildren<{
  content: React.ReactElement;
  title?: string;
  subtitle?: string;
  customWidth?: string;
  noPadding?: boolean;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  onClose?: (event: Event) => void;
}>) {
  const [open, setOpen] = React.useState(false);
  const isDialogOpen = isOpen ?? open;
  const isDialogSetOpen = setIsOpen ?? setOpen;
  return (
    <DialogPrimitive.Root open={isDialogOpen} onOpenChange={isDialogSetOpen}>
      <DialogPrimitive.Trigger asChild>{children}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          id="dialog-overlay"
          className={cn(
            "bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-blue3 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none",
            customWidth ? customWidth : "w-[90vw] max-w-[450px]",
            noPadding ? "p-0" : "p-[25px]",
          )}
          onCloseAutoFocus={onClose}
        >
          <DialogPrimitive.Title className="text-2xl font-medium text-slate12">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="text-base text-slate11">
            {subtitle}
          </DialogPrimitive.Description>

          <div className="mt-2 w-full">
            {React.cloneElement(React.Children.only(content), {
              close: () => isDialogSetOpen(false),
            })}
          </div>
          <DialogPrimitive.Close asChild>
            <button
              className="absolute right-[10px] top-[10px] inline-flex size-[30px] items-center justify-center text-slate12 hover:font-black focus:shadow-[0_0_0_2px]	focus:shadow-slate2 focus:outline-none"
              aria-label="Close"
            >
              <Cross2Icon />
            </button>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
