import { taraAgent } from "../src/agents/taraAgent.js";

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

    const response = await taraAgent.generate(q);

    console.log("A:", response.text);
  }
}

run();