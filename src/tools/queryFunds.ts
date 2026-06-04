import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import {
  getFundReturn,
  rankFunds,
} from "../services/fundService.js";

export const queryFunds =
  createTool({
    id: "queryFunds",

    description: `
Use for:
- fund returns
- fund rankings
- best funds
- compare funds
`,

    inputSchema: z.object({
      fundName:
        z.string().optional(),

      operation: z.enum([
        "fundReturn",
        "rankFunds",
      ]),
    }),

    execute: async (
      context,
    ) => {
      try {
        switch (
          context.operation
        ) {
          case "fundReturn":
            if (
              !context.fundName
            ) {
              return {
                error:
                  "fundName required",
              };
            }

            return getFundReturn(
              context.fundName
            );

          case "rankFunds":
            return rankFunds();
        }
      } catch (error) {
        console.error(error);

        return {
          error:
            "Unable to retrieve fund data",
        };
      }
    },
  });