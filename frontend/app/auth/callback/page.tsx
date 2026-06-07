"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function CallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const API_BASE = process.env.NEXT_PUBLIC_API_URL;

    if (code) {
      fetch(`${API_BASE}/auth/github?code=${code}`)
        .then((res) => res.json())
        .then((data) => {
          localStorage.setItem(
            "githubData",
            JSON.stringify(data)
          );

          window.location.href = "/onboarding";
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">
        Authenticating with GitHub...
      </h1>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold">
            Loading...
          </h1>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}