const _origStringify = JSON.stringify;
(JSON as any).stringify = function(value: any, replacer?: any, space?: any) {
  const result = _origStringify.call(this, value, replacer, space);
  if (typeof result === "string" && result.includes('"tools"')) {
    try {
      const parsed = JSON.parse(result);
      if (parsed?.tools && Array.isArray(parsed.tools)) {
        for (const tool of parsed.tools) {
          const params = tool?.function?.parameters;
          if (params && typeof params === "object") {
            delete params["$schema"];
            delete params["x-optional"];
            // Only keep operation in required — everything else is optional
            if (params.required && params.properties) {
              params.required = params.required.filter(
                (k: string) => k === "operation" && k in params.properties
              );
            }
          }
        }
        return _origStringify.call(this, parsed, replacer, space);
      }
    } catch {}
  }
  return result;
};

import { taraAgent } from "../src/agents/taraAgent.js";

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const questions = [
    "How much did I spend on food?",
    "Top 5 merchants?",
    "Biggest expense?",
    "Compare food and travel spending",
    "Which fund performed best?",
    "Rank all funds",
    "What is my portfolio worth?",
    "What is my best investment?",
    "What subscriptions do I have?",
    "Rent spend in 2030?",
  ];

  for (const q of questions) {
    console.log("\n=========================");
    console.log("Q:", q);
    try {
      const response = await taraAgent.generate(q);
      console.log("A:", response.text);
    } catch (err) {
      console.error("Error:", (err as any)?.message || err);
    }

    console.log("⏳ Waiting 15 seconds before next question...");
    await sleep(15000);
  }
}

run();