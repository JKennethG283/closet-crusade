import Image from "next/image";
import Link from "next/link";
import { CurrencyProvider, CurrencySelect } from "@/components/currency";
import { getRates } from "@/lib/rates";
import { site } from "@/lib/site";
import logo from "../../../public/logo.png";

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const rates = await getRates();

  return (
    <CurrencyProvider rates={rates}>
      <header className="sticky top-0 z-20 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" aria-label={`${site.name} home`} className="shrink-0">
            <Image src={logo} alt={site.name} priority className="h-11 w-auto sm:h-14" />
          </Link>
          <nav className="flex items-center gap-4 text-xs uppercase tracking-[0.15em] sm:gap-6">
            <Link href="/" className="hover:underline underline-offset-4">
              Shop
            </Link>
            <Link href="/terms" className="hover:underline underline-offset-4">
              Terms
            </Link>
            <CurrencySelect />
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-24 border-t border-black/10">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm sm:grid-cols-3 sm:px-6">
          <div>
            <p className="font-display text-xl uppercase tracking-[0.12em]">{site.name}</p>
            <p className="mt-2 text-neutral-600">{site.tagline}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">How to buy</p>
            <p className="mt-2 text-neutral-700">
              Send us a DM with the item name. We&apos;ll confirm availability, shipping and payment
              details with you directly.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">Contact</p>
            <ul className="mt-2 space-y-1">
              <li>
                <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Instagram @{site.instagramHandle}
                </a>
              </li>
              <li>
                <a href={site.carousellUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Carousell Singapore @{site.carousellHandle}
                </a>
              </li>
              <li>
                <Link href="/terms" className="hover:underline">
                  Terms of purchase
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </CurrencyProvider>
  );
}
