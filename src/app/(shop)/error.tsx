"use client";

export default function ShopError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl">Something went wrong</h1>
      <p className="mt-4 text-neutral-600">We couldn&apos;t load the shop just now.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 text-xs uppercase tracking-[0.2em] underline underline-offset-4"
      >
        Try again
      </button>
    </div>
  );
}
