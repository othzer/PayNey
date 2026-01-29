import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Single source of truth for rendering a rupee amount. The app is India-only,
// so currency is always ₹. Guards against NaN/null so a bad value renders
// "₹0.00" rather than "₹NaN".
export function formatMoney(amount) {
  const num = Number(amount);
  return `₹${(Number.isFinite(num) ? num : 0).toFixed(2)}`;
}
