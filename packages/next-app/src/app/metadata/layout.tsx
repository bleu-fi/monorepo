import type { Metadata } from "next";
import * as React from "react";

import balancerSymbol from "#/assets/balancer-symbol.svg";
import { Footer } from "#/components/Footer";
import { Header } from "#/components/Header";

import { MetadataProvider } from "./(components)/MetadataProvider";

export const metadata: Metadata = {
  title: "Balancer Pool Metadata",
  description: "Welcome to Balancer Pool Metadata",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <Header
        linkUrl={"/metadata"}
        title={"Pool Metadata"}
        imageSrc={balancerSymbol}
      />
      <MetadataProvider>{children}</MetadataProvider>
      <Footer
        githubLink="https://github.com/bleu-studio/balancer-pool-metadata"
        discordLink="https://discord.balancer.fi/"
      />
    </div>
  );
}
