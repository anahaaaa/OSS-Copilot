"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./repository_selection.css";

const RECENT_REPOS = [
  {
    name: "FastAPI",
    full: "fastapi/fastapi",
  },
  {
    name: "LangChain",
    full: "langchain-ai/langchain",
  },
  {
    name: "CrewAI",
    full: "crewAIInc/crewAI",
  },
];

export default function RepositorySelection() {
  const router = useRouter();

  const [repo, setRepo] = useState("");

  const handleAnalyze = () => {
    localStorage.setItem("selectedRepo", repo);

    router.push("/repository_analysis");
  };

  return (
    <div className="repo-root">

      <div className="repo-nav">
        <div className="repo-logo">
          OSS Copilot
        </div>

        <div className="repo-step">
          Step 5 / 7
        </div>
      </div>

      <div className="repo-container">

        <div className="repo-badge">
          Repository Analysis
        </div>

        <h1 className="repo-title">
          Choose a repository to analyze
        </h1>

        <p className="repo-subtitle">
          We'll scan issues, labels, contributor guides,
          and repository activity to find the best issues
          for your skills.
        </p>

        <div className="repo-search">
          <input
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="owner/repository"
          />
        </div>

        <div className="repo-examples">
          <span>fastapi/fastapi</span>
          <span>langchain-ai/langchain</span>
          <span>crewAIInc/crewAI</span>
        </div>

        <div className="repo-section-title">
          Recently analyzed
        </div>

        <div className="repo-grid">
          {RECENT_REPOS.map((item) => (
            <div
              key={item.full}
              className="repo-card"
              onClick={() => setRepo(item.full)}
            >
              <div className="repo-card-name">
                {item.name}
              </div>

              <div className="repo-card-full">
                {item.full}
              </div>
            </div>
          ))}
        </div>

        <button
          className="repo-btn"
          onClick={handleAnalyze}
        >
          Analyze Repository
        </button>

      </div>
    </div>
  );
}