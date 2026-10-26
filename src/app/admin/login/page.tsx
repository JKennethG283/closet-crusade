import { Suspense } from "react";
import { GoogleSignIn } from "./google-sign-in";

export default function LoginPage() {
  return (
    <div className="mx-auto mt-10 max-w-sm rounded-lg border border-black/10 bg-white p-8 text-center">
      <h1 className="font-display text-3xl">Welcome back</h1>
      <p className="mt-3 text-sm text-neutral-600">
        Sign in with your Google account to manage the shop.
      </p>
      <Suspense>
        <GoogleSignIn />
      </Suspense>
    </div>
  );
}
