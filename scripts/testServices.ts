import { prisma } from "../src/db/prisma.js";
import {
  getTransactions,
  getNetSpend,
  getTopMerchants,
  getCategorySpend,
  getMonthlySpend,
  getBiggestExpense,
} from "../src/services/transactionService.js";

import {
  getFundReturn,
  rankFunds,
} from "../src/services/fundService.js";

import {
  getPortfolioValue,
  getBestHolding,
  getHoldingReturn,
} from "../src/services/holdingService.js";

import {
  detectRecurringSubscriptions,
} from "../src/services/recurringService.js";

async function main() {
  console.log("\n===== TRANSACTION SERVICE TESTS =====\n");

  // 1. Total net spend
  const netSpend = await getNetSpend();

  console.log("Net Spend:");
  console.log(netSpend);

  // 2. Top merchants
  const topMerchants =
    await getTopMerchants();

  console.log("\nTop Merchants:");
  console.table(topMerchants);

  // 3. Food category spend
  const foodSpend =
    await getCategorySpend("Food");

  console.log("\nFood Spend:");
  console.log(foodSpend);

  // 4. Biggest expense
  const biggestExpense =
    await getBiggestExpense();

  console.log("\nBiggest Expense:");
  console.log(biggestExpense);

  // 5. Monthly spend
  const monthlySpend =
    await getMonthlySpend();

  console.log("\nMonthly Spend:");
  console.table(monthlySpend);

  // 6. Sample transactions
  const transactions =
    await getTransactions();

  console.log(
    `\nSample Transactions (first 5 of ${transactions.length})`
  );

  console.table(
    transactions.slice(0, 5)
  );

  console.log(
  "\n===== FUND SERVICE TESTS =====\n"
);

const rankings =
  await rankFunds();

console.table(rankings);

if (rankings.length > 0 && rankings[0]) {
  const fundReturn =
    await getFundReturn(
      rankings[0].fund
    );

  console.log(
    "\nTop Fund Return:"
  );

  console.log(fundReturn);
}

 console.log(
  "\n===== HOLDING SERVICE TESTS =====\n"
);

const portfolio =
  await getPortfolioValue();

console.log(
  "Portfolio Value:"
);

console.log(portfolio);

const bestHolding =
  await getBestHolding();

console.log(
  "\nBest Holding:"
);

console.log(bestHolding);

// const firstHolding =
//   await getHoldingReturn(1);

// console.log(
//   "\nHolding Return:"
// );

// console.log(firstHolding);
const holding =
  await prisma.holding.findFirst();

if (holding) {
  const result =
    await getHoldingReturn(
      holding.id
    );

  console.log(
    "\nHolding Return:"
  );

  console.log(result);
}

 console.log(
  "\n===== RECURRING SUBSCRIPTIONS =====\n"
);

const recurring =
  await detectRecurringSubscriptions();

console.table(recurring);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));