import { Router } from "express";
import { z } from "zod";
import { v4 as uuid } from "uuid";

import { taraAgent } from "../agents/taraAgent.js";
import { logEvent } from "../utils/logger.js";

const router = Router();

const AskSchema = z.object({
  question: z.string().min(1),
});

router.post("/ask", async (req, res) => {
  const requestId = uuid();

  try {
    /**
     * Step 1: Validate request
     */
    const parsed = AskSchema.safeParse(req.body);

    if (!parsed.success) {
      logEvent({
        requestId,
        stage: "invalid_request",
        error: parsed.error.flatten(),
        timestamp: new Date().toISOString(),
      });

      return res.status(400).json({
        error: "Invalid request",
      });
    }

    const question = parsed.data.question;

    /**
     * Step 2: Log request received
     */
    logEvent({
      requestId,
      stage: "request_received",
      question,
      timestamp: new Date().toISOString(),
    });

    /**
     * Step 3: Log agent start
     */
    logEvent({
      requestId,
      stage: "agent_started",
    });

    /**
     * Step 4: Call agent
     */
    const response = await taraAgent.generate(question);

    /**
     * Step 5: Log response sent
     */
    logEvent({
      requestId,
      stage: "response_sent",
    });

    return res.json({
      answer: response.text,
    });
  } catch (error) {
    /**
     * Step 6: Error logging
     */
    logEvent({
      requestId,
      stage: "error",
      message:
        error instanceof Error ? error.message : "unknown error",
    });

    return res.status(500).json({
      answer: "Unable to process request.",
    });
  }
});

export default router;