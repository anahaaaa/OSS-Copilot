"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./repo_analysis.css";

const STAGES = [
  "Fetching Repository",
  "Collecting Issues",
  "Generating Embeddings",
  "Semantic Analysis",
  "ML Ranking",
  "Building Recommendations",
];

export default function RepositoryAnalysisPage() {
  const router = useRouter();

  const [repoName, setRepoName] = useState("");
  const [activeStage, setActiveStage] = useState(0);
  const [issueCount, setIssueCount] = useState(0);

  // Load selected repository
  useEffect(() => {
    const selectedRepo = localStorage.getItem("selectedRepo");

    if (!selectedRepo) {
      router.push("/repository");
      return;
    }

    setRepoName(selectedRepo);
  }, [router]);

  // Run repository analysis
  useEffect(() => {
    const runAnalysis = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/");
        return;
      }
      const selectedRepo = localStorage.getItem("selectedRepo");

      if (!selectedRepo) return;

      const [owner, repo] = selectedRepo.split("/");

      try {
        // Stage 1
        setActiveStage(0);
        await new Promise((r) => setTimeout(r, 600));

        // Stage 2 - Scan Repository
        setActiveStage(1);

        const token = localStorage.getItem("token");

        const scanResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/scan?owner=${owner}&repo=${repo}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const scanData = await scanResponse.json();

        setIssueCount(scanData.count ?? 0);

        // Stage 3 - Generate Embeddings
        setActiveStage(2);

        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/embed`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Stage 4
        setActiveStage(3);
        await new Promise((r) => setTimeout(r, 1000));

        // Stage 5
        setActiveStage(4);
        await new Promise((r) => setTimeout(r, 1000));

        // Stage 6
        setActiveStage(5);
        await new Promise((r) => setTimeout(r, 1500));

        router.push("/recommendation");

      } catch (error) {
        console.error("Repository analysis failed:", error);
      }
    };

    runAnalysis();
  }, [router]);

  const progress =
    ((activeStage + 1) / STAGES.length) * 100;

  return (
    <div className="ra-root">

      <div className="ra-nav">
        <div className="ra-logo">
          OSS Copilot
        </div>

        <div className="ra-step">
          Step 6 / 7
        </div>
      </div>

      <div className="ra-container">

        <div className="ra-badge">
          Repository Analysis
        </div>

        <h1 className="ra-title">
          Analyzing Repository
        </h1>

        <div className="ra-repo">
          {repoName}
        </div>

        <div className="ra-progress-card">

          <div className="ra-progress-top">
            <span>Progress</span>
            <span>
              {Math.round(progress)}%
            </span>
          </div>

          <div className="ra-progress-track">
            <div
              className="ra-progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

        </div>

        <div className="ra-stats">

          <div className="ra-stat">
            <div className="ra-stat-value">
              {issueCount}
            </div>

            <div className="ra-stat-label">
              Issues Collected
            </div>
          </div>

          <div className="ra-stat">
            <div className="ra-stat-value">
              {activeStage >= 2 ? "Generated" : "..."}
            </div>

            <div className="ra-stat-label">
              Embeddings
            </div>
          </div>

          <div className="ra-stat">
            <div className="ra-stat-value">
              {Math.round(progress)}%
            </div>

            <div className="ra-stat-label">
              Analysis Progress
            </div>
          </div>

        </div>

        <div className="ra-workflow">

          {STAGES.map((stage, index) => {
            const completed =
              index < activeStage;

            const active =
              index === activeStage;

            return (
              <div
                key={stage}
                className={`ra-stage ${
                  completed
                    ? "completed"
                    : active
                    ? "active"
                    : ""
                }`}
              >
                <div className="ra-stage-icon">
                  {completed
                    ? "✓"
                    : active
                    ? "⏳"
                    : "○"}
                </div>

                <div className="ra-stage-name">
                  {stage}
                </div>
              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
}