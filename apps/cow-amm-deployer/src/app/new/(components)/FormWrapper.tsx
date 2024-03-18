import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { FieldValues } from "react-hook-form";

import { LinkComponent } from "#/components/Link";
import { TRANSACTION_TYPES } from "#/lib/transactionFactory";

import { AmmForm } from "./AmmForm";

function ArrowIcon() {
  return (
    <ArrowLeftIcon
      height={16}
      width={16}
      className="text-background duration-200 hover:text-highlight"
    />
  );
}

export function FormWrapper({
  transactionType,
  defaultValues,
}: {
  transactionType:
    | TRANSACTION_TYPES.CREATE_COW_AMM
    | TRANSACTION_TYPES.EDIT_COW_AMM;
  defaultValues?: FieldValues;
}) {
  const backHref =
    transactionType === TRANSACTION_TYPES.CREATE_COW_AMM ? "/" : "/manager";
  return (
    <div className="flex size-full items-center justify-center">
      <div className="my-4 flex flex-col border-2 border-foreground bg-card border-card-foreground text-card-foreground">
        <div className="relative flex size-full justify-center">
          <LinkComponent
            href={backHref}
            content={
              <div className="absolute left-8 flex h-full items-center">
                <ArrowIcon />
              </div>
            }
          />
          <div className="flex min-w-[530px] flex-col items-center py-3">
            <div className="text-xl">
              {transactionType === TRANSACTION_TYPES.CREATE_COW_AMM
                ? "Create"
                : "Edit"}{" "}
              AMM
            </div>
          </div>
        </div>
        <div className="flex flex-col overflow-auto size-full max-h-[550px]">
          <AmmForm
            defaultValues={defaultValues}
            transactionType={transactionType}
          />
        </div>
      </div>
    </div>
  );
}
