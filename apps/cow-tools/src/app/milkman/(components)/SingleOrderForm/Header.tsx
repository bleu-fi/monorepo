import { Network } from "@bleu-fi/utils";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

import { TransactionStatus } from "#/app/milkman/utils/type";
import { Button } from "#/components";
import { LinkComponent } from "#/components/Link";

export function FormHeader({
  transactionStatus,
  network,
  onClick,
}: {
  transactionStatus: TransactionStatus;
  network: Network;
  onClick: () => void;
}) {
  const isDraftSelectTokens =
    transactionStatus === TransactionStatus.ORDER_OVERVIEW;
  const isDraftResume = transactionStatus === TransactionStatus.ORDER_SUMMARY;

  function ArrowIcon() {
    return (
      <ArrowLeftIcon
        height={16}
        width={16}
        className="text-slate10 duration-200 hover:text-amber10"
      />
    );
  }
  return (
    <div className="relative flex size-full justify-center">
      {isDraftSelectTokens ? (
        <LinkComponent
          loaderColor="amber"
          href={`/milkman/${network}`}
          content={
            <div className="absolute left-8 flex h-full items-center">
              <ArrowIcon />
            </div>
          }
        />
      ) : (
        <Button
          type="button"
          className="absolute left-8 flex h-full items-center bg-transparent border-0 hover:bg-transparent p-0"
          onClick={onClick}
        >
          <ArrowIcon />
        </Button>
      )}
      <div className="flex min-w-[530px] flex-col items-center py-3">
        <div className="text-xl">
          {!isDraftResume ? "Create order" : "Create transaction"}
        </div>
      </div>
    </div>
  );
}
