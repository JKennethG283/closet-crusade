import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/currency";
import { imageUrl } from "@/lib/images";
import { STATUS_LABELS, type Item } from "@/lib/types";

export function ItemCard({ item, priority }: { item: Item; priority?: boolean }) {
  const cover = item.item_images[0];
  const unavailable = item.status !== "available";

  return (
    <Link href={`/items/${item.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        {cover && (
          <Image
            src={imageUrl(cover.path)}
            alt={item.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={`object-cover transition duration-500 group-hover:scale-[1.03] ${
              item.status === "sold" ? "opacity-60" : ""
            }`}
          />
        )}
        {unavailable && (
          <span className="absolute left-2 top-2 bg-black px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-white">
            {STATUS_LABELS[item.status]}
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1">
        {item.brand && (
          <p className="text-[11px] uppercase tracking-[0.15em] text-neutral-500">{item.brand}</p>
        )}
        <p className="text-sm leading-snug">{item.name}</p>
        <p className={`text-sm ${item.status === "sold" ? "text-neutral-400 line-through" : ""}`}>
          <Price sgd={item.price_sgd} />
        </p>
      </div>
    </Link>
  );
}
