import { gnosis, mainnet } from "viem/chains";

export function UnsuportedChain() {
  return (
    <div className="flex size-full flex-col items-center rounded-3xl px-12 py-16 md:py-20">
      <div className="text-center text-3xl text-accent">
        This app isn't available on this network
      </div>
      <div className="text-xl text-foreground">
        Please change to {gnosis.name} or {mainnet.name}
      </div>
    </div>
  );
}
