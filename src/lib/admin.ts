import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Second line of defence next to the database allow-list (private.admins):
// the app refuses to show admin pages to anyone not listed here.
export function isAllowedAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

export async function getAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : null;
  if (!data?.claims || !isAllowedAdminEmail(email)) return null;
  return { email: email!, supabase };
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login?error=not_allowed");
  return admin;
}
