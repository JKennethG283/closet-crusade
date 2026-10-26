import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { BASE_CURRENCY, CURRENCIES, type Rates } from "@/lib/currency";

// Daily reference rates from the European Central Bank via Frankfurter (free, no key).
// Re-checked every hour; the ECB publishes new rates each working day.
export async function getRates(): Promise<Rates | null> {
  "use cache";
  cacheTag("rates");
  cacheLife("hours");

  const symbols = CURRENCIES.filter((c) => c !== BASE_CURRENCY).join(",");
  try {
    const res = await fetch(
      `https://api.frankfurter.dev/v1/latest?base=${BASE_CURRENCY}&symbols=${symbols}`,
    );
    if (!res.ok) return null;
    const json = (await res.json()) as Rates;
    return { date: json.date, rates: json.rates };
  } catch {
    return null;
  }
}
