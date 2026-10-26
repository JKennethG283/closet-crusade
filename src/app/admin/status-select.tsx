"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { STATUS_LABELS, type ItemStatus } from "@/lib/types";
import { setItemStatus } from "./actions";

const COLORS: Record<ItemStatus, string> = {
  available: "border-green-300 bg-green-50 text-green-900",
  reserved: "border-amber-300 bg-amber-50 text-amber-900",
  sold: "border-neutral-300 bg-neutral-100 text-neutral-700",
};

export function StatusSelect({ id, status }: { id: string; status: ItemStatus }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <select
      aria-label="Status"
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as ItemStatus;
        startTransition(async () => {
          await setItemStatus(id, next);
          router.refresh();
        });
      }}
      className={`rounded-md border px-2 py-1.5 text-sm disabled:opacity-60 ${COLORS[status]}`}
    >
      {(Object.keys(STATUS_LABELS) as ItemStatus[]).map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
