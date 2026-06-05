import { createTool } from "@mastra/core/tools";
import { makeSchema } from "../utils/makeSchema.js";
import { getBiggestExpense } from "../services/transactionService.js";

export const queryBiggestExpense = createTool({
  id: "queryBiggestExpense",
  description: "Use for: biggest expense, largest transaction, most expensive purchase",

  inputSchema: makeSchema({
    type: "object",
    properties: {},
    required: [],
    additionalProperties: false,
  }),

  execute: async () => {
    try {
      return getBiggestExpense();
    } catch (error) {
      console.error(error);
      return { error: "Unable to retrieve biggest expense" };
    }
  },
});