import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import {
  detectRecurringSubscriptions,
} from "../services/recurringService.js";

export const recurringSubscriptions =
  createTool({
    id:
      "recurringSubscriptions",

    description: `
Use for:
- subscriptions
- recurring payments
- monthly recurring charges
`,

    inputSchema: z.object({}),

    execute: async () => {
      try {
        return detectRecurringSubscriptions();
      } catch (error) {
        console.error(error);

        return {
          error:
            "Unable to detect recurring subscriptions",
        };
      }
    },
  });