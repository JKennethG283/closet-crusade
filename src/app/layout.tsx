import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: site.url ? new URL(site.url) : undefined,
  title: { default: `${site.name} — ${site.tagline}`, template: `%s · ${site.name}` },
  description:
    "Curated second-hand fashion: accessible designer pieces and unexpected vintage finds. Browse for your next grail.",
  openGraph: { siteName: site.name, type: "website" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
