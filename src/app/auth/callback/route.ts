import { NextResponse, type NextRequest } from "next/server";
import { isAllowedAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

// Google sends the user back here after sign-in.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/login?error=sign_in_failed`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !isAllowedAdminEmail(data.user?.email)) {
    await supabase.auth.signOut();
    const reason = error ? "sign_in_failed" : "not_allowed";
    return NextResponse.redirect(`${origin}/admin/login?error=${reason}`);
  }

  return NextResponse.redirect(`${origin}/admin`);
}
