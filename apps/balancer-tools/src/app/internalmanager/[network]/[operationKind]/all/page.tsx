import { Network } from "@bleu-fi/utils";

import { LinkComponent } from "#/components/Link";
import { operationKindType } from "#/lib/internal-balance-helper";

import { WithdrawAll } from "./withdrawAll";

export default function Page({
  params,
}: {
  params: {
    network: Network;
    operationKind: keyof typeof operationKindType;
  };
}) {
  if (operationKindType[params.operationKind] === operationKindType.withdraw)
    return <WithdrawAll />;
  return (
    <div className="flex size-full flex-col items-center justify-center p-5 text-center">
      <div className="text-3xl font-bold text-white">
        You can not {params.operationKind} all of your tokens
      </div>
      <div className="text-xl font-medium text-white flex gap-x-1">
        Please return to
        <LinkComponent
          href={`/internalmanager/${params.network}`}
          content={<span className="text-amber9">the home page</span>}
          loaderColor="amber"
        />
      </div>
    </div>
  );
}
