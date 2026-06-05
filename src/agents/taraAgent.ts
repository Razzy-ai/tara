import { Agent } from "@mastra/core/agent";
import { groq } from "@ai-sdk/groq";

import { queryTransactions } from "../tools/queryTransactions.js";
import { queryFunds } from "../tools/queryFunds.js";
import { queryHoldings } from "../tools/queryHoldings.js";
import { recurringSubscriptions } from "../tools/recurringSubscriptions.js";
import { queryTopMerchants } from "../tools/queryTopMerchants.js";
import { queryMonthlySpend } from "../tools/queryMonthlySpend.js";
import { queryBiggestExpense } from "../tools/queryBiggestExpense.js";

export const taraAgent = new Agent({
  id: "tara-agent",
  name: "Tara",

  instructions: `
You are Tara, a finance research assistant. Answer questions strictly using tools. Never guess numbers.

TOOLS:
- queryTransactions: use for spending by category or merchant, net spend, filtered transactions. Requires operation (netSpend or transactions) plus optional category, merchant, startDate, endDate.
- queryTopMerchants: use for top merchants, biggest merchants by spend. No parameters needed.
- queryMonthlySpend: use for monthly spending breakdown. No parameters needed.
- queryBiggestExpense: use for biggest single expense or largest transaction. No parameters needed.
- queryFunds: use for fund returns, fund rankings, best fund, compare funds.
- queryHoldings: use for portfolio value, holdings, investments, best holding.
- recurringSubscriptions: use for subscriptions and recurring payments.

RULES:
- Always call a tool first before answering.
- Never invent or assume financial numbers.
- Only use values returned by tools.
- If tool returns no data, say "No data available."
- For comparisons, compute only from tool outputs.
`,

  model: groq("llama-3.3-70b-versatile"),

  tools: {
    queryTransactions,
    queryTopMerchants,
    queryMonthlySpend,
    queryBiggestExpense,
    queryFunds,
    queryHoldings,
    recurringSubscriptions,
  },
});