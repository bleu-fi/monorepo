import { formatNumber } from "@bleu-fi/utils/formatNumber";
import { useSafeAppsSDK } from "@gnosis.pm/safe-apps-react-sdk";
import { zodResolver } from "@hookform/resolvers/zod";
import { slateDarkA } from "@radix-ui/colors";
import {
  InfoCircledIcon,
  Pencil1Icon,
  PlusIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { FieldValues, useForm, UseFormReturn } from "react-hook-form";

import { TransactionStatus } from "#/app/milkman/utils/type";
import { AlertCard } from "#/components/AlertCard";
import Button from "#/components/Button";
import { Dialog } from "#/components/Dialog";
import { Input } from "#/components/Input";
import { Select, SelectItem } from "#/components/Select";
import { Spinner } from "#/components/Spinner";
import Table from "#/components/Table";
import { Tooltip } from "#/components/Tooltip";
import { Form, FormMessage } from "#/components/ui/form";
import { Label } from "#/components/ui/label";
import { fetchCowQuote } from "#/lib/cow/fetchCowQuote";
import { getPriceCheckerFromAddressAndChain } from "#/lib/decode";
import { encodeExpectedOutArguments } from "#/lib/encode";
import {
  deployedPriceCheckersByChain,
  expectedOutCalculatorAddressesMapping,
  priceCheckerAddressesMapping,
  priceCheckersArgumentsMapping,
  priceCheckerTooltipMessageMapping,
} from "#/lib/priceCheckersMappings";
import {
  generateExpectedOutCalculatorSchema,
  generatePriceCheckerSchema,
} from "#/lib/schema";
import { PRICE_CHECKERS, PriceCheckerArgument } from "#/lib/types";
import { ChainId, publicClientsFromIds } from "#/utils/chainsPublicClients";

import { tokenPriceChecker } from "../../[network]/order/new/page";
import { TokenSelect, TokenSelectButton } from "../TokenSelect";
import { FormFooter } from "./Footer";
import { PriceCheckerConfirmation } from "./PriceCheckerConfirmation";

const FEE_PERCENTAGE_THRESHOLD = 0.2;

export function FormSelectPriceChecker({
  onSubmit,
  defaultValues,
}: {
  onSubmit: (data: FieldValues) => void;
  defaultValues?: FieldValues;
}) {
  const [selectedPriceChecker, setSelectedPriceChecker] =
    useState<PRICE_CHECKERS>(defaultValues?.priceChecker);
  const [quotedAmountOut, setQuotedAmountOut] = useState<number>(0);
  const [feePercetageThreshold, setFeePercetageThreshold] = useState<number>(0);
  const [openDialog, setOpenDialog] = useState(false);

  const { safe } = useSafeAppsSDK();

  const chainId = safe.chainId as ChainId;

  const publicClient = publicClientsFromIds[chainId];

  const schema =
    selectedPriceChecker &&
    generatePriceCheckerSchema({
      priceChecker: selectedPriceChecker,
      expectedArgs: priceCheckersArgumentsMapping[selectedPriceChecker],
    })({
      tokenSell: defaultValues?.tokenSell,
      tokenBuy: defaultValues?.tokenBuy,
      sellAmount: defaultValues?.tokenSellAmount,
      publicClient,
      cowQuotedAmount: quotedAmountOut,
    });

  const form = useForm(
    selectedPriceChecker && {
      resolver: zodResolver(schema),
      defaultValues,
    },
  );

  const {
    register,
    clearErrors,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    fetchCowQuote({
      tokenIn: defaultValues?.tokenSell,
      tokenOut: defaultValues?.tokenBuy,
      amountIn:
        defaultValues?.tokenSellAmount *
        10 ** defaultValues?.tokenSell.decimals,
      chainId,
      priceQuality: "optimal",
    }).then((res) => {
      setQuotedAmountOut(
        Number(res.quote.buyAmount) / 10 ** defaultValues?.tokenBuy.decimals,
      );
      setFeePercetageThreshold(
        Number(res.quote.feeAmount) /
          (Number(res.quote.feeAmount) + Number(res.quote.sellAmount)),
      );
    });
  }, []);

  useEffect(() => {
    clearErrors();
    register("priceChecker");
    register("priceCheckerAddress");
    if (!selectedPriceChecker) {
      return;
    }
    setValue("priceChecker", selectedPriceChecker);
    setValue(
      "priceCheckerAddress",
      priceCheckerAddressesMapping[chainId][selectedPriceChecker],
    );
  }, [selectedPriceChecker]);

  return (
    <Form {...form} onSubmit={onSubmit} className="flex flex-col gap-y-6 p-9">
      <div className="mb-2">
        {quotedAmountOut > 0 && (
          <div className="flex gap-x-2 my-2 items-center">
            <Label>
              Quoted Amount Out: {formatNumber(quotedAmountOut, 4)}{" "}
              {defaultValues?.tokenBuy.symbol}
            </Label>
            <Tooltip
              content={
                "Quoted using the CoW API and includes fees. This value will change on the feature, since another quote will be made on order posting."
              }
            >
              <InfoCircledIcon className="size-4" color={slateDarkA.slateA11} />
            </Tooltip>
          </div>
        )}
        <div className="flex gap-x-2 items-center">
          <Label>Price checker</Label>
          <Tooltip
            content={
              selectedPriceChecker
                ? priceCheckerTooltipMessageMapping[selectedPriceChecker]
                : "The price checker is what will define if the quoted order from CoW Swap will be posted and executed after your transaction."
            }
          >
            <InfoCircledIcon className="size-4" color={slateDarkA.slateA11} />
          </Tooltip>
        </div>
        <Select
          onValueChange={(priceChecker) => {
            setSelectedPriceChecker(priceChecker as PRICE_CHECKERS);
          }}
          className="w-full mt-2"
          defaultValue={defaultValues?.priceChecker}
        >
          {deployedPriceCheckersByChain[chainId].map((priceChecker) => (
            <SelectItem value={priceChecker} key={priceChecker}>
              {priceChecker}
            </SelectItem>
          ))}
        </Select>
        {errors.priceChecker && (
          <FormMessage className="h-6 text-sm text-tomato10 w-full">
            <p className="text-wrap">{errors.priceChecker.message as string}</p>
          </FormMessage>
        )}
      </div>
      {selectedPriceChecker && (
        <PriceCheckerInputs
          form={form}
          priceChecker={selectedPriceChecker}
          defaultValues={defaultValues}
          tokenBuyDecimals={defaultValues?.tokenBuy.decimals}
        />
      )}
      {feePercetageThreshold > FEE_PERCENTAGE_THRESHOLD && (
        <div className="flex gap-x-2 my-2 items-center">
          <AlertCard style="warning" title="High fee">
            <span>
              You will be paying around{" "}
              {(feePercetageThreshold * 100).toFixed()}% of fee. This is a high
              fee, consider review your order.
            </span>
          </AlertCard>
        </div>
      )}
      <Dialog
        content={
          <PriceCheckerConfirmation
            form={form}
            priceChecker={selectedPriceChecker}
            chainId={chainId}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
          />
        }
        title="Confirmation"
        isOpen={openDialog}
        setIsOpen={setOpenDialog}
      >
        <FormFooter
          transactionStatus={TransactionStatus.ORDER_STRATEGY}
          disabled={!selectedPriceChecker}
          isLoading={isSubmitting}
          continueButtonType="button"
          onContinue={() => {
            setOpenDialog(true);
          }}
        />
      </Dialog>
    </Form>
  );
}

