import "#/global.css";
import "@rainbow-me/rainbowkit/styles.css";

import { Metadata } from "next";
import localFont from "next/font/local";
import * as React from "react";

import { Footer } from "#/components/Footer";
import { Header } from "#/components/Header";
import { RootLayout } from "#/components/RootLayout";
import { NetworksContextProvider } from "#/contexts/networks";
import { cn } from "#/lib/utils";

const APP_DISPLAY_NAME = "CoW AMM Manager";

export const metadata: Metadata = {
  title: `Cow - ${APP_DISPLAY_NAME}`,
  description: "Manage your CoW AMM",
};

const flechaS = localFont({
  src: [
    {
      path: "../fonts/FlechaS-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/FlechaS-MediumItalic.woff2",
      weight: "500",
      style: "italic",
    },
  ],
  variable: "--font-family-serif",
});

const circularStd = localFont({
  src: [
    {
      path: "../fonts/CircularStd-Book.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/CircularStd-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-family-sans",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={cn(
          flechaS.variable,
          circularStd.variable,
          "bg-background flex h-full flex-col font-sans font-normal text-foreground",
        )}
      >
        <RootLayout>
          <NetworksContextProvider>
            <div className="flex flex-col h-screen">
              <Header linkUrl={"/"} imageSrc={"/assets/cow-amm-deployer.svg"} />
              <div className="flex flex-1 overflow-auto p-4 sm:flex-row sm:gap-x-8 text-foreground">
                {children}
              </div>
              <Footer twitterLink="https://twitter.com/cowswap" />
            </div>
          </NetworksContextProvider>
        </RootLayout>
      </body>
    </html>
  );
}
