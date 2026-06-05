import { createTool } from "@mastra/core/tools";
import { makeSchema } from "../utils/makeSchema.js";
import { getHoldingReturn, getPortfolioValue, getBestHolding } from "../services/holdingService.js";

type HoldingsInput = {
  operation: "holdingReturn" | "portfolioValue" | "bestHolding";
  holdingId: string;
};

export const queryHoldings = createTool({
  id: "queryHoldings",
  description: "Use for: portfolio value, holdings, investments, gains, investment returns",

  inputSchema: makeSchema({
    type: "object",
    properties: {
      operation: { type: "string", enum: ["holdingReturn", "portfolioValue", "bestHolding"] },
      holdingId: { type: "string" },
    },
    required: ["operation"],
    additionalProperties: false,
  }, { holdingId: "" }),

  execute: async (inputData: unknown) => {
    const context = inputData as HoldingsInput;
    try {
      switch (context.operation) {
        case "holdingReturn":
          if (!context.holdingId || context.holdingId === "") {
            return { error: "holdingId required" };
          }
          return getHoldingReturn(Number(context.holdingId));

        case "portfolioValue":
          return getPortfolioValue();

        case "bestHolding":
          return getBestHolding();
      }
    } catch (error) {
      console.error(error);
      return { error: "Unable to retrieve holding data" };
    }
  },
});