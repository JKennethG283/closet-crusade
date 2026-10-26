"use client";

import { createContext, use, useSyncExternalStore, type ReactNode } from "react";
import {
  BASE_CURRENCY,
  CURRENCIES,
  convert,
  formatMoney,
  isCurrency,
  type Currency,
  type Rates,
} from "@/lib/currency";

const STORAGE_KEY = "cc-currency";
const listeners = new Set<() => void>();

function readCurrency(): Currency {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isCurrency(stored) ? stored : BASE_CURRENCY;
  } catch {
    return BASE_CURRENCY;
  }
}

function setCurrency(currency: Currency) {
  try {
    localStorage.setItem(STORAGE_KEY, currency);
  } catch {
    // Private browsing: the choice just won't persist.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function useCurrency() {
  return useSyncExternalStore<Currency>(subscribe, readCurrency, () => BASE_CURRENCY);
}

const RatesContext = createContext<Rates | null>(null);

export function CurrencyProvider({ rates, children }: { rates: Rates | null; children: ReactNode }) {
  return <RatesContext value={rates}>{children}</RatesContext>;
}

export function CurrencySelect() {
  const currency = useCurrency();
  const rates = use(RatesContext);
  const options = CURRENCIES.filter((c) => c === BASE_CURRENCY || rates?.rates[c]);

  return (
    <label className="flex items-center gap-2 text-xs uppercase tracking-[0.15em]">
      <span className="sr-only">Currency</span>
      <select
        value={currency}
        onChange={(e) => isCurrency(e.target.value) && setCurrency(e.target.value)}
        className="cursor-pointer border border-black/20 bg-white px-2 py-1 text-xs tracking-[0.1em] focus:border-black focus:outline-none"
      >
        {options.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Price({ sgd, className }: { sgd: number; className?: string }) {
  const currency = useCurrency();
  const rates = use(RatesContext);
  const converted = convert(sgd, currency, rates);

  if (currency === BASE_CURRENCY || converted === null) {
    return <span className={className}>{formatMoney(sgd, BASE_CURRENCY)}</span>;
  }
  return (
    <span className={className} title={`${formatMoney(sgd, BASE_CURRENCY)} (fixed price)`}>
      ≈ {formatMoney(converted, currency)}
    </span>
  );
}

// Shown under a price when a non-SGD currency is selected.
export function PriceNote({ sgd }: { sgd: number }) {
  const currency = useCurrency();
  const rates = use(RatesContext);
  if (currency === BASE_CURRENCY || !rates?.rates[currency]) return null;

  return (
    <p className="text-xs text-neutral-500">
      Fixed price {formatMoney(sgd, BASE_CURRENCY)}. {currency} amount is an estimate using{" "}
      {rates.date} exchange rates; the final amount is confirmed in DM.
    </p>
  );
}
