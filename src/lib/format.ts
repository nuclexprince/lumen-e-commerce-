export function formatINR(amount: number): string {
  // Indian numbering with grouping (e.g. 1,89,00 → ₹18,900)
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
  return formatted;
}
