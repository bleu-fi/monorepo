"use client";

import SafeProvider from "@gnosis.pm/safe-apps-react-sdk";
import React from "react";

import Fathom from "./Fathom";
import { HomeWrapper } from "./HomeWrapper";
import { ToastProvider } from "./Toast";

export function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <SafeProvider loader={<HomeWrapper isAmmRunning={false} goToSafe />}>
      <ToastProvider>
        <Fathom />
        <div className="size-full">{children}</div>
      </ToastProvider>
    </SafeProvider>
  );
}