function PriceCheckerInputs({
  priceChecker,
  form,
  defaultValues,
  tokenBuyDecimals,
  filterPriceCheckerArguments = false,
}: {
  priceChecker: PRICE_CHECKERS;
  form: UseFormReturn;
  defaultValues?: FieldValues;
  tokenBuyDecimals: number;
  filterPriceCheckerArguments?: boolean;
}) {
  const priceCheckerAguments = filterPriceCheckerArguments
    ? priceCheckersArgumentsMapping[priceChecker].filter(
        (arg) => arg.encodingLevel > 0,
      )
    : priceCheckersArgumentsMapping[priceChecker];

  if (priceCheckerAguments.length === 0) {
    return;
  }
  const nonArrayArguments = priceCheckerAguments.filter(
    (arg) => !arg.type.includes("[]"),
  );

  const arrayArguments = priceCheckerAguments.filter((arg) =>
    arg.type.includes("[]"),
  );

  const { register } = form;

  return (
    <div className="flex flex-col w-full gap-y-2">
      {nonArrayArguments.map((arg) => (
        <Input
          type={arg.inputType}
          label={arg.label}
          key={arg.name}
          defaultValue={defaultValues?.[arg.name]}
          step={arg.step || 10 ** -tokenBuyDecimals}
          tooltipText={arg.description}
          tooltipLink={arg.link}
          {...register(arg.name)}
        />
      ))}
      {arrayArguments.length > 0 && priceChecker !== PRICE_CHECKERS.META && (
        <ArrayPriceCheckerInput
          arrayArguments={arrayArguments}
          form={form}
          defaultValues={defaultValues}
        />
      )}
      {priceChecker === PRICE_CHECKERS.META && (
        <MetaPriceCheckerInput
          arrayArguments={arrayArguments}
          form={form}
          defaultValues={defaultValues}
        />
      )}
    </div>
  );
}

