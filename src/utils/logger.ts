import fs from "fs";
import path from "path";

const logFilePath = path.join("logs", "app.log");

export function logEvent(event: Record<string, any>) {
  try {
    const line = JSON.stringify(event) + "\n";

    fs.appendFileSync(logFilePath, line, "utf8");
  } catch (error) {
    console.error("Logger Error:", error);
  }
}