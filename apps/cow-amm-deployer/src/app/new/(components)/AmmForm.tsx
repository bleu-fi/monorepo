import { Address } from "@bleu-fi/utils";
import { useSafeAppsSDK } from "@gnosis.pm/safe-apps-react-sdk";
import { zodResolver } from "@hookform/resolvers/zod";
import { brownDark } from "@radix-ui/colors";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FieldValues, useForm, UseFormReturn } from "react-hook-form";

import { Button } from "#/components";
import { Input } from "#/components/Input";
import { SelectInput } from "#/components/SelectInput";
import { Spinner } from "#/components/Spinner";
import { Toast } from "#/components/Toast";
import { TokenSelect } from "#/components/TokenSelect";
import { Tooltip } from "#/components/Tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "#/components/ui/accordion";
import { Form, FormMessage } from "#/components/ui/form";
import { Label } from "#/components/ui/label";
import { useFallbackState } from "#/hooks/useFallbackState";
import { useRawTxData } from "#/hooks/useRawTxData";
import { fetchTokenUsdPrice } from "#/lib/fetchTokenUsdPrice";
import { pools } from "#/lib/gqlBalancer";
import { pairs } from "#/lib/gqlUniswapV2";
import { ammFormSchema } from "#/lib/schema";
import { buildTxAMMArgs, TRANSACTION_TYPES } from "#/lib/transactionFactory";
import { FALLBACK_STATES, IToken, PRICE_ORACLES } from "#/lib/types";
import { cn } from "#/lib/utils";
import { ChainId } from "#/utils/chainsPublicClients";

import { FallbackAndDomainWarning } from "./FallbackAndDomainWarning";

const getNewMinTradeToken0 = (newToken0: IToken, chainId: ChainId) => {
  return fetchTokenUsdPrice({
    tokenAddress: newToken0.address as Address,
    tokenDecimals: newToken0.decimals,
    chainId,
  })
    .then((price) => 10 / price)
    .catch(() => 0);
};

