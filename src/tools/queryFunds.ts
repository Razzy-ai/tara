import { createTool } from "@mastra/core/tools";
import { makeSchema } from "../utils/makeSchema.js";
import { getFundReturn, rankFunds } from "../services/fundService.js";

type FundsInput = {
  operation: "fundReturn" | "rankFunds";
  fundName: string;
};

export const queryFunds = createTool({
  id: "queryFunds",
  description: "Use for: fund returns, fund rankings, best fund, compare funds",

  inputSchema: makeSchema({
    type: "object",
    properties: {
      operation: { type: "string", enum: ["fundReturn", "rankFunds"] },
      fundName:  { type: "string" },
    },
    required: ["operation"],
    additionalProperties: false,
  }, { fundName: "" }),

  execute: async (inputData: unknown) => {
    const context = inputData as FundsInput;
    try {
      switch (context.operation) {
        case "fundReturn":
          if (!context.fundName || context.fundName === "") {
            return { error: "fundName required" };
          }
          return getFundReturn(context.fundName);

        case "rankFunds":
          return rankFunds();
      }
    } catch (error) {
      console.error(error);
      return { error: "Unable to retrieve fund data" };
    }
  },
});