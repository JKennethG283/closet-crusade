import { Suspense } from "react";
import { SignInForm } from "./sign-in-form";

export default function LoginPage() {
  return (
    <div className="mx-auto mt-10 max-w-sm rounded-lg border border-black/10 bg-white p-8">
      <h1 className="text-center font-display text-3xl">Welcome back</h1>
      <p className="mt-3 text-center text-sm text-neutral-600">
        Sign in to manage the shop.
      </p>
      <Suspense>
        <SignInForm />
      </Suspense>
    </div>
  );
}
