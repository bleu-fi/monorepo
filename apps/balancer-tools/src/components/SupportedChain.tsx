import { Network } from "@bleu-fi/utils";

export function CheckSupportedChains({
  children,
  supportedChains,
  chainName,
}: React.PropsWithChildren<{
  supportedChains?: Network[];
  chainName?: Network;
}>) {
  if (supportedChains && chainName && !supportedChains.includes(chainName)) {
    return (
      <div className="flex size-full flex-col items-center justify-center p-5 text-center">
        <div className="text-3xl font-bold text-white">
          Currently, this app doesn't have support for {chainName}
        </div>
        <div className="text-xl font-medium text-white">
          Please switch to another network
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
