import { prisma } from "../db/prisma.js";

export async function getFundByName(name: string) {
  return prisma.fund.findFirst({
    where: { name: { contains: name, mode: "insensitive" } },
  });
}

async function getNavAt(fundId: string, date: Date, direction: "asc" | "desc") {
  return prisma.fundNav.findFirst({
    where: {
      fundId,
      date: direction === "asc" ? { gte: date } : { lte: date },
    },
    orderBy: { date: direction },
  });
}

export async function getFundReturn(
  fundName: string,
  startDate?: Date,
  endDate?: Date
) {
  const fund = await getFundByName(fundName);
  if (!fund) return { error: `Fund not found: ${fundName}` };

  const firstNav = startDate
    ? await getNavAt(fund.id, startDate, "asc")
    : await prisma.fundNav.findFirst({ where: { fundId: fund.id }, orderBy: { date: "asc" } });

  const lastNav = endDate
    ? await getNavAt(fund.id, endDate, "desc")
    : await prisma.fundNav.findFirst({ where: { fundId: fund.id }, orderBy: { date: "desc" } });

  if (!firstNav || !lastNav || firstNav.date.getTime() === lastNav.date.getTime()) {
    return { error: "Not enough NAV data in the specified window" };
  }

  const returnPct = ((lastNav.nav - firstNav.nav) / firstNav.nav) * 100;

  return {
    fund: fund.name,
    startDate: firstNav.date,
    startNav: firstNav.nav,
    endDate: lastNav.date,
    endNav: lastNav.nav,
    returnPct: Math.round(returnPct * 100) / 100,
  };
}

export async function rankFunds(startDate?: Date, endDate?: Date) {
  const funds = await prisma.fund.findMany();

  const results = await Promise.all(
    funds.map(async (fund) => {
      const firstNav = startDate
        ? await getNavAt(fund.id, startDate, "asc")
        : await prisma.fundNav.findFirst({ where: { fundId: fund.id }, orderBy: { date: "asc" } });

      const lastNav = endDate
        ? await getNavAt(fund.id, endDate, "desc")
        : await prisma.fundNav.findFirst({ where: { fundId: fund.id }, orderBy: { date: "desc" } });

      if (!firstNav || !lastNav || firstNav.date.getTime() === lastNav.date.getTime()) {
        return null;
      }

      const returnPct = ((lastNav.nav - firstNav.nav) / firstNav.nav) * 100;
      return { fund: fund.name, returnPct: Math.round(returnPct * 100) / 100 };
    })
  );

  const ranked = results
    .filter(Boolean)
    .sort((a, b) => b!.returnPct - a!.returnPct) as { fund: string; returnPct: number }[];

  if (ranked.length === 0) return { funds: [], spread: null };

//   const spread = Math.round((ranked[0].returnPct - ranked[ranked.length - 1].returnPct) * 100) / 100;
  const top = ranked[0];
const bottom = ranked[ranked.length - 1];
if (!top || !bottom) return { funds: ranked, spread: null };
const spread = Math.round((top.returnPct - bottom.returnPct) * 100) / 100;
  return { funds: ranked, spread };
}
