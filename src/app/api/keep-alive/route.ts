import { createPublicClient } from "@/lib/supabase/public";

// Called once a day by Vercel Cron (see vercel.json) so the free Supabase project
// never sits idle long enough to be paused.
export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { error } = await createPublicClient()
    .from("items")
    .select("id", { count: "exact", head: true });

  return Response.json({ ok: !error });
}