export function AmmForm({
  transactionType,
  defaultValues,
}: {
  transactionType:
    | TRANSACTION_TYPES.CREATE_COW_AMM
    | TRANSACTION_TYPES.EDIT_COW_AMM;
  defaultValues?: FieldValues;
}) {
  const {
    safe: { safeAddress, chainId },
  } = useSafeAppsSDK();
  const router = useRouter();

  const form = useForm<typeof ammFormSchema._type>({
    resolver: zodResolver(ammFormSchema),
    defaultValues: {
      ...defaultValues,
      safeAddress,
      chainId,
    },
  });

  const {
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;
  const { fallbackState, domainSeparator } = useFallbackState();
  const { sendTransactions } = useRawTxData();
  const [confirmedFallbackSetup, setConfirmedFallbackSetup] = useState(false);

  const formData = watch();

  const tokenAddresses = [
    formData?.token0?.address,
    formData?.token1?.address,
  ].filter((address) => address) as Address[];

  const onSubmit = async (data: typeof ammFormSchema._type) => {
    await buildTxAMMArgs({ data, transactionType })
      .then((txArgs) => {
        sendTransactions(txArgs);
      })
      .then(() => {
        router.push("/createtxprocessing");
      });
  };

  useEffect(() => {
    if (fallbackState && domainSeparator) {
      setValue("domainSeparator", domainSeparator);
      setValue("fallbackSetupState", fallbackState);
    }
  }, [fallbackState, setValue]);

  useEffect(() => {
    setValue("safeAddress", safeAddress);
  }, [safeAddress, setValue]);

  if (!fallbackState || !domainSeparator) {
    return <Spinner />;
  }

  return (
    <Form
      {...form}
      onSubmit={onSubmit}
      className="flex flex-col gap-y-3 px-9 pb-9"
    >
      <div className="flex h-fit justify-between gap-x-7">
        <div className="w-full flex flex-col">
          <div className="flex flex-col w-full">
            <span className="mb-2 h-5 block text-sm">Token Pair</span>
            <TokenSelect
              onSelectToken={async (token: IToken) => {
                setValue("token0", {
                  decimals: token.decimals,
                  address: token.address,
                  symbol: token.symbol,
                });
                setValue(
                  "minTradedToken0",
                  await getNewMinTradeToken0(token, chainId as ChainId),
                );
              }}
              selectedToken={formData?.token0 ?? undefined}
            />
            {errors.token0 && (
              <FormMessage className="mt-1 h-6 text-sm text-destructive">
                <span>{errors.token0.message}</span>
              </FormMessage>
            )}
          </div>
        </div>
        <div className="flex flex-col w-full">
          <div className="w-full flex flex-col">
            <span className="mb-2 h-5 block text-sm text-transparent">
              Select pair
            </span>
            <TokenSelect
              onSelectToken={(token: IToken) => {
                setValue("token1", {
                  decimals: token.decimals,
                  address: token.address,
                  symbol: token.symbol,
                });
              }}
              selectedToken={formData?.token1 ?? undefined}
            />
            {errors.token1 && (
              <FormMessage className="mt-1 h-6 text-sm text-destructive">
                <span>{errors.token1.message}</span>
              </FormMessage>
            )}
          </div>
        </div>
      </div>
      <PriceOracleFields
        form={form}
        chainId={chainId as ChainId}
        tokenAddresses={tokenAddresses}
      />
      <Accordion className="w-full" type="single" collapsible>
        <AccordionItem value="advancedOptions" key="advancedOption">
          <AccordionTrigger
            className={cn(
              errors.minTradedToken0 ? "text-destructive" : "",
              "pt-0",
            )}
          >
            Advanced Options
          </AccordionTrigger>
          <AccordionContent>
            <Input
              label="Minimum first token amount on each order"
              type="number"
              step={10 ** (-formData?.token0?.decimals || 18)}
              name="minTradedToken0"
              tooltipText="This parameter is used to not overload the CoW Orderbook with small orders. By default, 10 dollars worth of the first token will be the minimum amount for each order."
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {fallbackState !== FALLBACK_STATES.HAS_DOMAIN_VERIFIER && (
        <FallbackAndDomainWarning
          confirmedFallbackSetup={confirmedFallbackSetup}
          setConfirmedFallbackSetup={setConfirmedFallbackSetup}
        />
      )}
      <div className="flex justify-center gap-x-5 mt-2">
        <Button
          loading={isSubmitting}
          variant="highlight"
          type="submit"
          className="w-full"
          disabled={
            (fallbackState != FALLBACK_STATES.HAS_DOMAIN_VERIFIER &&
              !confirmedFallbackSetup) ||
            isSubmitting ||
            !(formData?.token0 && formData?.token1 && formData?.priceOracle)
          }
        >
          <span>
            {transactionType === TRANSACTION_TYPES.CREATE_COW_AMM
              ? "Create AMM"
              : "Edit AMM"}
          </span>
        </Button>
      </div>
    </Form>
  );
}

function PriceOracleFields({
  form,
  chainId,
  tokenAddresses,
}: {
  form: UseFormReturn<typeof ammFormSchema._type>;
  chainId: ChainId;
  tokenAddresses: Address[];
}) {
  const {
    setValue,
    formState: { errors },
    watch,
    register,
  } = form;

  const priceOracle = watch("priceOracle");
  const [isNotifierOpen, setIsNotifierOpen] = useState(false);

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex flex-col gap-x-7">
        <div className="w-full">
          <div className="flex gap-x-2 mb-2">
            <Label>Price Oracle Source</Label>
            <Tooltip
              content={
                "The AMM relies on price oracle exclusively for generating orders that will plausibly be settled in the current market conditions"
              }
            >
              <InfoCircledIcon className="size-4" color={brownDark.brown8} />
            </Tooltip>
          </div>
          <SelectInput
            name="priceOracle"
            options={Object.values(PRICE_ORACLES).map((value) => ({
              id: value,
              value,
            }))}
            onValueChange={(priceOracle) => {
              setValue("priceOracle", priceOracle as PRICE_ORACLES);
            }}
            placeholder={priceOracle}
          />
          {errors.priceOracle && (
            <FormMessage className="h-6 text-sm text-destructive w-full">
              <p className="text-wrap">
                {errors.priceOracle.message as string}
              </p>
            </FormMessage>
          )}
        </div>
      </div>

      {priceOracle === PRICE_ORACLES.BALANCER && (
        <div className="flex flex-col gap-y-1">
          <Input
            label="Balancer Pool ID"
            {...register("balancerPoolId")}
            tooltipText="The address of the Balancer pool that will be used as the price oracle. If you click on the load button it will try to find the most liquid pool address using the Balancer subgraph."
          />
          <button
            type="button"
            className="flex flex-row outline-none hover:text-highlight text-xs"
            onClick={() => {
              getBalancerPoolId(chainId, tokenAddresses)
                .then((id) => {
                  setValue("balancerPoolId", id);
                })
                .catch(() => {
                  setIsNotifierOpen(true);
                });
            }}
          >
            Load from subgraph
          </button>
        </div>
      )}
      {priceOracle === PRICE_ORACLES.UNI && (
        <div className="flex flex-col gap-y-1">
          <Input
            label="Uniswap V2 Pool Address"
            {...register("uniswapV2Pair")}
            tooltipText="The address of the Uniswap V2 pool that will be used as the price oracle. If you click on the load button it will try to find the most liquid pool address using the Uniswap V2 subgraph."
          />
          <button
            type="button"
            className="flex flex-row outline-none hover:text-highlight text-xs"
            onClick={() => {
              getUniswapV2PairAddress(
                chainId,
                tokenAddresses[0],
                tokenAddresses[1],
              )
                .then((address) => {
                  setValue("uniswapV2Pair", address);
                })
                .catch(() => {
                  setIsNotifierOpen(true);
                });
            }}
          >
            Load from subgraph
          </button>
        </div>
      )}
      <Toast
        content={<ErrorFillingPriceOracleData />}
        isOpen={isNotifierOpen}
        setIsOpen={setIsNotifierOpen}
        duration={5000}
        variant="alert"
      />
    </div>
  );
}

function ErrorFillingPriceOracleData() {
  return (
    <div className="flex h-14 flex-row items-center justify-between px-4 py-8">
      <div className="flex flex-col justify-between space-y-1 text-destructive-foreground">
        <h1 className="font-normal">Error</h1>
        <h3 className="mb-2 text-sm leading-3">
          Check that tokens are valid and pool exists
        </h3>
      </div>
    </div>
  );
}

async function getBalancerPoolId(chainId: number, tokens: Address[]) {
  if (tokens.length !== 2 || tokens[0] === tokens[1])
    throw new Error("Invalid tokens");

  const poolsData = await pools
    .gql(String(chainId) || "1")
    .weightedPoolsAboveLiquidityWithTokens({
      tokens,
      liquidityThreshold: "1000",
    });

  if (poolsData?.pools.length === 0) throw new Error("Pool not found");

  return poolsData?.pools[0]?.id;
}

async function getUniswapV2PairAddress(
  chainId: number,
  token0: Address,
  token1: Address,
) {
  if (token0 === token1) throw new Error("Invalid tokens");
  const pairsData = await pairs.gql(String(chainId) || "1").pairsWhereTokens({
    token0,
    token1,
    reserveUSDThreshold: "1000",
  });

  if (pairsData?.pairs.length === 0) throw new Error("Pool not found");

  return pairsData?.pairs[0]?.id;
}
