import { z } from "zod";

import {
  getFundReturn,
  rankFunds,
} from "../services/fundService.js";

export const queryFundsSchema =
  z.object({
    fundName: z.string().optional(),

    operation: z.enum([
      "fundReturn",
      "rankFunds",
    ]),
  });

export async function queryFunds(
  input: z.infer<
    typeof queryFundsSchema
  >
) {
  try {
    console.log({
      tool: "queryFunds",
      operation: input.operation,
      timestamp: new Date(),
    });

    switch (input.operation) {
      case "fundReturn":
        if (!input.fundName) {
          return {
            error:
              "fundName is required",
          };
        }

        return getFundReturn(
          input.fundName
        );

      case "rankFunds":
        return rankFunds();

      default:
        return {
          error:
            "Unsupported fund operation",
        };
    }
  } catch (error) {
    console.error(error);

    return {
      error:
        "Unable to retrieve fund data",
    };
  }
}