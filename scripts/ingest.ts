import "dotenv/config";
import fs from "fs";
import path from "path";

import { PrismaClient } from "../src/generated/prisma/client.js";

import {
  normalizeMerchant,
} from "../src/services/merchantNormalizer.js";

const prisma = new PrismaClient();

async function main() {
 
  const DATA_DIR = process.env.DATA_DIR?.trim();

  if (!DATA_DIR) {
    throw new Error("DATA_DIR missing");
  }

  console.log(`Using data from: ${DATA_DIR}`);

  // =========================
  // TRANSACTIONS
  // =========================

  const transactions = JSON.parse(
    fs.readFileSync(
      path.join(DATA_DIR, "transactions.json"),
      "utf-8"
    )
  );

  const transactionRows = transactions.map(
    (t: any) => ({
      id: t.id,
      date: new Date(t.date),
      merchant: t.merchant,
      normalizedMerchant: normalizeMerchant(
        t.merchant
      ),
      category: t.category,
      amount: t.amount,
      currency: t.currency,
      memo: t.memo,
    })
  );

  await prisma.transaction.deleteMany();

  await prisma.transaction.createMany({
    data: transactionRows,
  });

  console.log(
    `Transactions inserted: ${transactionRows.length}`
  );

  // =========================
  // FUNDS
  // =========================

  const funds = JSON.parse(
    fs.readFileSync(
      path.join(DATA_DIR, "funds.json"),
      "utf-8"
    )
  );

  // delete child tables first
  await prisma.fundNav.deleteMany();
  await prisma.holding.deleteMany();
  await prisma.fund.deleteMany();

  const fundRows = funds.map(
    (f: any) => ({
      id: f.id,
      name: f.name,
      category: f.category,
    })
  );

  await prisma.fund.createMany({
    data: fundRows,
  });

  console.log(
    `Funds inserted: ${fundRows.length}`
  );

  // =========================
  // NAV HISTORY
  // =========================

  const navRows: any[] = [];

  for (const fund of funds) {
    for (const point of fund.nav) {
      navRows.push({
        fundId: fund.id,
        date: new Date(point.date),

        // your dataset uses "value"
        nav: point.value,
      });
    }
  }

  await prisma.fundNav.createMany({
    data: navRows,
  });

  console.log(
    `NAV records inserted: ${navRows.length}`
  );

  // =========================
  // HOLDINGS
  // =========================

  const holdings = JSON.parse(
    fs.readFileSync(
      path.join(DATA_DIR, "holdings.json"),
      "utf-8"
    )
  );

  const holdingRows = holdings.map(
    (h: any) => ({
      fundId: h.fund_id,
      units: h.units,
      purchaseDate: new Date(
        h.purchase_date
      ),
      purchaseNav: h.purchase_nav,
    })
  );

  await prisma.holding.createMany({
    data: holdingRows,
  });

  console.log(
    `Holdings inserted: ${holdingRows.length}`
  );

  // =========================
  // SUMMARY
  // =========================

  console.log(`
=================================
INGESTION COMPLETE
=================================

Transactions inserted: ${transactionRows.length}
Funds inserted: ${fundRows.length}
NAV records inserted: ${navRows.length}
Holdings inserted: ${holdingRows.length}
`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });