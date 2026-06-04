import { prisma } from "../db/prisma.js";

function daysBetween(
  a: Date,
  b: Date
) {
  const diff =
    Math.abs(
      a.getTime() - b.getTime()
    );

  return diff / (1000 * 60 * 60 * 24);
}

export async function detectRecurringSubscriptions() {
  const merchants =
    await prisma.transaction.groupBy({
      by: ["normalizedMerchant"],
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gte: 3,
          },
        },
      },
    });

  const recurring = [];

  for (const merchant of merchants) {
    const transactions =
      await prisma.transaction.findMany({
        where: {
          normalizedMerchant:
            merchant.normalizedMerchant,
          amount: {
            gt: 0,
          },
        },
        orderBy: {
          date: "asc",
        },
      });

    if (transactions.length < 3) {
      continue;
    }

    const intervals: number[] = [];

    for (
      let i = 1;
      i < transactions.length;
      i++
    ) {
      intervals.push(
        daysBetween(
          transactions[i - 1]!.date,
          transactions[i]!.date
        )
      );
    }

    const avgInterval =
      intervals.reduce(
        (sum, days) => sum + days,
        0
      ) / intervals.length;

    // roughly monthly
    if (
      avgInterval < 25 ||
      avgInterval > 35
    ) {
      continue;
    }

    const avgAmount =
      transactions.reduce(
        (sum, tx) =>
          sum + tx.amount,
        0
      ) / transactions.length;

    recurring.push({
      merchant:
        merchant.normalizedMerchant,
      count:
        transactions.length,
      avgAmount:
        Number(
          avgAmount.toFixed(2)
        ),
      avgInterval:
        Number(
          avgInterval.toFixed(1)
        ),
    });
  }

  return recurring.sort(
    (a, b) =>
      b.count - a.count
  );
}