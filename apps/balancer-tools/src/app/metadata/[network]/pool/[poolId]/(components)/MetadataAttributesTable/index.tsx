"use client";

import { Address, Network } from "@bleu-fi/utils";
import {
  ArrowTopRightIcon,
  Pencil2Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import cn from "clsx";
import {
  TableHTMLAttributes,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { ClickToCopy } from "#/components/ClickToCopy";
import { Dialog } from "#/components/Dialog";
import {
  PoolMetadataAttribute,
  usePoolMetadata,
} from "#/contexts/PoolMetadataContext";
import { toSlug } from "#/utils/formatStringCase";
import { truncateAddress } from "#/utils/truncate";
import { usePreparePoolMetadataRegistrySetPoolMetadata } from "#/wagmi/generated";

import { Actions } from "./Actions";
import PoolMetadataForm from "./PoolMetadataForm";

type CellProps = TableHTMLAttributes<HTMLTableCellElement>;

const Th = ({ className, children }: CellProps) => (
  <th
    scope="col"
    className={cn(
      "py-3.5 px-3 text-left text-sm font-semibold text-white",
      className,
    )}
  >
    {children}
  </th>
);

function ClampedText({ text }: { text: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [hasBigword, setHasBigword] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (textRef.current) {
      // calculate the number of lines of text by dividing the height of the text element
      // by the height of a single line. this code assumes that each line of text has a
      // height of around 16px (tailwind default base font size).
      const numLines = textRef.current?.getBoundingClientRect().height / 16;
      setHasOverflow(numLines >= 4);
    }
    setHasBigword(text.split(" ").some((word) => word.length > 20));
  }, []);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <div
        ref={textRef}
        className={cn("break-all", {
          "overflow-hidden text-ellipsis line-clamp-3":
            !isExpanded && hasBigword,
          "line-clamp-3": !isExpanded && hasOverflow,
        })}
      >
        {text}
      </div>
      {hasOverflow &&
        (isExpanded ? (
          <button className="block text-blue11" onClick={toggleExpanded}>
            see less
          </button>
        ) : (
          <button className="block text-blue11" onClick={toggleExpanded}>
            see more
          </button>
        ))}
    </div>
  );
}

const Header = () => {
  const cols = [
    {
      node: <span className="sr-only">Edit</span>,
      className: "relative py-3.5 pl-3 pr-4 sm:pr-0",
    },
    { node: "Name" },
    { node: "Typename" },
    { node: "Description" },
    { node: "Value" },
  ];

  return (
    <thead>
      <tr>
        {cols.map(({ node, className }, index) => (
          <Th key={index} className={className}>
            {node}
          </Th>
        ))}
      </tr>
    </thead>
  );
};

const Td = ({ className, children }: CellProps) => {
  return (
    <td className={cn("whitespace py-4 px-3 text-sm text-slate12", className)}>
      {children}
    </td>
  );
};

const AttributeLink = ({ data }: { data: PoolMetadataAttribute }) => {
  switch (data.typename) {
    case "url":
      return (
        <button>
          <ArrowTopRightIcon className="text-white" />
        </button>
      );
    default:
      return <></>;
  }
};

function Row({
  data,
  mode = "view",
}: {
  data: PoolMetadataAttribute;
  mode: "view" | "edit";
}) {
  const { handleRemoveMetadataAttr } = usePoolMetadata();

  return (
    <tr>
      <Td>
        {mode === "edit" && (
          <div className="flex justify-around">
            <button
              className="flex items-center"
              onClick={() => handleRemoveMetadataAttr(data.key)}
            >
              <TrashIcon
                className="text-tomato9 hover:text-tomato10"
                width={16}
                height={16}
              />
            </button>
            <Dialog
              title={"Edit attribute"}
              content={<PoolMetadataForm data={data} mode="edit" />}
            >
              <button className="flex items-center">
                <Pencil2Icon className="hover:text-amber100 text-amber10" />
              </button>
            </Dialog>
          </div>
        )}
      </Td>
      <Td className="min-w-20 max-w-40">
        <div className="flex justify-between">
          <ClampedText text={data.key} />
          {(!data.value || !data.description) && (
            <span className="inline-flex items-center rounded-md bg-tomato12 px-1 py-0.5 text-xs font-semibold text-tomato9">
              needs edit
            </span>
          )}
        </div>
      </Td>
      <Td>
        <ClampedText text={data.typename} />
      </Td>
      <Td className="max-w-60">
        <ClampedText text={data.description ?? "..."} />
      </Td>
      <Td className="min-w-40">
        {data.value ? (
          <div className="flex justify-between gap-2">
            <ClampedText text={data.value} />
            <AttributeLink data={data} />
          </div>
        ) : (
          "..."
        )}
      </Td>
    </tr>
  );
}

export default function MetadataAttributesTable({
  poolId,
  network,
  cid,
  data,
  error,
}: {
  poolId: Address;
  poolOwner: Address;
  network: Network;
  cid?: string | null;
  data?: PoolMetadataAttribute[];
  error?: string | null;
}) {
  const {
    metadata,
    handleSetMetadata,
    handleSetOriginalMetadata,
    metadataUpdated,
    isMetadataValid,
  } = usePoolMetadata();

  useEffect(() => {
    handleSetMetadata(data ? (data as PoolMetadataAttribute[]) : []);
    handleSetOriginalMetadata(data ? (data as PoolMetadataAttribute[]) : []);
  }, [data]);

  const balancerPoolLink = `https://app.balancer.fi/#/${network}/pool/${poolId}`;

  const { isSuccess: canEditMetadata } =
    usePreparePoolMetadataRegistrySetPoolMetadata({
      args: [poolId, "QmcyM2d9Tm5yg3Mh7g2psYPsLZW8rzWtAZtMqw2GnGAMoa"],
    });

  return (
    <div className="w-full bg-blue1">
      <div className="pr-4 sm:pr-6 lg:pr-12">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="flex text-2xl">Pool attributes</h1>
            <div className="inline-block">
              <a
                target="_blank"
                href={balancerPoolLink}
                className="flex flex-row items-center text-slate11"
              >
                Open on app.balancer.fi
                <ArrowTopRightIcon
                  width={16}
                  height={16}
                  fontWeight={16}
                  className="ml-1"
                />
              </a>
            </div>

            <table>
              <tbody>
                <tr>
                  <td>Pool ID:</td>
                  <td>
                    <ClickToCopy text={poolId}>
                      {truncateAddress(poolId)}
                    </ClickToCopy>
                  </td>
                </tr>
                <tr>
                  <td>Metadata CID:</td>
                  <td>
                    {cid ? (
                      <ClickToCopy text={cid}>
                        {truncateAddress(cid)}
                      </ClickToCopy>
                    ) : (
                      <></>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {error ?? (
          <div>
            <div className="mt-4 flow-root max-h-[30rem] overflow-y-scroll rounded-md border border-blue6 bg-blue3">
              <table className="min-w-full divide-y divide-blue6">
                <Header />

                <tbody className="divide-y divide-blue6">
                  {metadata.map((item) => (
                    <Row
                      key={toSlug(item.key)}
                      data={item}
                      mode={canEditMetadata ? "edit" : "view"}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <Actions
              poolId={poolId}
              canEditMetadata={canEditMetadata}
              metadataUpdated={metadataUpdated}
              isMetadataValid={isMetadataValid}
            />
          </div>
        )}{" "}
      </div>
    </div>
  );
}
