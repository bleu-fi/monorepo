import invariant from "tiny-invariant";

import { getBALPriceByRound } from "../(utils)/getBALPriceByRound";
import { Round } from "../(utils)/rounds";

export default async function BALPrice({
  roundId,
}: {
  roundId: string | string[];
}) {
  invariant(!Array.isArray(roundId), "roundId cannot be a list");
  const round = Round.getRoundByNumber(roundId);

  return <Price data={getBALPriceByRound(round)} />;
}

export const Price = async ({
  data,
}: {
  data: ReturnType<typeof getBALPriceByRound>;
}) => {
  const price = await data;

  return (
    <div>
      BAL price:{" "}
      {price.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })}
    </div>
  );
};