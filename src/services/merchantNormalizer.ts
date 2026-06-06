const NOISE_TOKENS = new Set([
  // Generic structural suffixes / qualifiers
  "ORDER", "BOOKING", "RIDE", "PAYMENT",
  "PVT", "LTD", "LIMITED",
  "INDIA", "IN", "COM",
  "SYSTEMS", "TECHNOLOGIES", "TECHNOLOGY",
  // City tokens
  "MUMBAI", "BANGALORE", "BENGALURU", "DELHI",
  "CHENNAI", "HYDERABAD", "PUNE", "KOLKATA",
  "AHMEDABAD", "NOIDA", "GURGAON", "GURUGRAM",
  "JAIPUR", "SURAT", "LUCKNOW", "NCR",
]);

export function normalizeMerchant(merchant: string): string {
  const tokens = merchant
    .toUpperCase()
    .replace(/[*.\\/\-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 0 && !NOISE_TOKENS.has(t));

  return tokens.join(" ").trim() || merchant.toUpperCase().trim();
}
