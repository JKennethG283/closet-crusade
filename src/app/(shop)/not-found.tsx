import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl">This piece isn&apos;t here</h1>
      <p className="mt-4 text-neutral-600">It may have been removed, or the link is wrong.</p>
      <Link
        href="/"
        className="mt-8 inline-block text-xs uppercase tracking-[0.2em] underline underline-offset-4"
      >
        Browse all pieces
      </Link>
    </div>
  );
}
