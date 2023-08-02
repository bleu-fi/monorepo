import { PoolQuery } from "@bleu-balancer-tools/gql/src/balancer/__generated__/Ethereum";
import { AMM } from "@bleu-balancer-tools/math-poolsimulator/src";
import { ExtendedGyroEV2 } from "@bleu-balancer-tools/math-poolsimulator/src/gyroE";
import { ExtendedMetaStableMath } from "@bleu-balancer-tools/math-poolsimulator/src/metastable";

import { AnalysisData } from "#/contexts/PoolSimulatorContext";

import { PoolTypeEnum } from "../(types)";

export function convertAnalysisDataToAMM(data: AnalysisData) {
  if (!data.poolType || !data.poolParams?.swapFee) return;
  switch (data.poolType) {
    case PoolTypeEnum.MetaStable: {
      return new AMM(
        new ExtendedMetaStableMath({
          amp: String(data.poolParams?.ampFactor),
          swapFee: String(data.poolParams?.swapFee),
          totalShares: String(
            data.tokens.reduce((acc, token) => acc + token.balance, 0),
          ),
          tokens: data.tokens.map((token) => ({
            address: String(token.symbol), // math use address as key, but we will use symbol because custom token will not have address
            balance: String(token.balance),
            decimals: token.decimal,
            priceRate: String(token.rate),
          })),
          tokensList: data.tokens.map((token) => String(token.symbol)),
        }),
      );
    }
    case PoolTypeEnum.GyroE: {
      if (!data.poolParams?.lambda) return;
      return new AMM(
        new ExtendedGyroEV2({
          swapFee: String(data.poolParams?.swapFee),
          totalShares: String(
            data.tokens.reduce((acc, token) => acc + token.balance, 0),
          ),
          tokens: data.tokens.map((token) => ({
            address: String(token.symbol), // math use address as key, but we will use symbol because custom token will not have address
            balance: String(token.balance),
            decimals: token.decimal,
            priceRate: String(token.rate),
          })),
          tokensList: data.tokens.map((token) => String(token.symbol)),

          gyroEParams: {
            alpha: String(data.poolParams?.alpha),
            beta: String(data.poolParams?.beta),
            lambda: String(data.poolParams?.lambda),
            c: String(data.poolParams?.c),
            s: String(data.poolParams?.s),
          },
          derivedGyroEParams: {
            tauAlphaX: String(-0.7479871214549773),
            tauAlphaY: String(0.6637132408936085),
            tauBetaX: String(0.8338367829725988),
            tauBetaY: String(0.5520110681516334),
            u: String(0.7909055995583698),
            v: String(0.6076383033720348),
            w: String(-0.05585063777148738),
            z: String(0.03975485570515916),
            dSq: String(1),
          },
          tokenRates: data.tokens.map((token) => String(token.rate)),
        }),
      );
    }
    // TODO on issue BAL-501 add math for Gyro2 and Gyro3
    // case PoolTypeEnum.Gyro2: {
    //   console.log({
    //     swapFee: String(data.poolParams?.swapFee),
    //     totalShares: String(
    //       data.tokens.reduce((acc, token) => acc + token.balance, 0)
    //     ),
    //     tokens: data.tokens.map((token) => ({
    //       address: String(token.symbol), // math use address as key, but we will use symbol because custom token will not have address
    //       balance: String(token.balance),
    //       decimals: token.decimal,
    //       priceRate: String(token.rate),
    //     })),
    //     tokensList: data.tokens.map((token) => String(token.symbol)),
    //     sqrtAlpha: String(data.poolParams?.sqrtAlpha),
    //     sqrtBeta: String(data.poolParams?.sqrtBeta),
    //   });
    // }
    // case PoolTypeEnum.Gyro3: {
    //   console.log({
    //     swapFee: String(data.poolParams?.swapFee),
    //     totalShares: String(
    //       data.tokens.reduce((acc, token) => acc + token.balance, 0)
    //     ),
    //     tokens: data.tokens.map((token) => ({
    //       address: String(token.symbol), // math use address as key, but we will use symbol because custom token will not have address
    //       balance: String(token.balance),
    //       decimals: token.decimal,
    //       priceRate: String(token.rate),
    //     })),
    //     tokensList: data.tokens.map((token) => String(token.symbol)),
    //     root3Alpha: String(data.poolParams?.root3Alpha),
    //   });
    // }
    default:
      return;
  }
}

export function convertGqlToAnalysisData(poolData: PoolQuery): AnalysisData {
  const tokensData =
    poolData?.pool?.tokens
      ?.filter((token) => token.address !== poolData?.pool?.address) // filter out BPT
      .map((token) => ({
        symbol: token?.symbol,
        balance: Number(token?.balance),
        rate: Number(token?.priceRate),
        decimal: Number(token?.decimals),
      })) || [];
  switch (poolData.pool?.poolType) {
    case PoolTypeEnum.GyroE:
      return {
        poolType: PoolTypeEnum.GyroE,
        poolParams: {
          alpha: Number(poolData?.pool?.alpha),
          beta: Number(poolData?.pool?.beta),
          lambda: Number(poolData?.pool?.lambda),
          c: Number(poolData?.pool?.c),
          s: Number(poolData?.pool?.s),
          swapFee: poolData?.pool?.swapFee,
          tauAlphaX: poolData?.pool?.tauAlphaX,
          tauAlphaY: poolData?.pool?.tauAlphaY,
          tauBetaX: poolData?.pool?.tauBetaX,
          tauBetaY: poolData?.pool?.tauBetaY,
          u: poolData?.pool?.u,
          v: poolData?.pool?.v,
          w: poolData?.pool?.w,
          z: poolData?.pool?.z,
          dSq: poolData?.pool?.dSq,
        },
        tokens: tokensData,
      };
    case PoolTypeEnum.MetaStable:
      return {
        poolType: PoolTypeEnum.MetaStable,
        poolParams: {
          swapFee: Number(poolData?.pool?.swapFee),
          ampFactor: Number(poolData?.pool?.amp),
        },
        tokens: tokensData,
      };
    case PoolTypeEnum.Gyro2:
      return {
        poolType: PoolTypeEnum.Gyro2,
        poolParams: {
          swapFee: Number(poolData?.pool?.swapFee),
          sqrtAlpha: Number(poolData?.pool?.sqrtAlpha),
          sqrtBeta: Number(poolData?.pool?.sqrtBeta),
        },
        tokens: tokensData,
      };
    case PoolTypeEnum.Gyro3:
      return {
        poolType: PoolTypeEnum.Gyro3,
        poolParams: {
          swapFee: Number(poolData?.pool?.swapFee),
          root3Alpha: Number(poolData?.pool?.root3Alpha),
        },
        tokens: tokensData,
      };
    default:
      return {
        poolType: PoolTypeEnum.MetaStable,
        poolParams: {
          swapFee: Number(poolData?.pool?.swapFee),
          ampFactor: Number(poolData?.pool?.amp),
        },
        tokens:
          poolData?.pool?.tokens
            ?.filter((token) => token.address !== poolData?.pool?.address) // filter out BPT
            .map((token) => ({
              symbol: token?.symbol,
              balance: Number(token?.balance),
              rate: Number(token?.priceRate),
              decimal: Number(token?.decimals),
            })) || [],
      };
  }
}
