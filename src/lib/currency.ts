export const CURRENCIES = ["SGD", "IDR", "MYR", "USD", "EUR", "GBP", "AUD", "JPY"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const BASE_CURRENCY: Currency = "SGD";

// Units of each currency per 1 SGD.
export type Rates = {
  date: string;
  rates: Partial<Record<Currency, number>>;
};

export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && (CURRENCIES as readonly string[]).includes(value);
}

export function convert(amountSgd: number, currency: Currency, rates: Rates | null) {
  if (currency === BASE_CURRENCY) return amountSgd;
  const rate = rates?.rates[currency];
  return rate ? amountSgd * rate : null;
}

export function formatMoney(amount: number, currency: Currency) {
  const value = currency === BASE_CURRENCY ? amount : roundForDisplay(amount, currency);
  const decimals = Number.isInteger(value) ? 0 : 2;
  return `${currency} ${value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

// Converted prices are estimates, so show them rounded rather than falsely precise.
function roundForDisplay(amount: number, currency: Currency) {
  if (currency === "IDR") return Math.round(amount / 1000) * 1000;
  if (currency === "JPY") return Math.round(amount / 10) * 10;
  return Math.round(amount);
}