function ArrayPriceCheckerInput({
  arrayArguments,
  form,
  defaultValues,
}: {
  arrayArguments: PriceCheckerArgument[];
  form: UseFormReturn;
  defaultValues?: FieldValues;
}) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const [lengthOfArguments, setLengthOfArguments] = useState(1);
  const formData = watch();

  return (
    <div className="flex flex-col w-full gap-y-2 mt-2">
      <Table color="blue" shade="darkWithBorder">
        <Table.HeaderRow>
          {arrayArguments.map((arg) => (
            <Table.HeaderCell key={arg.name}>
              <div className="flex items-center gap-x-1">
                {arg.label}
                <Tooltip content={arg.description}>
                  {arg.link ? (
                    <a href={arg.link} target="_blank">
                      <InfoCircledIcon color={slateDarkA.slateA11} />
                    </a>
                  ) : (
                    <InfoCircledIcon color={slateDarkA.slateA11} />
                  )}
                </Tooltip>
              </div>
            </Table.HeaderCell>
          ))}
          <Table.HeaderCell>
            <Button
              type="button"
              className="px-5 py-2"
              onClick={() => {
                setLengthOfArguments(lengthOfArguments + 1);
              }}
            >
              <PlusIcon className="size-5 items-end" />
            </Button>
          </Table.HeaderCell>
        </Table.HeaderRow>
        <Table.Body>
          {[...Array(lengthOfArguments).keys()].map((index) => {
            return (
              <Table.BodyRow key={index}>
                {arrayArguments.map((arg) => {
                  const argName = `${arg.name}.${index}`;
                  return (
                    <Table.BodyCell classNames="align-top" key={arg.name}>
                      {arg.type.includes("bool") ? (
                        <div className="flex items-center justify-center gap-x-2 mt-2">
                          <input
                            className="size-5 mt-2"
                            type="checkbox"
                            key={argName}
                            defaultChecked={defaultValues?.[argName]}
                            {...register(argName)}
                          />
                        </div>
                      ) : (
                        <Input
                          type={arg.inputType}
                          key={argName}
                          defaultValue={defaultValues?.[argName]}
                          step={arg.step}
                          {...register(argName)}
                        />
                      )}
                      {errors[arg.name] && (
                        <FormMessage className="mt-1 h-6 text-sm text-tomato10">
                          <span>
                            {/* @ts-ignore */}
                            {errors[arg.name][index]?.message as string}
                          </span>
                        </FormMessage>
                      )}
                    </Table.BodyCell>
                  );
                })}
                <Table.BodyCell>
                  <div className="flex items-center justify-center gap-x-2">
                    <button
                      className="justify-self-center text-tomato9 hover:text-tomato10"
                      type="button"
                      onClick={() => {
                        arrayArguments.forEach((arg) => {
                          setValue(arg.name, [
                            ...formData[arg.name].slice(0, index),
                            ...formData[arg.name].slice(index + 1),
                          ]);
                          setLengthOfArguments(lengthOfArguments - 1);
                        });
                      }}
                    >
                      <TrashIcon className="size-7" />
                    </button>
                  </div>
                </Table.BodyCell>
              </Table.BodyRow>
            );
          })}
        </Table.Body>
      </Table>
      {errors[arrayArguments[0].name] && (
        <FormMessage className="h-6 text-sm text-tomato10 w-full">
          <span>{errors[arrayArguments[0].name]?.message as string}</span>
        </FormMessage>
      )}
    </div>
  );
}

