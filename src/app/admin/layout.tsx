import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex-1 bg-neutral-50">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link href="/admin" className="font-display text-xl uppercase tracking-[0.12em]">
            Closet Crusade <span className="text-neutral-400">Admin</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" target="_blank" className="text-neutral-600 hover:text-black">
              View shop ↗
            </Link>
            <form action={signOut}>
              <button type="submit" className="text-neutral-600 hover:text-black">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
