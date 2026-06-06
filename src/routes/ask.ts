import { Router } from "express";
import { z } from "zod";
import { v4 as uuid } from "uuid";

import { taraAgent } from "../agents/taraAgent.js";
import { logEvent } from "../utils/logger.js";

const router = Router();

const AskSchema = z.object({
  question: z.string().min(1),
});

// Tables each tool reads — used for observability, never changes logic
const TOOL_TABLES: Record<string, string[]> = {
  queryTransactions:    ["Transaction"],
  queryFunds:           ["Fund", "FundNav"],
  queryHoldings:        ["Holding", "Fund", "FundNav"],
  recurringSubscriptions: ["Transaction"],
};

router.post("/ask", async (req, res) => {
  const requestId = uuid();
  const start = Date.now();

  try {
    const parsed = AskSchema.safeParse(req.body);

    if (!parsed.success) {
      logEvent({
        request_id: requestId,
        status: "invalid_request",
        error: parsed.error.flatten(),
        latency_ms: Date.now() - start,
      });
      return res.status(400).json({ error: "Invalid request" });
    }

    const question = parsed.data.question;

    const response = await taraAgent.generate(question);

    // Collect tool-call trace — ToolCallChunk has { type, payload: { toolName, args } }
    const toolCalls = (response.toolCalls ?? []) as Array<{
      payload?: { toolName?: string; args?: Record<string, unknown> };
      toolName?: string;
      args?: Record<string, unknown>;
    }>;

    const tools = toolCalls.map((tc) =>
      tc.payload?.toolName ?? tc.toolName ?? "unknown"
    );

    const toolInputs = toolCalls.map((tc) => {
      const args = tc.payload?.args ?? tc.args ?? {};
      const toolName = tc.payload?.toolName ?? tc.toolName ?? "unknown";
      // Log keys/shapes only — never raw string values that could contain secrets
      return {
        tool: toolName,
        inputKeys: Object.keys(args),
        operation: typeof args.operation === "string" ? args.operation : undefined,
      };
    });

    const tablesRead = [
      ...new Set(
        tools.flatMap((name) => TOOL_TABLES[name] ?? [])
      ),
    ];

    logEvent({
      request_id: requestId,
      question,
      tools,
      tool_inputs: toolInputs,
      tables_read: tablesRead,
      latency_ms: Date.now() - start,
      status: "success",
    });

    return res.json({ answer: response.text });
  } catch (error) {
    logEvent({
      request_id: requestId,
      status: "error",
      error: error instanceof Error ? error.message : "unknown error",
      latency_ms: Date.now() - start,
    });

    return res.status(500).json({ answer: "Unable to process request." });
  }
});

export default router;
