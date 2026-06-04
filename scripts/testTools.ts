import { queryTransactions } from "../src/tools/queryTransactions.js";
import { queryFunds } from "../src/tools/queryFunds.js";
import { queryHoldings } from "../src/tools/queryHoldings.js";
import { recurringSubscriptions } from "../src/tools/recurringSubscriptions.js";

async function main() {
  const toolContext = {} as any;

  console.log("\n===== TRANSACTION TOOL =====\n");

  console.log(
    await queryTransactions.execute!(
      {
        operation: "netSpend",
      },
      toolContext
    )
  );

  console.log(
    await queryTransactions.execute!(
      {
        operation: "topMerchants",
      },
      toolContext
    )
  );

  console.log("\n===== FUND TOOL =====\n");

  console.log(
    await queryFunds.execute!(
      {
        operation: "rankFunds",
      },
      toolContext
    )
  );

  console.log("\n===== HOLDING TOOL =====\n");

  console.log(
    await queryHoldings.execute!(
      {
        operation: "portfolioValue",
      },
      toolContext
    )
  );

  console.log(
    await queryHoldings.execute!(
      {
        operation: "bestHolding",
      },
      toolContext
    )
  );

  console.log("\n===== RECURRING TOOL =====\n");

  console.log(
    await recurringSubscriptions.execute!(
      {},
      toolContext
    )
  );
}

main().catch(console.error);