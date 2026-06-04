import { z } from "zod";
import type { TransactionFilters } from "../services/transactionService.js";
import {
  getTransactions,
  getNetSpend,
  getTopMerchants,
  getMonthlySpend,
  getBiggestExpense,
} from "../services/transactionService.js";

export const queryTransactionsSchema = z.object({
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
  input: z.infer<typeof queryTransactionsSchema>
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
export async function queryTransactions(
  input: z.infer<typeof queryTransactionsSchema>
) {
  try {
    console.log({
      tool: "queryTransactions",
      operation: input.operation,
      timestamp: new Date(),
    });

    switch (input.operation) {
      case "transactions":
        return getTransactions(
          buildFilters(input)
        );

      case "netSpend":
        return getNetSpend(
          buildFilters(input)
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
            "categoryGrowth not implemented yet",
        };

      default:
        return {
          error:
            "Unsupported transaction operation",
        };
    }
  } catch (error) {
    console.error(error);

    return {
      error:
        "Unable to retrieve transaction data",
    };
  }
}