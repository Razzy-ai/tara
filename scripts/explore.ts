import fs from "fs";
import path from "path";

function loadJson(filePath: string) {
  return JSON.parse(
    fs.readFileSync(filePath, "utf-8")
  );
}

function analyzeSample(sampleName: string) {
  console.log("\n=================================");
  console.log(` ANALYZING ${sampleName.toUpperCase()}`);
  console.log("=================================\n");

  const transactions = loadJson(
    path.join("data", sampleName, "transactions.json")
  );

  const funds = loadJson(
    path.join("data", sampleName, "funds.json")
  );

  const holdings = loadJson(
    path.join("data", sampleName, "holdings.json")
  );

  // ---------------- TRANSACTIONS ----------------

  console.log("===== TRANSACTIONS =====");

  console.log("Total Transactions:");
  console.log(transactions.length);

  console.log("\nTransaction Fields:");
  console.log(Object.keys(transactions[0]));

  const dates = transactions.map(
    (t: any) => new Date(t.date).getTime()
  );

  console.log("\nDate Range:");
  console.log(
    "Start:",
    new Date(Math.min(...dates))
  );
  console.log(
    "End:",
    new Date(Math.max(...dates))
  );

  const categories = [
    ...new Set(
      transactions.map(
        (t: any) => t.category
      )
    ),
  ];

  console.log("\nCategories:");
  console.log(categories);

  const refunds = transactions.filter(
    (t: any) => t.amount < 0
  );

  console.log("\nRefund Count:");
  console.log(refunds.length);

  console.log("\nSample Refunds:");
  console.log(refunds.slice(0, 5));

  const transfers = transactions.filter(
    (t: any) =>
      String(t.category)
        .toLowerCase()
        .trim() === "transfer"
  );

  console.log("\nTransfer Count:");
  console.log(transfers.length);

  const merchants = [
    ...new Set(
      transactions.map(
        (t: any) => t.merchant
      )
    ),
  ];

  console.log("\nMerchant Count:");
  console.log(merchants.length);

  console.log("\nFirst 50 Merchants:");
  console.log(
    merchants.slice(0, 50)
  );

  const merchantChecks = [
    "SWIGGY",
    "ZEPTO",
    "APOLLO",
    "UBER",
  ];

  console.log("\nMerchant Alias Analysis:");

  merchantChecks.forEach((keyword) => {
    const matches = [
      ...new Set(
        transactions
          .filter((t: any) =>
            String(t.merchant)
              .toUpperCase()
              .includes(keyword)
          )
          .map(
            (t: any) => t.merchant
          )
      ),
    ];

    console.log(`\n${keyword}:`);
    console.log(matches);
  });

  console.log("\nSample Memos:");

  console.log(
    transactions
      .slice(0, 20)
      .map((t: any) => t.memo)
  );

  // ---------------- FUNDS ----------------

  console.log("\n\n===== FUNDS =====");

  console.log("Total Funds:");
  console.log(funds.length);

  console.log("\nFund Fields:");
  console.log(Object.keys(funds[0]));

  if (funds[0]?.nav) {
    console.log("\nNAV Sample:");
    console.log(
      funds[0].nav.slice(0, 3)
    );

    console.log("\nNAV Count:");
    console.log(
      funds[0].nav.length
    );
  }

  // ---------------- HOLDINGS ----------------

  console.log("\n\n===== HOLDINGS =====");

  console.log("Total Holdings:");
  console.log(holdings.length);

  console.log("\nHolding Fields:");
  console.log(
    Object.keys(holdings[0])
  );

  const fundIds = new Set(
    funds.map(
      (f: any) => f.id
    )
  );

  const missingRelations =
    holdings.filter(
      (h: any) =>
        !fundIds.has(h.fund_id)
    );

  console.log(
    "\nMissing Fund Relations:"
  );

  console.log(missingRelations);

  console.log("\nDone.");
}

// Analyze all snapshots

["sample_a", "sample_b", "sample_c"]
  .forEach(analyzeSample);