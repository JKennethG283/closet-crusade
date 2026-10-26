import { createClient } from "@supabase/supabase-js";

// Cookie-less client for public, cacheable reads. Only sees what RLS allows anonymous visitors.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
