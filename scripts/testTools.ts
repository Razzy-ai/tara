import {
  queryTransactions,
} from "../src/tools/queryTransactions.js";

import {
  queryFunds,
} from "../src/tools/queryFunds.js";

import {
  queryHoldings,
} from "../src/tools/queryHoldings.js";

import {
  recurringSubscriptions,
} from "../src/tools/recurringSubscriptions.js";

async function main() {
  console.log(
    "\n===== TRANSACTION TOOL =====\n"
  );

  console.log(
    await queryTransactions({
      operation: "netSpend",
    })
  );

  console.log(
    await queryTransactions({
      operation: "topMerchants",
    })
  );

  console.log(
    "\n===== FUND TOOL =====\n"
  );

  console.log(
    await queryFunds({
      operation: "rankFunds",
    })
  );

  console.log(
    "\n===== HOLDING TOOL =====\n"
  );

  console.log(
    await queryHoldings({
      operation:
        "portfolioValue",
    })
  );

  console.log(
    await queryHoldings({
      operation:
        "bestHolding",
    })
  );

  console.log(
    "\n===== RECURRING TOOL =====\n"
  );

  console.log(
    await recurringSubscriptions()
  );
}

main().catch(console.error);