import { createTool } from "@mastra/core/tools";
import { makeSchema } from "../utils/makeSchema.js";
import { getTopMerchants } from "../services/transactionService.js";

export const queryTopMerchants = createTool({
  id: "queryTopMerchants",
  description: "Use for: top merchants, most visited merchants, biggest merchants by spend",

  inputSchema: makeSchema({
    type: "object",
    properties: {},
    required: [],
    additionalProperties: false,
  }),

  execute: async () => {
    try {
      const data = await getTopMerchants();
      if (!data || data.length === 0) return { result: "No merchants found" };
      return { merchants: data };
    } catch (error) {
      console.error(error);
      return { error: "Unable to retrieve merchants" };
    }
  },
});