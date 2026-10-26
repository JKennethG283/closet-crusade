import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin";
import { imageUrl, sortImages } from "@/lib/images";
import { ITEM_SELECT, type Item } from "@/lib/types";
import { SavedNotice } from "./saved-notice";
import { StatusSelect } from "./status-select";

export default function AdminHome() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl">Your items</h1>
        <Link
          href="/admin/items/new"
          className="rounded-md bg-black px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
        >
          + Add new item
        </Link>
      </div>
      <Suspense>
        <SavedNotice />
      </Suspense>
      <Suspense fallback={<p className="mt-8 text-neutral-500">Loading items…</p>}>
        <ItemList />
      </Suspense>
    </>
  );
}

async function ItemList() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("items")
    .select(ITEM_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="mt-8 text-red-700">Could not load items: {error.message}</p>;
  }

  const items = data as Item[];
  if (items.length === 0) {
    return (
      <p className="mt-8 rounded-lg border border-dashed border-black/20 bg-white p-10 text-center text-neutral-600">
        No items yet. Tap <strong>+ Add new item</strong> to list your first piece.
      </p>
    );
  }

  return (
    <ul className="mt-8 divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
      {items.map((item) => {
        const cover = sortImages(item.item_images)[0];
        return (
          <li key={item.id} className="flex items-center gap-4 p-3 sm:p-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-neutral-100 sm:h-20 sm:w-20">
              {cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl(cover.path)} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{item.name}</p>
              <p className="text-sm text-neutral-600">
                SGD {Number(item.price_sgd).toLocaleString("en-US")}
                {!item.is_published && (
                  <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-900">
                    Hidden
                  </span>
                )}
              </p>
              <div className="mt-2 sm:hidden">
                <StatusSelect id={item.id} status={item.status} />
              </div>
            </div>
            <div className="hidden sm:block">
              <StatusSelect id={item.id} status={item.status} />
            </div>
            <Link
              href={`/admin/items/${item.id}`}
              className="rounded-md border border-black/20 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
            >
              Edit
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
