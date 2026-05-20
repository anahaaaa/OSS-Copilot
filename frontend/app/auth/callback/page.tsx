"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function CallbackPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");

    if (code) {
      console.log("GitHub Code:", code);

      fetch(`http://127.0.0.1:8000/auth/github?code=${code}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("GitHub User Data:", data);
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