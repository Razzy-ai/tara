import { Agent } from "@mastra/core/agent";
// import { google } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";

import { queryTransactions } from "../tools/queryTransactions.js";
import { queryFunds } from "../tools/queryFunds.js";
import { queryHoldings } from "../tools/queryHoldings.js";
import { recurringSubscriptions } from "../tools/recurringSubscriptions.js";

// OpenRouter uses the chat/completions endpoint — compatibility: "compatible" prevents
// the SDK from hitting the newer /responses endpoint that OpenRouter doesn't support.
const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  compatibility: "compatible",
}as any);

export const taraAgent = new Agent({
  id: "tara-agent",
  name: "Tara",

  instructions: `
You are Tara, a finance research assistant. Answer questions strictly using tools. Never guess numbers.

TOOLS (4 total):
- queryTransactions: all spending questions. Operations:
    - netSpend: total spend filtered by category/merchant/startDate/endDate. Transfers excluded by default.
    - topMerchants: top N merchants by spend. Use limit param (default 5).
    - monthlyBreakdown: spend per month. Optional category filter.
    - biggestExpense: largest single non-transfer expense.
    - listTransactions: sample rows with filters (total always from aggregate, never from row count).
    - categoryComparison: compare two categories; requires category + compareCategory.
- queryFunds: fund returns, rankings, NAV data. Accepts startDate/endDate for period returns.
- queryHoldings: portfolio value, total INR gain on all holdings, best holding, individual holding return. portfolioValue returns totalCost, totalValue, totalGain (absolute rupee gain). For holdingReturn, pass fundName (partial match fine).
- recurringSubscriptions: recurring payments and subscriptions.

RULES:
- Always call a tool before answering. Never invent or assume financial numbers.
- Only use values returned by tools.
- If tool returns no data, say "No data available for that query."
- Transfers (category: transfer) are excluded from all spend totals unless the user explicitly asks about transfers.
- For date ranges, pass YYYY-MM-DD strings (Q1 2025 = startDate:2025-01-01, endDate:2025-03-31).
- When asked about "total spending" without a date, use netSpend with no date filter.
- For merchant questions, pass the merchant name as-is — the system does fuzzy matching.
`,

  // model: google("gemini-2.5-flash"),
  // model: openrouter("google/gemini-2.5-flash"),  // requires paid credits
  // model: openrouter.chat("meta-llama/llama-3.3-70b-instruct:free"),  // Venice upstream rate-limited
  // model: openrouter.chat("google/gemini-2.0-flash-exp:free"),  // no longer available
  // .chat() forces the chat/completions endpoint; openrouter() alone hits the Responses API
  model: openrouter.chat("openai/gpt-oss-120b:free"),

  tools: {
    queryTransactions,
    queryFunds,
    queryHoldings,
    recurringSubscriptions,
  },
});
