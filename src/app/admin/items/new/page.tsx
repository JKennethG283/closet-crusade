import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin";
import { ItemEditor } from "../item-editor";

export default function NewItemPage() {
  return (
    <>
      <Link href="/admin" className="text-sm text-neutral-600 hover:text-black">
        ← Back to items
      </Link>
      <h1 className="mt-3 font-display text-3xl">Add a new item</h1>
      <div className="mt-8">
        <Suspense fallback={<p className="text-neutral-500">Loading…</p>}>
          <AdminOnlyEditor />
        </Suspense>
      </div>
    </>
  );
}

async function AdminOnlyEditor() {
  await requireAdmin();
  return <ItemEditor />;
}
