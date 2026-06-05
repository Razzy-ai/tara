import { createTool } from "@mastra/core/tools";
import { makeSchema } from "../utils/makeSchema.js";
import { detectRecurringSubscriptions } from "../services/recurringService.js";

export const recurringSubscriptions = createTool({
  id: "recurringSubscriptions",
  description: "Use for: subscriptions, recurring payments, monthly recurring charges",

  inputSchema: makeSchema({
    type: "object",
    properties: {},
    required: [],
    additionalProperties: false,
  }),

  execute: async () => {
    try {
      const data = await detectRecurringSubscriptions();
      if (!data || data.length === 0) return { result: "No recurring subscriptions found" };
      return { subscriptions: data };
    } catch (error) {
      console.error(error);
      return { error: "Unable to detect recurring subscriptions" };
    }
  },
});