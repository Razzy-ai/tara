import { createTool } from "@mastra/core/tools";
import { makeSchema } from "../utils/makeSchema.js";

import {
  getTransactions,
  getNetSpend,
  getTopMerchants,
  getMonthlySpend,
  getBiggestExpense,
  type TransactionFilters,
} from "../services/transactionService.js";

type TransactionInput = {
  operation: "netSpend" | "topMerchants" | "monthlyBreakdown" | "biggestExpense" | "listTransactions" | "categoryComparison";
  category?: string;
  compareCategory?: string;
  merchant?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
};

function parseFilters(ctx: TransactionInput): TransactionFilters {
  const filters: TransactionFilters = {};
  if (ctx.category && ctx.category !== "") filters.category = ctx.category;
  if (ctx.merchant && ctx.merchant !== "") filters.merchant = ctx.merchant;
  if (ctx.startDate && ctx.startDate !== "") filters.startDate = new Date(ctx.startDate);
  if (ctx.endDate && ctx.endDate !== "") filters.endDate = new Date(ctx.endDate);
  return filters;
}

export const queryTransactions = createTool({
  id: "queryTransactions",
  description: `Query spending transactions. Operations:
- netSpend: total spend (transfers excluded by default). Pass category/merchant/startDate/endDate to filter.
- topMerchants: top merchants by spend. Optional limit (default 5). Optional startDate/endDate.
- monthlyBreakdown: spend by month. Optional category to filter.
- biggestExpense: single largest non-transfer expense.
- listTransactions: sample rows (up to 20). Pass filters for category/merchant/dates.
- categoryComparison: compare spend for two categories. Requires category + compareCategory. Optional dates.
For date ranges use YYYY-MM-DD strings (e.g. Q1 2025 = startDate:2025-01-01, endDate:2025-03-31).`,

  inputSchema: makeSchema({
    type: "object",
    properties: {
      operation: { type: "string", enum: ["netSpend", "topMerchants", "monthlyBreakdown", "biggestExpense", "listTransactions", "categoryComparison"] },
      category: { type: "string" },
      compareCategory: { type: "string", description: "Second category for categoryComparison" },
      merchant: { type: "string" },
      startDate: { type: "string" },
      endDate: { type: "string" },
      limit: { type: "number" },
    },
    required: ["operation"],
    additionalProperties: false,
  }, { category: "", compareCategory: "", merchant: "", startDate: "", endDate: "", limit: 5 }),

  execute: async (inputData: unknown) => {
    const ctx = inputData as TransactionInput;
    try {
      const filters = parseFilters(ctx);

      switch (ctx.operation) {
        case "netSpend":
          return getNetSpend(filters);

        case "topMerchants": {
          const limit = ctx.limit && ctx.limit > 0 ? ctx.limit : 5;
          const data = await getTopMerchants(limit, {
            ...(filters.startDate && { startDate: filters.startDate }),
            ...(filters.endDate && { endDate: filters.endDate }),
          });
          if (!data || data.length === 0) return { result: "No merchants found" };
          return { merchants: data };
        }

        case "monthlyBreakdown": {
          const data = await getMonthlySpend(ctx.category);
          if (!data || data.length === 0) return { result: "No monthly data found" };
          return { months: data };
        }

        case "biggestExpense": {
          const data = await getBiggestExpense();
          if (!data) return { result: "No expenses found" };
          return { expense: data };
        }

        case "listTransactions": {
          const rows = await getTransactions(filters, 20);
          // Total always from aggregate, never from a capped array
          const agg = await getNetSpend(filters);
          return {
            count: rows.length,
            total: agg.total,
            currency: rows[0]?.currency ?? "INR",
            sample: rows.map((t: any) => ({
              date: t.date,
              merchant: t.merchant,
              amount: t.amount,
              category: t.category,
            })),
          };
        }

        case "categoryComparison": {
          if (!ctx.category || !ctx.compareCategory) {
            return { error: "Both category and compareCategory are required" };
          }
          const dateFilters: TransactionFilters = {};
          if (filters.startDate) dateFilters.startDate = filters.startDate;
          if (filters.endDate) dateFilters.endDate = filters.endDate;

          const [a, b] = await Promise.all([
            getNetSpend({ ...dateFilters, category: ctx.category }),
            getNetSpend({ ...dateFilters, category: ctx.compareCategory }),
          ]);
          return {
            [ctx.category]: a.total,
            [ctx.compareCategory]: b.total,
            difference: a.total - b.total,
            higher: a.total >= b.total ? ctx.category : ctx.compareCategory,
          };
        }
      }
    } catch (error) {
      console.error(error);
      return { error: "Unable to retrieve transaction data" };
    }
  },
});
