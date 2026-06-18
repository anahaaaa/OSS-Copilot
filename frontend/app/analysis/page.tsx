"use client";

/*
  app/analysis/page.tsx

  Route: /analysis
  Reached from: /onboarding → "Start Analysis" button

  What happens here:
    1. Read JWT from localStorage
    2. Call POST /users/me/sync on your FastAPI backend
       (this triggers skill extraction + embedding job)
    3. Show the animated progress UI while that runs
    4. On complete → redirect to /dashboard
*/

import { useEffect, useState } from "react";
import { useRouter }           from "next/navigation";
import AnalysisProgress        from "./analysis-progress";
import { useCallback } from "react";

interface UserMeta {
  username: string;
  public_repos?: number;
}

export default function AnalysisPage() {
  const router = useRouter();
  const handleComplete = useCallback(() => {
      router.push("/skillpage");
    }, [router]);
  const [user, setUser] = useState<UserMeta | null>(null);

  /* Kick off backend sync as soon as page mounts */
  useEffect(() => {
    const run = async () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/");
      return;
    }

    const user = JSON.parse(storedUser);

      /* 1. Get user meta for display */
      try {
        setUser({
          username: user.username,
          public_repos: user.public_repos ?? 0,
        });
      } catch {
        console.log("Could not load user data");
      }

      /* 2. Trigger analysis on backend */
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/me/sync`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch {
        console.log("Sync failed");
      }
    };

    run();
  }, [router]);

  return (
    <AnalysisProgress
      repoCount={user?.public_repos ?? 12}
      username={user?.username ?? "you"}
      onComplete={handleComplete}
    />
  );
}