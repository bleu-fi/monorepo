"use client";

import { darkTheme, RainbowKitProvider, Theme } from "@rainbow-me/rainbowkit";
import merge from "lodash.merge";
import React from "react";
import { WagmiConfig } from "wagmi";

import { chains, config } from "#/wagmi/client";

import Fathom from "./Fathom";
import { ToastProvider } from "./Toast";

export function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider
        chains={chains}
        modalSize="compact"
        theme={CustomTheme}
      >
        <ToastProvider>
          <Fathom />
          <div className="size-full bg-blue1">{children}</div>
        </ToastProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

const CustomTheme = merge(darkTheme(), {
  colors: {
    accentColor: "#3182CE",
    accentColorForeground: "#E2E8F0",
    closeButtonBackground: "#E2E8F0",
    connectButtonText: "#E2E8F0",
    closeButton: "#2D3748",
    connectButtonTextError: "#E2E8F0",
    connectionIndicator: "#30E000",
    generalBorder: "#E2E8F0",
    menuItemBackground: "#353d49",
    modalBackground: "#2D3748",
    modalBorder: "transparent",
    modalText: "#E2E8F0",
    modalTextDim: "#E2E8F0",
    modalTextSecondary: "#E2E8F0",
    selectedOptionBorder: "rgba(60, 66, 66, 0.1)",
    standby: "#FFD641",
  },
  fonts: {
    body: "var(--font-family-sans)",
  },
  radii: {
    menuButton: "25px",
    modal: "25px",
  },
  shadows: {
    selectedOption: "0px 4px 8px rgba(0, 0, 0, 0.24)",
    selectedWallet: "0px 4px 8px rgba(0, 0, 0, 0.12)",
  },
} as Theme);
