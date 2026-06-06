import "dotenv/config";
import { taraAgent } from "../src/agents/taraAgent.js";

interface TestCase {
  input: string;
  expectContains?: string[];
  expectNoData?: boolean;
  description: string;
}

const testCases: TestCase[] = [
  {
    description: "Single category lookup",
    input: "How much did I spend on food?",
    expectContains: ["₹", "food", "spent"],
  },
  {
    description: "Top merchants",
    input: "What are my top 5 merchants by spend?",
    expectContains: ["1.", "2.", "3."],
  },
  {
    description: "Biggest single expense",
    input: "What was my biggest single expense?",
    expectContains: ["₹"],
  },
  {
    description: "Category comparison",
    input: "Compare my food and travel spending.",
    expectContains: ["food", "travel"],
  },
  {
    description: "Month over month spending",
    input: "Did my food spending increase from February to March 2025?",
    expectContains: ["February", "March"],
  },
  {
    description: "Refunds handling",
    input: "How much did I spend on food in March 2025 after refunds?",
    expectContains: ["₹"],
  },
  {
    description: "Merchant alias",
    input: "How much did I spend on Swiggy including all variants?",
    expectContains: ["₹", "Swiggy"],
  },
  {
    description: "Exclude transfers",
    input: "What was my total actual spending in Q1 2025 excluding transfers?",
    expectContains: ["₹"],
  },
  {
    description: "Fund rankings",
    input: "Rank all my funds by performance.",
    expectContains: ["rank", "%"],
  },
  {
    description: "Best fund",
    input: "Which fund performed best?",
    expectContains: ["fund", "%"],
  },
  {
    description: "Portfolio value",
    input: "What is my portfolio worth today?",
    expectContains: ["₹"],
  },
  {
    description: "Realised return on holding",
    input: "What is my realised return on my best holding?",
    expectContains: ["%", "return"],
  },
  {
    description: "Recurring subscriptions",
    input: "What subscriptions do I have?",
    expectContains: ["merchant", "recurring"],
  },
  {
    description: "No data case",
    input: "How much did I spend on rent in April 2030?",
    expectNoData: true,
  },
];

async function runEval() {
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  console.log("=== Tara Agent Eval ===\n");

  for (const tc of testCases) {
    console.log(`TEST: ${tc.description}`);
    console.log(`Q: ${tc.input}`);

    try {
      const res = await taraAgent.generate(tc.input);
      const output = res.text?.toLowerCase() ?? "";

      let pass = true;

      if (tc.expectNoData) {
        pass =
          output.includes("no data") ||
          output.includes("no information") ||
          output.includes("not found") ||
          output.includes("didn") ||
          output.includes("no rent") ||
          output.includes("not recorded") ||
          output.includes("no spending");
      } else if (tc.expectContains) {
        pass = tc.expectContains.every((term) =>
          output.includes(term.toLowerCase())
        );
      }

      if (pass) {
        console.log("✅ PASS");
        passed++;
      } else {
        console.log("❌ FAIL");
        console.log("Expected:", tc.expectContains ?? "no data response");
        console.log("Got:", res.text?.slice(0, 200));
        failed++;
        failures.push(tc.description);
      }
    } catch (err) {
      console.log("❌ ERROR:", err);
      failed++;
      failures.push(`${tc.description} (exception)`);
    }

    console.log("---");
  }

  console.log("\n=== RESULTS ===");
  console.log(`Passed: ${passed}/${testCases.length}`);
  console.log(`Failed: ${failed}/${testCases.length}`);
  if (failures.length > 0) {
    console.log("\nFailed cases:");
    failures.forEach((f) => console.log(" -", f));
  }
}

runEval();