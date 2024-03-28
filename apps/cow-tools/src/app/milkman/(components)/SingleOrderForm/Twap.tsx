import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, FieldValues, useForm } from "react-hook-form";
import { gnosis, mainnet, sepolia } from "viem/chains";

import { AlertCard } from "#/components/AlertCard";
import { Checkbox } from "#/components/Checkbox";
import { Input } from "#/components/Input";
import { Select, SelectItem } from "#/components/Select";
import { Form } from "#/components/ui/form";
import { fetchCowQuote } from "#/lib/cow/fetchCowQuote";
import { fetchTokenUsdPrice } from "#/lib/fetchTokenUsdPrice";
import { orderTwapSchema } from "#/lib/schema";
import { ChainId } from "#/utils/chainsPublicClients";

import { TransactionStatus } from "../../utils/type";
import { FormFooter } from "./Footer";

export enum TWAP_DELAY_OPTIONS {
  TEN_MINUTES = "10 minutes",
  THIRTY_MINUTES = "30 minutes",
  ONE_HOUR = "1 hour",
  THREE_HOURS = "3 hours",
  TWELVE_HOURS = "12 hours",
  ONE_DAY = "1 day",
}

export const TwapDelayValues = {
  [TWAP_DELAY_OPTIONS.TEN_MINUTES]: 10 * 60,
  [TWAP_DELAY_OPTIONS.THIRTY_MINUTES]: 30 * 60,
  [TWAP_DELAY_OPTIONS.ONE_HOUR]: 60 * 60,
  [TWAP_DELAY_OPTIONS.THREE_HOURS]: 3 * 60 * 60,
  [TWAP_DELAY_OPTIONS.TWELVE_HOURS]: 12 * 60 * 60,
  [TWAP_DELAY_OPTIONS.ONE_DAY]: 24 * 60 * 60,
};

const minValueForTwapWarining = {
  [sepolia.id]: 100,
  [gnosis.id]: 500,
  [mainnet.id]: 50_000,
};

export function TwapForm({
  onSubmit,
  defaultValues,
  chainId,
}: {
  onSubmit: (data: FieldValues) => void;
  defaultValues?: FieldValues;
  chainId: ChainId;
}) {
  const form = useForm<typeof orderTwapSchema._type>({
    resolver: zodResolver(orderTwapSchema),
    defaultValues,
  });

  const { register, setValue, watch, control } = form;

  const isTwapNeeded = watch("isTwapNeeded");

  return (
    <Form {...form} onSubmit={onSubmit} className="flex flex-col gap-y-6 p-9">
      <Checkbox
        id="isTwapNeeded"
        checked={isTwapNeeded}
        label="Order will need to be split into multiple orders"
        onChange={() => setValue("isTwapNeeded", !isTwapNeeded)}
      />
      <div className="flex flex-row justify-between gap-x-7">
        <Input
          type="number"
          label="Number of orders"
          className="w-1/2"
          disabled={!isTwapNeeded}
          defaultValue={defaultValues?.numberOfOrders}
          {...register("numberOfOrders")}
        />
        <div className="flex flex-col w-1/2">
          <label className="mb-2 block text-sm text-slate12">Delay</label>
          <Controller
            control={control}
            name="delay"
            defaultValue={defaultValues?.delay}
            render={({ field: { onChange, value, ref } }) => (
              <Select
                onValueChange={onChange}
                value={value}
                ref={ref}
                disabled={!isTwapNeeded}
              >
                {Object.values(TWAP_DELAY_OPTIONS).map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </Select>
            )}
          />
        </div>
      </div>
      <TwapSuggestion
        defaultValues={defaultValues}
        chainId={chainId}
        isTwapNeeded={isTwapNeeded}
      />
      <FormFooter transactionStatus={TransactionStatus.ORDER_TWAP} />
    </Form>
  );
}

function TwapSuggestion({
  chainId,
  defaultValues,
  isTwapNeeded,
}: {
  chainId: ChainId;
  defaultValues?: FieldValues;
  isTwapNeeded?: boolean;
}) {
  const [buyAmountUsd, setBuyAmountUsd] = useState<number>();
  const [sellAmountUsd, setSellAmountUsd] = useState<number>();

  useEffect(() => {
    if (defaultValues?.tokenSell && defaultValues?.tokenBuy) {
      fetchTokenUsdPrice({
        token: defaultValues?.tokenSell,
        amount: defaultValues?.tokenSellAmount,
        chainId,
      }).then((usdAmount) => {
        setSellAmountUsd(usdAmount);
      });
      fetchCowQuote({
        amountIn:
          defaultValues?.tokenSellAmount *
          10 ** defaultValues?.tokenSell?.decimals,
        tokenIn: defaultValues?.tokenSell,
        tokenOut: defaultValues?.tokenBuy,
        chainId,
        priceQuality: "optimal",
      }).then((res) => {
        fetchTokenUsdPrice({
          token: defaultValues?.tokenBuy,
          amount:
            Number(res.quote.buyAmount) /
            10 ** defaultValues?.tokenBuy.decimals,
          chainId,
        }).then((usdAmount) => {
          setBuyAmountUsd(usdAmount);
        });
      });
    }
  }, []);

  if (!buyAmountUsd || !sellAmountUsd) {
    return;
  }

  const priceImpact = 1 - buyAmountUsd / sellAmountUsd;
  const showWarning =
    priceImpact > 0.01 && sellAmountUsd > minValueForTwapWarining[chainId];
  return (
    showWarning &&
    !isTwapNeeded && (
      <AlertCard style="warning" title="TWAP is suggested">
        Your order is large enough to cause a significant price impact. Consider
        using TWAP to split your order into multiples suborders.
      </AlertCard>
    )
  );
}
