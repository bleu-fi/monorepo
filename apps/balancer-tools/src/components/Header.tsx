"use client";

import { networkFor } from "@bleu-fi/utils";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

import { useNetworks } from "#/contexts/networks";
import toTitleCase from "#/utils/toTitleCase";
import { useSwitchNetwork } from "#/wagmi";

import { CustomConnectButton } from "./CustomConnectButton";

interface IHeader {
  linkUrl: string;
  imageSrc?: string;
  title: string;
  children?: ReactNode;
  endButton?: ReactNode;
  onLinkClick?: () => void;
}

export function Header({
  linkUrl,
  imageSrc,
  title,
  children,
  endButton = <CustomConnectButton />,
  onLinkClick,
}: IHeader) {
  return (
    <div className="flex h-20 w-full items-center border-b border-b-blue3 bg-blue2 p-4 text-white">
      <div className="mr-auto flex sm:flex-1 justify-start">
        <Link
          href={linkUrl}
          onClick={onLinkClick}
          className="flex items-center gap-3 justify-self-start"
        >
          <>
            {imageSrc && <Image src={imageSrc} height={50} width={50} alt="" />}
            <div className="hidden sm:block text-xl font-thin text-slate12">
              Balancer <p className="font-medium">{title}</p>
            </div>
          </>
        </Link>
      </div>
      {children && <div className="flex flex-1 justify-center">{children}</div>}
      <div className="ml-auto flex flex-1 justify-end">{endButton}</div>
    </div>
  );
}

export function HeaderNetworkMismatchAlert() {
  const { mismatchedNetworks, urlPathNetwork } = useNetworks();

  const { switchNetwork } = useSwitchNetwork({ chainId: urlPathNetwork });

  if (!mismatchedNetworks || !urlPathNetwork) return null;

  return (
    <div className="flex min-h-[50px] flex-row items-center justify-center bg-tomato3 text-white">
      <ExclamationTriangleIcon className="mr-3 size-4" />
      <p className="pr-4">
        Please switch to {toTitleCase(networkFor(urlPathNetwork))}
      </p>
      <button
        className="inline-block h-6 cursor-pointer rounded-lg border-none bg-tomato4 px-2 text-xs text-white shadow hover:bg-tomato6 hover:text-white hover:shadow-none"
        onClick={() => switchNetwork?.()}
      >
        Switch network
      </button>
    </div>
  );
}
