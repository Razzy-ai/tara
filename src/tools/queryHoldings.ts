import { z } from "zod";

import {
  getHoldingReturn,
  getPortfolioValue,
  getBestHolding,
} from "../services/holdingService.js";

export const queryHoldingsSchema =
  z.object({
    holdingId:
      z.number().optional(),

    operation: z.enum([
      "holdingReturn",
      "portfolioValue",
      "bestHolding",
    ]),
  });

export async function queryHoldings(
  input: z.infer<
    typeof queryHoldingsSchema
  >
) {
  try {
    console.log({
      tool: "queryHoldings",
      operation: input.operation,
      timestamp: new Date(),
    });

    switch (input.operation) {
      case "holdingReturn":
        if (!input.holdingId) {
          return {
            error:
              "holdingId is required",
          };
        }

        return getHoldingReturn(
          input.holdingId
        );

      case "portfolioValue":
        return getPortfolioValue();

      case "bestHolding":
        return getBestHolding();

      default:
        return {
          error:
            "Unsupported holding operation",
        };
    }
  } catch (error) {
    console.error(error);

    return {
      error:
        "Unable to retrieve holding data",
    };
  }
}