"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function CallbackPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const API_BASE = "https://oss-copilot.onrender.com";

    if (code) {
      console.log("GitHub Code:", code);

      fetch(`${API_BASE}/auth/github?code=${code}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("GitHub User Data:", data);

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