"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await createClient().auth.signOut();
    // Full page load so no admin page stays cached in the client router.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/admin/login");
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className="text-neutral-600 hover:text-black disabled:opacity-60"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
