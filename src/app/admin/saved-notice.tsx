"use client";

import { useSearchParams } from "next/navigation";

export function SavedNotice() {
  const params = useSearchParams();
  const saved = params.get("saved");
  const deleted = params.get("deleted");

  if (!saved && !deleted) return null;
  return (
    <p role="status" className="mt-6 rounded-md bg-green-50 p-3 text-sm text-green-900">
      {saved ? `Saved “${saved}”. It's live on the shop now.` : "Item deleted."}
    </p>
  );
}
