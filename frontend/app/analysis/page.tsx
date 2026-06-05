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
  login:        string;
  public_repos: number;
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
      const githubData = localStorage.getItem("githubData");

      if (!githubData) {
        router.push("/");
        return;
      }

      const parsed = JSON.parse(githubData);

      /* 1. Get user meta for display */
      try {
        setUser({
          login: parsed.user?.login ?? "you",
          public_repos: parsed.repos?.length ?? 0,
        });
      } catch {
        console.log("Could not load user data");
      }

      /* 2. Trigger analysis on backend */
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/${parsed.user_id}/sync`,
          {
            method: "POST",
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
      username={user?.login ?? "you"}
      onComplete={handleComplete}
    />
  );
}