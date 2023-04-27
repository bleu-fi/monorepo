"use client";

import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import * as Separator from "@radix-ui/react-separator";
import * as React from "react";
import { Suspense } from "react";
import { useNetwork } from "wagmi";

import balancerSymbol from "#/assets/balancer-symbol.svg";
import { Dialog } from "#/components/Dialog";
import { Header, HeaderNetworkMismatchAlert } from "#/components/Header";
import Sidebar from "#/components/Sidebar";
import Spinner from "#/components/Spinner";
import { CheckUnsupportedChain } from "#/components/UnsupportedChain";
import { NetworksContextProvider } from "#/contexts/networks";
import { PoolMetadataProvider } from "#/contexts/PoolMetadataContext";

import OwnedPoolsSidebarItems from "./(components)/OwnedPoolsSidebarItems";
import SearchPoolForm from "./(components)/SearchPoolForm";

export default function Layout({ children }: React.PropsWithChildren) {
  const { chain } = useNetwork();
  return (
    <NetworksContextProvider>
      <div className="flex flex-col h-full">
        <HeaderNetworkMismatchAlert />
        <Header
          linkUrl={"/metadata"}
          title={"Pool Metadata"}
          imageSrc={balancerSymbol}
        />
        <div className="flex flex-1 gap-x-8">
          <div>
            <Sidebar isFloating>
              <Dialog title="Go  to pool" content={<SearchPoolForm />}>
                <span className="text-sm font-normal text-slate12 cursor-pointer flex items-center space-x-2">
                  <MagnifyingGlassIcon width="16" height="16" strokeWidth={1} />
                  <span>Open a pool directly</span>
                </span>
              </Dialog>
              <Separator.Root className="bg-blue6 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px my-5" />

              <Sidebar.Header name="Owned pools" />
              <Sidebar.Content>
                <Suspense fallback={<Spinner />}>
                  <OwnedPoolsSidebarItems />
                </Suspense>
              </Sidebar.Content>
            </Sidebar>
          </div>
          <PoolMetadataProvider>
            <CheckUnsupportedChain
              unsupportedChain="Ethereum"
              chainName={chain?.name}
            >
              {children}
            </CheckUnsupportedChain>
          </PoolMetadataProvider>
        </div>
      </div>
    </NetworksContextProvider>
  );
}
