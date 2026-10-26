import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin";
import { sortImages } from "@/lib/images";
import { ITEM_SELECT, type Item } from "@/lib/types";
import { ItemEditor } from "../item-editor";

export default function EditItemPage({ params }: PageProps<"/admin/items/[id]">) {
  return (
    <>
      <Link href="/admin" className="text-sm text-neutral-600 hover:text-black">
        ← Back to items
      </Link>
      <Suspense fallback={<p className="mt-8 text-neutral-500">Loading…</p>}>
        <EditItem params={params} />
      </Suspense>
    </>
  );
}

async function EditItem({ params }: Pick<PageProps<"/admin/items/[id]">, "params">) {
  const { supabase } = await requireAdmin();
  const { id } = await params;

  const { data } = await supabase.from("items").select(ITEM_SELECT).eq("id", id).maybeSingle();
  if (!data) notFound();

  const item = data as Item;
  item.item_images = sortImages(item.item_images);
  item.price_sgd = Number(item.price_sgd);

  return (
    <>
      <h1 className="mt-3 font-display text-3xl">Edit item</h1>
      {item.is_published && (
        <Link
          href={`/items/${item.slug}`}
          target="_blank"
          className="mt-1 inline-block text-sm text-neutral-600 underline hover:text-black"
        >
          View on shop ↗
        </Link>
      )}
      <div className="mt-8">
        <ItemEditor key={item.id} item={item} />
      </div>
    </>
  );
}
