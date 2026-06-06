import { createTool } from "@mastra/core/tools";
import { makeSchema } from "../utils/makeSchema.js";
import { getFundReturn, rankFunds } from "../services/fundService.js";

type FundsInput = {
  operation: "fundReturn" | "rankFunds";
  fundName: string;
  startDate: string;
  endDate: string;
};

export const queryFunds = createTool({
  id: "queryFunds",
  description: "Use for: fund returns (with optional date window), fund rankings, best fund, compare funds",

  inputSchema: makeSchema({
    type: "object",
    properties: {
      operation:  { type: "string", enum: ["fundReturn", "rankFunds"] },
      fundName:   { type: "string" },
      startDate:  { type: "string", description: "ISO date string, e.g. 2024-01-01" },
      endDate:    { type: "string", description: "ISO date string, e.g. 2025-01-01" },
    },
    required: ["operation"],
    additionalProperties: false,
  }, { fundName: "", startDate: "", endDate: "" }),

  execute: async (inputData: unknown) => {
    const ctx = inputData as FundsInput;
    try {
      const startDate = ctx.startDate && ctx.startDate !== "" ? new Date(ctx.startDate) : undefined;
      const endDate   = ctx.endDate   && ctx.endDate   !== "" ? new Date(ctx.endDate)   : undefined;

      switch (ctx.operation) {
        case "fundReturn":
          if (!ctx.fundName || ctx.fundName === "") return { error: "fundName required" };
          return getFundReturn(ctx.fundName, startDate, endDate);

        case "rankFunds": {
          const data = await rankFunds(startDate, endDate);
          if (!data.funds.length) return { result: "No fund data found" };
          return data;
        }
      }
    } catch (error) {
      console.error(error);
      return { error: "Unable to retrieve fund data" };
    }
  },
});