function MetaPriceCheckerInput({
  arrayArguments,
  form,
  defaultValues,
}: {
  arrayArguments: PriceCheckerArgument[];
  form: UseFormReturn;
  defaultValues?: FieldValues;
}) {
  const {
    register,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = form;
  const formData = watch();

  useEffect(() => {
    arrayArguments.forEach((arg) => {
      if (!defaultValues?.[arg.name]) {
        register(arg.name);
        setValue(
          arg.name,
          arg.name === "swapPath" ? [defaultValues?.tokenSell.address] : [],
        );
      }
    });
    if (!defaultValues?.expectedOutCalculatorsNotEncodedData) {
      register("expectedOutCalculatorsNotEncodedData");
      setValue(
        "expectedOutCalculatorsNotEncodedData",
        defaultValues?.expectedOutCalculatorsNotEncodedData || [],
      );
    }
  }, []);

  function addExpectedOutCalculators(
    data: FieldValues,
    selectedPriceChecker: PRICE_CHECKERS,
    expectedArgs: PriceCheckerArgument[],
  ) {
    setValue("expectedOutCalculatorsNotEncodedData", [
      ...getValues("expectedOutCalculatorsNotEncodedData"),
      data,
    ]);
    setValue("swapPath", [...formData.swapPath, data.toToken.address]);
    setValue("expectedOutAddresses", [
      ...formData.expectedOutAddresses,
      data.expectedOutCalculatorAddress,
    ]);
    setValue("expectedOutData", [
      ...formData.expectedOutData,
      encodeExpectedOutArguments(
        selectedPriceChecker,
        expectedArgs.map(
          (arg) => arg.convertInput?.(data[arg.name]) || data[arg.name],
        ),
      ),
    ]);
  }

  function editExpectedOutCalculators(
    data: FieldValues,
    selectedPriceChecker: PRICE_CHECKERS,
    expectedArgs: PriceCheckerArgument[],
  ) {
    const newExpectedOutCalculators = [...formData.expectedOutData];
    newExpectedOutCalculators[dialogIndex] = encodeExpectedOutArguments(
      selectedPriceChecker,
      expectedArgs.map(
        (arg) => arg.convertInput?.(data[arg.name]) || data[arg.name],
      ),
    );
    setValue("expectedOutData", newExpectedOutCalculators);

    setValue("expectedOutAddresses", [
      ...formData.expectedOutAddresses.slice(0, dialogIndex),
      data.expectedOutCalculatorAddress,
      ...formData.expectedOutAddresses.slice(dialogIndex + 1),
    ]);

    setValue("swapPath", [
      ...formData.swapPath.slice(0, dialogIndex + 1),
      data.toToken.address,
      ...formData.swapPath.slice(dialogIndex + 2),
    ]);

    const newExpectedOutCalculatorsNotEncodedData = [
      ...formData.expectedOutCalculatorsNotEncodedData,
    ];
    newExpectedOutCalculatorsNotEncodedData[dialogIndex] = data;
    if (
      dialogIndex + 1 <
      formData.expectedOutCalculatorsNotEncodedData.length
    ) {
      newExpectedOutCalculatorsNotEncodedData[dialogIndex + 1].fromToken =
        data.toToken;
    }
    setValue(
      "expectedOutCalculatorsNotEncodedData",
      newExpectedOutCalculatorsNotEncodedData,
    );
  }

  const {
    safe: { chainId },
  } = useSafeAppsSDK();
  const [openDialog, setOpenDialog] = useState(false);
  const [valuesForDialog, setValuesForDialog] = useState<FieldValues>({});
  const [dialogIndex, setDialogIndex] = useState<number>(-1);

  return (
    <div className="flex flex-col w-full gap-y-2 mt-2">
      <Dialog
        title="Add expected out calculator step"
        customWidth="w-[600px]"
        content={
          <AddMetaExpectedOutCalculatorStepDialog
            onSubmit={(data, selectedPriceChecker, expectedArgs) => {
              if (dialogIndex === -1) {
                addExpectedOutCalculators(
                  data,
                  selectedPriceChecker,
                  expectedArgs,
                );
                return;
              }
              editExpectedOutCalculators(
                data,
                selectedPriceChecker,
                expectedArgs,
              );
            }}
            defaultValues={valuesForDialog}
            setIsOpen={setOpenDialog}
          />
        }
        isOpen={openDialog}
        setIsOpen={setOpenDialog}
      />
      <Label className="mt-2">
        Build a path of expected out calculators from{" "}
        {defaultValues?.tokenSell.symbol} to {defaultValues?.tokenBuy.symbol}
      </Label>
      <Table color="blue" shade="darkWithBorder">
        <Table.HeaderRow>
          <Table.HeaderCell>
            <span className="sr-only">Cancel</span>
          </Table.HeaderCell>
          {["Token in", "Token out", "Expected Minimum Out Calculator"].map(
            (arg) => (
              <Table.HeaderCell key={arg}>{arg}</Table.HeaderCell>
            ),
          )}
          <Table.HeaderCell>
            <Button
              type="button"
              className="px-5 py-2"
              onClick={() => {
                setValuesForDialog(
                  formData.expectedOutCalculatorsNotEncodedData?.length > 0
                    ? {
                        fromToken:
                          formData.expectedOutCalculatorsNotEncodedData.slice(
                            -1,
                          )[0].toToken,
                      }
                    : {
                        fromToken: defaultValues?.tokenSell,
                      },
                );
                setDialogIndex(-1);
                setOpenDialog(true);
              }}
            >
              <PlusIcon className="size-5 items-end" />
            </Button>
          </Table.HeaderCell>
        </Table.HeaderRow>
        <Table.Body>
          {formData.swapPath?.length > 1 &&
            [...Array(formData.swapPath.length - 1).keys()].map((rowIndex) => {
              const expectedOutPriceChecker =
                getPriceCheckerFromAddressAndChain(
                  chainId as ChainId,
                  formData.expectedOutAddresses[rowIndex],
                  true,
                );
              return (
                <Table.BodyRow key={rowIndex}>
                  <Table.BodyCell>
                    <div className="flex items-center justify-center gap-x-2">
                      <button
                        className="justify-self-center text-amber9 hover:text-amber10"
                        type="button"
                        onClick={() => {
                          const fromToken = rowIndex
                            ? formData.expectedOutCalculatorsNotEncodedData[
                                rowIndex - 1
                              ].toToken
                            : defaultValues?.tokenSell;
                          setValuesForDialog({
                            ...formData.expectedOutCalculatorsNotEncodedData[
                              rowIndex
                            ],
                            fromToken,
                          });
                          setDialogIndex(rowIndex);
                          setOpenDialog(true);
                        }}
                      >
                        <Pencil1Icon className="size-7" />
                      </button>
                    </div>
                  </Table.BodyCell>
                  <Table.BodyCell>
                    <Input
                      name={`tokenIn.${rowIndex}`}
                      value={
                        rowIndex
                          ? formData.expectedOutCalculatorsNotEncodedData[
                              rowIndex - 1
                            ].toToken.symbol
                          : defaultValues?.tokenSell.symbol
                      }
                      disabled
                    />
                  </Table.BodyCell>
                  <Table.BodyCell>
                    <Input
                      name={`tokenOut.${rowIndex}`}
                      value={
                        formData.expectedOutCalculatorsNotEncodedData[rowIndex]
                          .toToken.symbol
                      }
                      disabled
                    />
                  </Table.BodyCell>
                  <Table.BodyCell>
                    <Input
                      name={`expectedOut.${rowIndex}`}
                      value={
                        expectedOutPriceChecker || "Not valid expected out"
                      }
                      disabled
                    />
                  </Table.BodyCell>
                  <Table.BodyCell>
                    <div className="flex items-center justify-center gap-x-2">
                      <button
                        className="justify-self-center text-tomato9 hover:text-tomato10"
                        type="button"
                        onClick={() => {
                          arrayArguments.forEach((arg) => {
                            const indexToSlice =
                              arg.name === "swapPath" ? rowIndex + 1 : rowIndex;
                            setValue(arg.name, [
                              ...formData[arg.name].slice(0, indexToSlice),
                              ...formData[arg.name].slice(indexToSlice + 1),
                            ]);
                          });
                          setValue("expectedOutCalculatorsNotEncodedData", [
                            ...formData.expectedOutCalculatorsNotEncodedData.slice(
                              0,
                              rowIndex,
                            ),
                            ...formData.expectedOutCalculatorsNotEncodedData.slice(
                              rowIndex + 1,
                            ),
                          ]);
                        }}
                      >
                        <TrashIcon className="size-7" />
                      </button>
                    </div>
                  </Table.BodyCell>
                </Table.BodyRow>
              );
            })}
        </Table.Body>
      </Table>
      {errors[arrayArguments[0].name] && (
        <FormMessage className="h-6 text-sm text-tomato10 w-full">
          <span>{errors[arrayArguments[0].name]?.message as string}</span>
        </FormMessage>
      )}
    </div>
  );
}

function AddMetaExpectedOutCalculatorStepDialog({
  defaultValues,
  onSubmit,
  setIsOpen,
}: {
  defaultValues?: FieldValues;
  onSubmit?: (
    data: FieldValues,
    priceChecker: PRICE_CHECKERS,
    expectedArgs: PriceCheckerArgument[],
  ) => void;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const fromToken = defaultValues?.fromToken as tokenPriceChecker;

  const [selectedPriceChecker, setSelectedPriceChecker] =
    useState<PRICE_CHECKERS>(defaultValues?.expectedOutCalculator);

  const { safe } = useSafeAppsSDK();

  const chainId = safe.chainId as ChainId;

  const publicClient = publicClientsFromIds[chainId];

  const expectedArgs = priceCheckersArgumentsMapping[
    selectedPriceChecker
  ]?.filter((arg) => arg.encodingLevel > 0);

  const getExpectedOutCalculatorSchema = generateExpectedOutCalculatorSchema({
    priceChecker: selectedPriceChecker,
    expectedArgs,
  });
  const schema =
    selectedPriceChecker &&
    getExpectedOutCalculatorSchema &&
    getExpectedOutCalculatorSchema({
      publicClient,
    });

  const expectedOutCalculatorForm = useForm(
    selectedPriceChecker && {
      resolver: zodResolver(schema),
      defaultValues,
    },
  );

  const {
    register,
    clearErrors,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = expectedOutCalculatorForm;

  useEffect(() => {
    register("expectedOutCalculator");
    register("expectedOutCalculatorAddress");
    register("fromToken");
    register("toToken");
    setValue("fromToken", defaultValues?.fromToken);
  }, []);

  useEffect(() => {
    clearErrors();
    if (!selectedPriceChecker) {
      return;
    }
    setValue("expectedOutCalculator", selectedPriceChecker);
    setValue(
      "expectedOutCalculatorAddress",
      expectedOutCalculatorAddressesMapping[chainId][selectedPriceChecker],
    );
  }, [selectedPriceChecker]);

  const priceCheckersToShow = deployedPriceCheckersByChain[chainId].filter(
    (priceChecker) =>
      ![PRICE_CHECKERS.FIXED_MIN_OUT, PRICE_CHECKERS.META].includes(
        priceChecker as PRICE_CHECKERS,
      ),
  );

  const toToken = watch("toToken");

  return (
    <Form
      {...expectedOutCalculatorForm}
      onSubmit={(data) => {
        onSubmit?.(data, selectedPriceChecker, expectedArgs);
        setIsOpen(false);
      }}
      className="flex flex-col gap-y-6 p-9 w-full"
    >
      <div className="flex justify-between gap-x-2">
        <TokenSelectButton tokenType="sell" token={fromToken} disabeld={true} />
        <TokenSelect
          onSelectToken={(token) => {
            setValue("toToken", {
              decimals: token.decimals,
              address: token.address,
              symbol: token.symbol,
            });
          }}
          tokenType="buy"
          selectedToken={toToken}
        />
      </div>
      <div className="mb-2">
        <div className="flex gap-x-2  text-slate12">
          <Label>Price checker</Label>
          <Tooltip
            content={
              selectedPriceChecker
                ? priceCheckerTooltipMessageMapping[selectedPriceChecker]
                : "The expected checker is what will define if the quoted order from CoW Swap will be posted and executed after your transaction."
            }
          >
            <InfoCircledIcon className="size-4" color={slateDarkA.slateA11} />
          </Tooltip>
        </div>
        <Select
          onValueChange={(priceChecker) => {
            setSelectedPriceChecker(priceChecker as PRICE_CHECKERS);
          }}
          className="w-full mt-2"
          defaultValue={defaultValues?.expectedOutCalculator}
        >
          {priceCheckersToShow.map((priceChecker) => (
            <SelectItem value={priceChecker} key={priceChecker}>
              {priceChecker}
            </SelectItem>
          ))}
        </Select>
        {errors.expectedOutCalculator && (
          <FormMessage className="h-6 text-sm text-tomato10 w-full">
            <span>{errors.expectedOutCalculator.message as string}</span>
          </FormMessage>
        )}
      </div>
      {selectedPriceChecker && (
        <PriceCheckerInputs
          form={expectedOutCalculatorForm}
          priceChecker={selectedPriceChecker}
          defaultValues={defaultValues}
          tokenBuyDecimals={toToken?.decimals}
          filterPriceCheckerArguments={true}
        />
      )}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || !selectedPriceChecker}
      >
        {isSubmitting ? <Spinner size="sm" /> : <span>Continue</span>}
      </Button>
    </Form>
  );
}
