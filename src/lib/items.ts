import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { sortImages } from "@/lib/images";
import { ITEM_SELECT, type Item } from "@/lib/types";

export const ITEMS_TAG = "items";

function normalize(item: Item): Item {
  return { ...item, price_sgd: Number(item.price_sgd), item_images: sortImages(item.item_images) };
}

export async function getPublishedItems(): Promise<Item[]> {
  "use cache";
  cacheTag(ITEMS_TAG);
  cacheLife("minutes");

  const { data, error } = await createPublicClient()
    .from("items")
    .select(ITEM_SELECT)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Could not load items: ${error.message}`);
  return (data as Item[]).map(normalize);
}

export async function getPublishedItem(slug: string): Promise<Item | null> {
  "use cache";
  cacheTag(ITEMS_TAG);
  cacheLife("minutes");

  const { data, error } = await createPublicClient()
    .from("items")
    .select(ITEM_SELECT)
    .eq("is_published", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Could not load item: ${error.message}`);
  return data ? normalize(data as Item) : null;
}
