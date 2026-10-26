import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Price, PriceNote } from "@/components/currency";
import { Gallery } from "@/components/gallery";
import { getPublishedItem, getPublishedItems } from "@/lib/items";
import { imageUrl } from "@/lib/images";
import { site } from "@/lib/site";
import { STATUS_LABELS } from "@/lib/types";

export async function generateStaticParams() {
  const items = await getPublishedItems();
  // Cache Components needs at least one param at build time; unknown slugs render on first visit.
  return items.length > 0 ? items.map((item) => ({ slug: item.slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/items/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublishedItem(slug);
  if (!item) return { title: "Item not found" };

  const cover = item.item_images[0];
  return {
    title: item.brand ? `${item.brand} ${item.name}` : item.name,
    description: item.description || `${item.name}, curated by ${site.name}.`,
    openGraph: cover
      ? { images: [{ url: imageUrl(cover.path), width: 1080, height: 1080 }] }
      : undefined,
  };
}

export default function ItemPage({ params }: PageProps<"/items/[slug]">) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
      <Link
        href="/"
        className="text-xs uppercase tracking-[0.15em] text-neutral-500 hover:text-black"
      >
        ← All pieces
      </Link>
      <Suspense fallback={<ItemSkeleton />}>
        <ItemDetails params={params} />
      </Suspense>
    </div>
  );
}

async function ItemDetails({ params }: Pick<PageProps<"/items/[slug]">, "params">) {
  const { slug } = await params;
  const item = await getPublishedItem(slug);
  if (!item) notFound();

  const details = [
    ["Brand", item.brand],
    ["Size", item.size],
    ["Condition", item.condition],
  ].filter(([, value]) => value);

  return (
    <article className="mt-6 grid gap-10 md:grid-cols-2 md:gap-14">
      <Gallery name={item.name} urls={item.item_images.map((img) => imageUrl(img.path))} />

      <div className="md:pt-2">
        {item.brand && (
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{item.brand}</p>
        )}
        <h1 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">{item.name}</h1>

        <div className="mt-5 flex items-center gap-3">
          <p className={`text-xl ${item.status === "sold" ? "text-neutral-400 line-through" : ""}`}>
            <Price sgd={item.price_sgd} />
          </p>
          {item.status !== "available" && (
            <span className="bg-black px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-white">
              {STATUS_LABELS[item.status]}
            </span>
          )}
        </div>
        <div className="mt-2">
          <PriceNote sgd={item.price_sgd} />
        </div>

        {details.length > 0 && (
          <dl className="mt-8 divide-y divide-black/10 border-y border-black/10 text-sm">
            {details.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-6 py-3">
                <dt className="text-neutral-500">{label}</dt>
                <dd className="text-right">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {item.description && (
          <p className="mt-8 whitespace-pre-line leading-relaxed text-neutral-700">
            {item.description}
          </p>
        )}

        {item.status === "sold" ? (
          <p className="mt-10 text-sm text-neutral-600">
            This piece has found a new home. Follow{" "}
            <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="underline">
              @{site.instagramHandle}
            </a>{" "}
            for new arrivals.
          </p>
        ) : (
          <div className="mt-10 space-y-3">
            <a
              href={site.instagramDmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-black px-6 py-4 text-center text-xs uppercase tracking-[0.2em] text-white hover:bg-neutral-800"
            >
              DM on Instagram to buy
            </a>
            <a
              href={site.carousellUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-black px-6 py-4 text-center text-xs uppercase tracking-[0.2em] hover:bg-black hover:text-white"
            >
              Message on Carousell
            </a>
            <p className="pt-1 text-xs leading-relaxed text-neutral-500">
              Mention &ldquo;{item.name}&rdquo; in your message. Free tracked shipping to
              Indonesia, Singapore and Malaysia. All sales are final; see our{" "}
              <Link href="/terms" className="underline">
                terms
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

function ItemSkeleton() {
  return (
    <div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-14">
      <div className="aspect-square animate-pulse bg-neutral-100" />
      <div className="space-y-4 md:pt-2">
        <div className="h-3 w-24 animate-pulse bg-neutral-100" />
        <div className="h-9 w-3/4 animate-pulse bg-neutral-100" />
        <div className="h-6 w-28 animate-pulse bg-neutral-100" />
      </div>
    </div>
  );
}
