import { prisma } from "../db/prisma.js";

export async function getHoldingReturn(
  holdingId: number
) {
  const holding =
    await prisma.holding.findUnique({
      where: {
        id: holdingId,
      },
      include: {
        fund: {
          include: {
            navs: {
              orderBy: {
                date: "desc",
              },
              take: 1,
            },
          },
        },
      },
    });

  if (!holding) {
    throw new Error(
      `Holding ${holdingId} not found`
    );
  }

  const latestNav =
    holding.fund.navs[0];

  if (!latestNav) {
    throw new Error(
      "No NAV data found"
    );
  }

  const purchaseCost =
    holding.units *
    holding.purchaseNav;

  const currentValue =
    holding.units *
    latestNav.nav;

  const gain =
    currentValue -
    purchaseCost;

  const returnPct =
    (gain /
      purchaseCost) *
    100;

  return {
    fund:
      holding.fund.name,
    purchaseCost,
    currentValue,
    gain,
    returnPct,
  };
}

export async function getHoldingReturnByFundName(fundName: string) {
  const holding = await prisma.holding.findFirst({
    where: {
      fund: {
        name: { contains: fundName, mode: "insensitive" },
      },
    },
    include: {
      fund: {
        include: {
          navs: {
            orderBy: { date: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!holding) {
    return { error: `No holding found for fund matching "${fundName}"` };
  }

  const latestNav = holding.fund.navs[0];
  if (!latestNav) {
    return { error: `No NAV data available for ${holding.fund.name}` };
  }

  const cost = holding.units * holding.purchaseNav;
  const currentValue = holding.units * latestNav.nav;
  const gain = currentValue - cost;
  const returnPct = (gain / cost) * 100;

  return {
    fund: holding.fund.name,
    units: holding.units,
    purchaseNav: holding.purchaseNav,
    latestNav: latestNav.nav,
    latestNavDate: latestNav.date,
    cost: Math.round(cost * 100) / 100,
    currentValue: Math.round(currentValue * 100) / 100,
    gain: Math.round(gain * 100) / 100,
    returnPct: Math.round(returnPct * 100) / 100,
  };
}

export async function getPortfolioValue() {
  const holdings =
    await prisma.holding.findMany({
      include: {
        fund: {
          include: {
            navs: {
              orderBy: {
                date: "desc",
              },
              take: 1,
            },
          },
        },
      },
    });

  let totalCost = 0;
  let totalValue = 0;

  for (const holding of holdings) {
    const latestNav =
      holding.fund.navs[0];

    if (!latestNav) {
      continue;
    }

    totalCost +=
      holding.units *
      holding.purchaseNav;

    totalValue +=
      holding.units *
      latestNav.nav;
  }

  return {
    totalCost,
    totalValue,
    totalGain:
      totalValue -
      totalCost,
  };
}

export async function getBestHolding() {
  const holdings =
    await prisma.holding.findMany({
      include: {
        fund: {
          include: {
            navs: {
              orderBy: {
                date: "desc",
              },
              take: 1,
            },
          },
        },
      },
    });

  const returns = holdings
    .map((holding) => {
      const latestNav =
        holding.fund.navs[0];

      if (!latestNav) {
        return null;
      }

      const purchaseCost =
        holding.units *
        holding.purchaseNav;

      const currentValue =
        holding.units *
        latestNav.nav;

      const returnPct =
        ((currentValue -
          purchaseCost) /
          purchaseCost) *
        100;

      return {
        fund:
          holding.fund.name,
        returnPct,
      };
    })
    .filter(
      (
        item
      ): item is {
        fund: string;
        returnPct: number;
      } => item !== null
    )
    .sort(
      (a, b) =>
        b.returnPct -
        a.returnPct
    );

  return returns[0] ?? null;
}