"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { IMAGE_BUCKET, imageUrl } from "@/lib/images";
import { createClient } from "@/lib/supabase/browser";
import { STATUS_LABELS, type Item, type ItemStatus } from "@/lib/types";
import { deleteItem, saveItem } from "../actions";

type Photo = { key: string; path?: string; file?: File; preview: string };

const MAX_PHOTO_SIZE = 1600;

// Shrinks phone photos before upload so they're quick to send and to load on the shop.
async function prepareForUpload(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_PHOTO_SIZE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("encode failed"))), "image/jpeg", 0.85),
  );
}

export function ItemEditor({ item }: { item?: Item }) {
  const idRef = useRef(item?.id ?? null);
  const [name, setName] = useState(item?.name ?? "");
  const [brand, setBrand] = useState(item?.brand ?? "");
  const [size, setSize] = useState(item?.size ?? "");
  const [condition, setCondition] = useState(item?.condition ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item ? String(item.price_sgd) : "");
  const [status, setStatus] = useState<ItemStatus>(item?.status ?? "available");
  const [isPublished, setIsPublished] = useState(item?.is_published ?? true);
  const [photos, setPhotos] = useState<Photo[]>(
    (item?.item_images ?? []).map((img) => ({ key: img.id, path: img.path, preview: imageUrl(img.path) })),
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const added = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ key: crypto.randomUUID(), file, preview: URL.createObjectURL(file) }));
    setPhotos((current) => [...current, ...added]);
  }

  function move(index: number, to: number) {
    setPhotos((current) => {
      if (to < 0 || to >= current.length) return current;
      const next = [...current];
      const [photo] = next.splice(index, 1);
      next.splice(to, 0, photo);
      return next;
    });
  }

  function remove(index: number) {
    setPhotos((current) => {
      const photo = current[index];
      if (photo.file) URL.revokeObjectURL(photo.preview);
      return current.filter((_, i) => i !== index);
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const priceSgd = Number(price);
    if (!name.trim()) return setError("Please give the item a name.");
    if (price.trim() === "" || !Number.isFinite(priceSgd) || priceSgd < 0)
      return setError("Please enter the price in SGD, for example 45.");

    const id = (idRef.current ??= crypto.randomUUID());
    const supabase = createClient();
    const paths: string[] = [];

    try {
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        if (photo.path) {
          paths.push(photo.path);
          continue;
        }
        setBusy(`Uploading photo ${i + 1} of ${photos.length}…`);
        let blob: Blob;
        try {
          blob = await prepareForUpload(photo.file!);
        } catch {
          throw new Error(
            `Photo ${i + 1} couldn't be read. Please use a JPG or PNG photo, or take a screenshot of it and upload that instead.`,
          );
        }
        const path = `${id}/${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from(IMAGE_BUCKET)
          .upload(path, blob, { contentType: "image/jpeg", upsert: false });
        if (uploadError) throw new Error(`Photo ${i + 1} failed to upload: ${uploadError.message}`);
        paths.push(path);
        // Remember the upload so pressing Save again doesn't upload it twice.
        setPhotos((current) => current.map((p) => (p.key === photo.key ? { ...p, path } : p)));
      }

      setBusy("Saving…");
      const result = await saveItem({
        id,
        isNew: !item,
        name,
        brand,
        size,
        condition,
        description,
        priceSgd,
        status,
        isPublished,
        imagePaths: paths,
      });
      if (result?.error) setError(result.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (!item || !confirm(`Delete “${item.name}” and all its photos? This can't be undone.`)) return;
    setBusy("Deleting…");
    const result = await deleteItem(item.id);
    if (result?.error) {
      setError(result.error);
      setBusy(null);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <Section title="Photos" hint="The first photo is the cover shown on the shop page.">
        {photos.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((photo, i) => (
              <li key={photo.key} className="overflow-hidden rounded-md border border-black/10 bg-white">
                <div className="relative aspect-square bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.preview} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute left-1.5 top-1.5 rounded bg-black px-1.5 py-0.5 text-[11px] text-white">
                      Cover
                    </span>
                  )}
                </div>
                <div className="flex text-sm">
                  <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move left" className="flex-1 py-2 hover:bg-neutral-100 disabled:opacity-30">←</button>
                  <button type="button" onClick={() => move(i, i + 1)} disabled={i === photos.length - 1} aria-label="Move right" className="flex-1 py-2 hover:bg-neutral-100 disabled:opacity-30">→</button>
                  <button type="button" onClick={() => remove(i)} aria-label="Remove photo" className="flex-1 py-2 text-red-700 hover:bg-red-50">✕</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-black/20 bg-white px-4 py-8 text-center hover:border-black/40">
          <span className="font-medium">+ Add photos</span>
          <span className="mt-1 text-sm text-neutral-500">Tap to choose from your phone or computer</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </Section>

      <Section title="Details">
        <Field label="Name" hint="What buyers see first, e.g. “Diesel Denim Bomber Jacket”">
          <input required value={name} onChange={(e) => setName(e.target.value)} maxLength={120} className={inputClass} />
        </Field>
        <Field label="Price (SGD)" hint="The fixed price. Other currencies are calculated automatically.">
          <div className="flex items-center rounded-md border border-black/20 bg-white focus-within:border-black">
            <span className="pl-3 text-neutral-500">SGD</span>
            <input
              required
              inputMode="decimal"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-md bg-transparent px-3 py-3 text-base focus:outline-none"
            />
          </div>
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Brand" hint="Optional">
            <input value={brand} onChange={(e) => setBrand(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Size" hint="Optional, e.g. S, 38, EU 39">
            <input value={size} onChange={(e) => setSize(e.target.value)} className={inputClass} />
          </Field>
        </div>
        <Field label="Condition" hint="Optional, e.g. “Excellent, light wear on cuffs”">
          <input value={condition} onChange={(e) => setCondition(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Description" hint="Optional: materials, fit, measurements, flaws">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className={inputClass} />
        </Field>
      </Section>

      <Section title="Status">
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(STATUS_LABELS) as ItemStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              aria-pressed={status === s}
              className={`rounded-md border px-3 py-3 text-sm font-medium ${
                status === s ? "border-black bg-black text-white" : "border-black/20 bg-white hover:bg-neutral-50"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <label className="mt-4 flex items-start gap-3 rounded-md border border-black/10 bg-white p-4">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="mt-0.5 h-5 w-5"
          />
          <span>
            <span className="font-medium">Show on the shop</span>
            <span className="block text-sm text-neutral-500">
              Untick to hide this item while you&apos;re still working on it.
            </span>
          </span>
        </label>
      </Section>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 flex items-center gap-3 border-t border-black/10 bg-neutral-50/95 px-4 py-4 backdrop-blur">
        <button
          type="submit"
          disabled={busy !== null}
          className="flex-1 rounded-md bg-black px-5 py-3 text-base font-medium text-white hover:bg-neutral-800 disabled:opacity-60 sm:flex-none sm:px-10"
        >
          {busy ?? "Save"}
        </button>
        <Link href="/admin" className="px-3 py-3 text-sm text-neutral-600 hover:text-black">
          Cancel
        </Link>
        {item && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy !== null}
            className="ml-auto px-3 py-3 text-sm text-red-700 hover:underline disabled:opacity-60"
          >
            Delete item
          </button>
        )}
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-black/20 bg-white px-3 py-3 text-base focus:border-black focus:outline-none";

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold">{title}</h2>
      {hint && <p className="mt-1 text-sm text-neutral-500">{hint}</p>}
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="font-medium">{label}</span>
      {hint && <span className="mt-0.5 block text-sm text-neutral-500">{hint}</span>}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}
