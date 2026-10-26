"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { IMAGE_BUCKET } from "@/lib/images";
import { ITEMS_TAG } from "@/lib/items";
import { createClient } from "@/lib/supabase/server";
import type { ItemStatus } from "@/lib/types";

export type ItemInput = {
  id: string;
  isNew: boolean;
  name: string;
  brand: string;
  size: string;
  condition: string;
  description: string;
  priceSgd: number;
  status: ItemStatus;
  isPublished: boolean;
  // Storage paths in display order; the first one is the cover photo.
  imagePaths: string[];
};

const STATUSES: ItemStatus[] = ["available", "reserved", "sold"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function slugify(text: string) {
  return (
    text
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "item"
  );
}

function validate(input: ItemInput): string | null {
  if (!UUID.test(input.id)) return "Something went wrong. Please reload the page and try again.";
  if (!input.name.trim()) return "Please give the item a name.";
  if (input.name.trim().length > 120) return "The name is too long (120 characters max).";
  if (!Number.isFinite(input.priceSgd) || input.priceSgd < 0)
    return "Please enter a valid price in SGD.";
  if (!STATUSES.includes(input.status)) return "Please choose a status.";
  if (input.imagePaths.some((p) => !p.startsWith(`${input.id}/`) || p.includes("..")))
    return "One of the photos is invalid. Please remove it and upload it again.";
  return null;
}

export async function saveItem(input: ItemInput): Promise<{ error: string }> {
  const { supabase } = await requireAdmin();
  const error = validate(input);
  if (error) return { error };

  const fields = {
    name: input.name.trim(),
    brand: input.brand.trim(),
    size: input.size.trim(),
    condition: input.condition.trim(),
    description: input.description.trim(),
    price_sgd: Math.round(input.priceSgd * 100) / 100,
    status: input.status,
    is_published: input.isPublished,
  };

  if (input.isNew) {
    const slug = await uniqueSlug(supabase, slugify(fields.name));
    const { error: insertError } = await supabase
      .from("items")
      .insert({ id: input.id, slug, ...fields });
    if (insertError) return { error: `Could not save the item: ${insertError.message}` };
  } else {
    const { error: updateError } = await supabase.from("items").update(fields).eq("id", input.id);
    if (updateError) return { error: `Could not save the item: ${updateError.message}` };
  }

  // Replace the photo list with the new order, then clean up removed files.
  const { data: existing } = await supabase
    .from("item_images")
    .select("path")
    .eq("item_id", input.id);
  const removed = (existing ?? []).map((r) => r.path).filter((p) => !input.imagePaths.includes(p));

  const { error: deleteError } = await supabase
    .from("item_images")
    .delete()
    .eq("item_id", input.id);
  if (deleteError) return { error: `Could not save the photos: ${deleteError.message}` };

  if (input.imagePaths.length > 0) {
    const { error: imagesError } = await supabase.from("item_images").insert(
      input.imagePaths.map((path, position) => ({ item_id: input.id, path, position })),
    );
    if (imagesError) return { error: `Could not save the photos: ${imagesError.message}` };
  }

  if (removed.length > 0) {
    await supabase.storage.from(IMAGE_BUCKET).remove(removed);
  }

  updateTag(ITEMS_TAG);
  redirect(`/admin?saved=${encodeURIComponent(fields.name)}`);
}

export async function setItemStatus(id: string, status: ItemStatus) {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id) || !STATUSES.includes(status)) return;

  await supabase.from("items").update({ status }).eq("id", id);
  updateTag(ITEMS_TAG);
}

export async function deleteItem(id: string): Promise<{ error: string }> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id)) return { error: "Invalid item." };

  const { data: images } = await supabase.from("item_images").select("path").eq("item_id", id);
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) return { error: `Could not delete the item: ${error.message}` };

  if (images && images.length > 0) {
    await supabase.storage.from(IMAGE_BUCKET).remove(images.map((i) => i.path));
  }

  updateTag(ITEMS_TAG);
  redirect("/admin?deleted=1");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

async function uniqueSlug(supabase: Awaited<ReturnType<typeof createClient>>, base: string) {
  const { data } = await supabase.from("items").select("slug").like("slug", `${base}%`);
  const taken = new Set((data ?? []).map((r) => r.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
