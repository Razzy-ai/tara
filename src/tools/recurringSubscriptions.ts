import {
  detectRecurringSubscriptions,
} from "../services/recurringService.js";

export async function recurringSubscriptions() {
  try {
    console.log({
      tool:
        "recurringSubscriptions",
      timestamp: new Date(),
    });

    return detectRecurringSubscriptions();
  } catch (error) {
    console.error(error);

    return {
      error:
        "Unable to detect recurring subscriptions",
    };
  }
}