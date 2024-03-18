"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { EyeOpenIcon } from "@radix-ui/react-icons";
import cn from "clsx";
import Image from "next/image";

export function ImageDialog({ src }: { src: string }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <EyeOpenIcon className=" text-white" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0",
          )}
        />
        <Dialog.Content
          className={cn(
            "bg-blue1 data-[state=open]:animate-contentShow fixed top-[50%] border-6 border-slate6 left-[50%] max-h-[85vh] w-[90vw] max-w-[400px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none",
          )}
        >
          <Image src={src} alt="" className="size-full" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
