// One-time import of the first listings from the Google Drive photo export.
// Usage: npm run seed -- "path/to/drive-download-folder"
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.
// Safe to re-run: items that already exist (by slug) are skipped.

import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "item-images";

// Photo-name prefix → listing. Names, prices (SGD) and sizes from the owner; the rest is filled in via /admin.
const LISTINGS = [
  { match: "Diesel Jacket", slug: "diesel-jacket", name: "Diesel Jacket", price: 40 },
  { match: "Layered Tulle Dress", slug: "layered-tulle-dress", name: "Layered Tulle Dress", price: 15 },
  { match: "Anna Cho Bolero Jacket", slug: "anna-cho-bolero-jacket", name: "Anna Cho Bolero Jacket", price: 15 },
  { match: "Dior Yellow Tee", slug: "dior-yellow-tee", name: "Dior Yellow Tee", price: 15 },
  { match: "Y_Project Black 38", slug: "y-project-black", name: "Y/Project Black", size: "38", price: 180 },
  { match: "Y_Project Clear 39", slug: "y-project-clear", name: "Y/Project Clear", size: "39", price: 180 },
  { match: "Masion Margiela", slug: "maison-margiela", name: "Maison Margiela", price: 70 },
  { match: "Layer", slug: "hooded-floral-jacket", name: "Hooded Floral Jacket", price: 15 },
];

// "Closet Crusade Listings_0000s_0003_Diesel Jacket 1.jpg" → { label: "Diesel Jacket", n: 1 }
function parse(file) {
  const m = file.match(/^Closet Crusade Listings_[^_]+(?:_[^_]+)?_(.+) (\d+)\.jpe?g$/i);
  return m ? { label: m[1], n: Number(m[2]) } : null;
}

const folder = process.argv[2];
if (!folder) {
  console.error('Usage: npm run seed -- "path/to/photo-folder"');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local first.");
  process.exit(1);
}

const supabase = createClient(url, secret, { auth: { persistSession: false } });
const files = (await readdir(folder)).map((f) => ({ file: f, ...parse(f) })).filter((f) => f.label);

for (const [index, listing] of LISTINGS.entries()) {
  const photos = files
    .filter((f) => f.label === listing.match)
    .sort((a, b) => a.n - b.n);

  if (photos.length === 0) {
    console.warn(`! No photos found for ${listing.name}, skipping`);
    continue;
  }

  const { data: existing } = await supabase
    .from("items")
    .select("id")
    .eq("slug", listing.slug)
    .maybeSingle();
  if (existing) {
    console.log(`- ${listing.name} already exists, skipping`);
    continue;
  }

  const id = randomUUID();
  const paths = [];
  for (const photo of photos) {
    const storagePath = `${id}/${randomUUID()}.jpg`;
    const body = await readFile(path.join(folder, photo.file));
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, body, { contentType: "image/jpeg" });
    if (error) throw new Error(`Upload failed for ${photo.file}: ${error.message}`);
    paths.push(storagePath);
  }

  const { error: itemError } = await supabase.from("items").insert({
    id,
    slug: listing.slug,
    name: listing.name,
    size: listing.size ?? "",
    price_sgd: listing.price,
    sort_order: index,
  });
  if (itemError) throw new Error(`Could not create ${listing.name}: ${itemError.message}`);

  const { error: imagesError } = await supabase
    .from("item_images")
    .insert(paths.map((p, position) => ({ item_id: id, path: p, position })));
  if (imagesError) throw new Error(`Could not save photos for ${listing.name}: ${imagesError.message}`);

  console.log(`✓ ${listing.name}: ${paths.length} photos, SGD ${listing.price}`);
}

console.log("Done.");
