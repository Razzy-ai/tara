import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import {
  getTransactions,
  getNetSpend,
  getTopMerchants,
  getMonthlySpend,
  getBiggestExpense,
  getCategoryGrowth,
  type TransactionFilters,
} from "../services/transactionService.js";

const inputSchema = z.object({
  category: z.string().optional(),
  merchant: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),

  operation: z.enum([
    "transactions",
    "netSpend",
    "topMerchants",
    "monthlySpend",
    "biggestExpense",
    "categoryGrowth",
  ]),
});

function buildFilters(
  input: z.infer<typeof inputSchema>
): TransactionFilters {
  const filters: TransactionFilters = {};

  if (input.category) {
    filters.category = input.category;
  }

  if (input.merchant) {
    filters.merchant = input.merchant;
  }

  if (input.startDate) {
    filters.startDate = new Date(input.startDate);
  }

  if (input.endDate) {
    filters.endDate = new Date(input.endDate);
  }

  return filters;
}

export const queryTransactions =
  createTool({
    id: "queryTransactions",

    description: `
Use for:
- spending
- expenses
- merchants
- categories
- refunds
- comparisons
- monthly spend
`,

    inputSchema,

    execute: async (
      context
    ) => {
      try {
        console.log({
          tool:
            "queryTransactions",
          operation:
            context.operation,
          timestamp:
            new Date(),
        });

        switch (
          context.operation
        ) {
          case "transactions":
            return getTransactions(
              buildFilters(
                context
              )
            );

          case "netSpend":
            return getNetSpend(
              buildFilters(
                context
              )
            );

          case "topMerchants":
            return getTopMerchants();

          case "monthlySpend":
            return getMonthlySpend();

          case "biggestExpense":
            return getBiggestExpense();

          case "categoryGrowth":
            return {
              error:
                "categoryGrowth not implemented",
            };
        }
      } catch (error) {
        console.error(error);

        return {
          error:
            "Unable to retrieve transaction data",
        };
      }
    },
  });