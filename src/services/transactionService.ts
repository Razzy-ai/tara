import { prisma } from "../db/prisma.js";

export type TransactionFilters = {
  category?: string;
  merchant?: string;
  startDate?: Date;
  endDate?: Date;
};

function transferExclusionClause(filters: TransactionFilters): object {
  // If a specific category is already filtered, don't add a second NOT clause
  if (filters.category) return {};
  return { NOT: { category: "transfer" } };
}

function buildWhere(
  filters: TransactionFilters
) {
  const where: any = {};

  if (filters.category) {
    where.category = filters.category.toLowerCase();
  }

  if (filters.merchant) {
    where.OR = [
      { normalizedMerchant: { contains: filters.merchant.toUpperCase() } },
      { merchant: { contains: filters.merchant, mode: "insensitive" } },
    ];
  }

  if (
    filters.startDate ||
    filters.endDate
  ) {
    where.date = {};

    if (filters.startDate) {
      where.date.gte =
        filters.startDate;
    }

    if (filters.endDate) {
      where.date.lte =
        filters.endDate;
    }
  }

  return where;
}

export async function getTransactions(
  filters: TransactionFilters = {},
  limit = 20
) {
  return prisma.transaction.findMany({
    where: buildWhere(filters),
    take: limit,
    orderBy: { date: "desc" },
  });
}

export async function getNetSpend(
  filters: TransactionFilters = {}
) {
  const result =
    await prisma.transaction.aggregate({
      where: { ...buildWhere(filters), ...transferExclusionClause(filters) },
      _sum: {
        amount: true,
      },
    });

  return {
    total:
      result._sum?.amount ?? 0,
  };
}

export async function getTopMerchants(
  limit = 5,
  filters: Pick<TransactionFilters, "startDate" | "endDate"> = {}
) {
  const dateWhere: any = {};
  if (filters.startDate || filters.endDate) {
    dateWhere.date = {};
    if (filters.startDate) dateWhere.date.gte = filters.startDate;
    if (filters.endDate)   dateWhere.date.lte = filters.endDate;
  }

  const rows =
    await prisma.transaction.groupBy({
      by: ["normalizedMerchant"],
      where: { NOT: { category: "transfer" }, ...dateWhere },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: "desc",
        },
      },
      take: limit,
    });

  return rows.map((row) => ({
    merchant:
      row.normalizedMerchant,
    total:
      row._sum?.amount ?? 0,
  }));
}

export async function getCategorySpend(
  category: string
) {
  const result =
    await prisma.transaction.aggregate({
      where: {
        category,
      },
      _sum: {
        amount: true,
      },
    });

  return {
    category,
    total:
      result._sum?.amount ?? 0,
  };
}

export async function getBiggestExpense() {
  const transaction =
    await prisma.transaction.findFirst({
      where: {
        amount: { gt: 0 },
        NOT: { category: "transfer" },
      },
      orderBy: {
        amount: "desc",
      },
    });

  if (!transaction) {
    return null;
  }

  return {
    merchant:
      transaction.normalizedMerchant,
    amount:
      transaction.amount,
    date:
      transaction.date,
  };
}

export async function getMonthlySpend(category?: string) {
  const where: any = { NOT: { category: "transfer" } };
  if (category) where.category = category.toLowerCase();
  const transactions =
    await prisma.transaction.findMany({
      where,
      select: {
        date: true,
        amount: true,
      },
    });

  const monthlyTotals =
    new Map<string, number>();

  for (const tx of transactions) {
    const key = `${tx.date.getFullYear()}-${String(
      tx.date.getMonth() + 1
    ).padStart(2, "0")}`;

    monthlyTotals.set(
      key,
      (monthlyTotals.get(key) ?? 0) +
        tx.amount
    );
  }

  return Array.from(
    monthlyTotals.entries()
  )
    .map(([month, total]) => ({
      month,
      total,
    }))
    .sort((a, b) =>
      a.month.localeCompare(b.month)
    );
}

export async function getCategoryGrowth(
  category: string,
  previousMonthStart: Date,
  previousMonthEnd: Date,
  currentMonthStart: Date,
  currentMonthEnd: Date
) {
  const previous =
    await getNetSpend({
      category,
      startDate:
        previousMonthStart,
      endDate:
        previousMonthEnd,
    });

  const current =
    await getNetSpend({
      category,
      startDate:
        currentMonthStart,
      endDate:
        currentMonthEnd,
    });

  return {
    previousMonth:
      previous.total,
    currentMonth:
      current.total,
    growth:
      current.total -
      previous.total,
  };
}