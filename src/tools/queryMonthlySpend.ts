import { createTool } from "@mastra/core/tools";
import { makeSchema } from "../utils/makeSchema.js";
import { getMonthlySpend } from "../services/transactionService.js";

export const queryMonthlySpend = createTool({
  id: "queryMonthlySpend",
  description: "Use for: monthly spending breakdown, spend by month",

  inputSchema: makeSchema({
    type: "object",
    properties: {},
    required: [],
    additionalProperties: false,
  }),

  execute: async () => {
    try {
      const data = await getMonthlySpend();
      if (!data || data.length === 0) return { result: "No monthly data found" };
      return { months: data };
    } catch (error) {
      console.error(error);
      return { error: "Unable to retrieve monthly spend" };
    }
  },
});