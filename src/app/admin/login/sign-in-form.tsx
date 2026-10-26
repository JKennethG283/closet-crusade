"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

const NOT_ALLOWED = "This account isn't allowed to manage the shop.";

export function SignInForm() {
  const router = useRouter();
  const notAllowed = useSearchParams().get("error") === "not_allowed";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Signs in from the browser so Supabase's per-IP rate limits apply to each visitor.
    const { error } = await createClient().auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(
        error.code === "invalid_credentials"
          ? "Wrong email or password. Please try again."
          : "Couldn't sign in right now. Please wait a minute and try again.",
      );
      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  const message = error ?? (notAllowed ? NOT_ALLOWED : null);

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
      {message && (
        <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">
          {message}
        </p>
      )}
      <label className="block">
        <span className="text-sm font-medium">Email</span>
        <input
          type="email"
          required
          autoComplete="username"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-black/20 px-3 py-3 text-base focus:border-black focus:outline-none"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Password</span>
        <span className="mt-1 flex rounded-md border border-black/20 focus-within:border-black">
          <input
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md px-3 py-3 text-base focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="px-3 text-sm text-neutral-600 hover:text-black"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </span>
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-black px-4 py-3 text-base font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
