import { createTool } from "@mastra/core/tools";
import { makeSchema } from "../utils/makeSchema.js";

import {
  getTransactions,
  getNetSpend,
  type TransactionFilters,
} from "../services/transactionService.js";

type TransactionInput = {
  operation: "netSpend" | "transactions";
  category: string;
  merchant: string;
  startDate: string;
  endDate: string;
};

export const queryTransactions = createTool({
  id: "queryTransactions",
  description: "Use for: spending by category, spending by merchant, net spend, filtered transactions",

  inputSchema: makeSchema({
    type: "object",
    properties: {
      operation: { type: "string", enum: ["netSpend", "transactions"] },
      category:  { type: "string" },
      merchant:  { type: "string" },
      startDate: { type: "string" },
      endDate:   { type: "string" },
    },
    required: ["operation"],
    additionalProperties: false,
  }, { category: "", merchant: "", startDate: "", endDate: "" }),


  execute: async (inputData: unknown) => {
    const context = inputData as TransactionInput;
    try {
      console.log({ tool: "queryTransactions", operation: context.operation, timestamp: new Date() });

      const filters: TransactionFilters = {};
      if (context.category  && context.category  !== "") filters.category  = context.category;
      if (context.merchant  && context.merchant  !== "") filters.merchant  = context.merchant;
      if (context.startDate && context.startDate !== "") filters.startDate = new Date(context.startDate);
      if (context.endDate   && context.endDate   !== "") filters.endDate   = new Date(context.endDate);

      switch (context.operation) {
        case "netSpend":
          return getNetSpend(filters);

        case "transactions": {
          const data = await getTransactions(filters);
          const total = data.reduce((sum: number, t: any) => sum + t.amount, 0);
          return {
            count: data.length,
            total: total.toFixed(2),
            currency: data[0]?.currency ?? "INR",
          };
        }
      }
    } catch (error) {
      console.error(error);
      return { error: "Unable to retrieve transaction data" };
    }
  },
});