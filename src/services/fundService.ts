import { prisma } from "../db/prisma.js";

export async function getFundByName(
    name: string
) {
    return prisma.fund.findFirst({
        where: {
            name: {
                contains: name,
                mode: "insensitive",
            },
        },
    });
}

export async function getFundReturn(
    fundName: string
) {
    const fund =
        await getFundByName(fundName);

    if (!fund) {
        throw new Error(
            `Fund not found: ${fundName}`
        );
    }

    const navs =
        await prisma.fundNav.findMany({
            where: {
                fundId: fund.id,
            },
            orderBy: {
                date: "asc",
            },
        });

    if (navs.length < 2) {
        throw new Error(
            "Not enough NAV data"
        );
    }

    const firstNav = navs[0];
    const lastNav = navs.at(-1);

    if (!firstNav || !lastNav) {
        throw new Error("Not enough NAV data");
    }

    const startNav = firstNav.nav;
    const endNav = lastNav.nav;

    const returnPct =
        ((endNav - startNav) /
            startNav) *
        100;

    return {
        fund: fund.name,
        startNav,
        endNav,
        returnPct,
    };
}

export async function rankFunds() {
    const funds =
        await prisma.fund.findMany({
            include: {
                navs: {
                    orderBy: {
                        date: "asc",
                    },
                },
            },
        });

    const rankings = funds
        .map((fund) => {
            if (fund.navs.length < 2) {
                return null;
            }

            const firstNav = fund.navs[0];
            const lastNav = fund.navs.at(-1);

            if (!firstNav || !lastNav) {
                return null;
            }

            const startNav = firstNav.nav;
            const endNav = lastNav.nav;

            const returnPct =
                ((endNav - startNav) /
                    startNav) *
                100;

            return {
                fund: fund.name,
                returnPct,
            };
        })
        .filter(Boolean)
        .sort(
            (a, b) =>
                b!.returnPct -
                a!.returnPct
        );

    return rankings;
}