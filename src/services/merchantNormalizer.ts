export function normalizeMerchant(
  merchant: string
): string {
  return merchant
    .toUpperCase()
    .replace(/\*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}