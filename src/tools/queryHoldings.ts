import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import {
  getHoldingReturn,
  getPortfolioValue,
  getBestHolding,
} from "../services/holdingService.js";

export const queryHoldings =
  createTool({
    id: "queryHoldings",

    description: `
Use for:
- portfolio value
- holdings
- investments
- gains
- investment returns
`,

    inputSchema: z.object({
      holdingId:
        z.number().optional(),

      operation: z.enum([
        "holdingReturn",
        "portfolioValue",
        "bestHolding",
      ]),
    }),

    execute: async (
      context,
    ) => {
      try {
        switch (
          context.operation
        ) {
          case "holdingReturn":
            if (
              !context.holdingId
            ) {
              return {
                error:
                  "holdingId required",
              };
            }

            return getHoldingReturn(
              context.holdingId
            );

          case "portfolioValue":
            return getPortfolioValue();

          case "bestHolding":
            return getBestHolding();
        }
      } catch (error) {
        console.error(error);

        return {
          error:
            "Unable to retrieve holding data",
        };
      }
    },
  });