"use client";

import { useEffect, useState } from "react";
import "./recommendation.css";

interface Recommendation {
title: string;
url: string;
labels: string[];
score: number;
}

export default function RecommendationsPage() {
const [saved, setSaved] = useState<string[]>([]);
const [issues, setIssues] = useState<Recommendation[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
const loadRecommendations = async () => {
try {
const githubData =
localStorage.getItem("githubData");

    if (!githubData) return;

    const parsed =
      JSON.parse(githubData);

    const userId =
      parsed.user_id;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/recommendations`
    );

    const data =
      await response.json();

    setIssues(data);

  } catch (error) {
    console.error(
      "Failed to load recommendations:",
      error
    );
  } finally {
    setLoading(false);
  }
};

loadRecommendations();

}, []);

const toggleSave = (
url: string
) => {
setSaved((prev) =>
prev.includes(url)
? prev.filter(
(item) => item !== url
)
: [...prev, url]
);
};

if (loading) {
  return (
    <div className="rec-loading">
      Loading recommendations...
    </div>
  );
}

return (
  <div className="rec-root">

    {/* Sidebar */}
    <aside className="rec-sidebar">

    <nav className="rec-nav">

      <div className="rec-nav-item active">
        Dashboard
      </div>

      <div className="rec-nav-item">
        Repositories
      </div>

      <div className="rec-nav-item">
        Recommendations
      </div>

      <div className="rec-nav-item">
        Saved Issues
      </div>

      <div className="rec-nav-item">
        Profile
      </div>

    </nav>

  </aside>

  {/* Main */}

  <main className="rec-main">

    <div className="rec-header">

      <div>

        <div className="rec-badge">
          AI Recommendations
        </div>

        <h1 className="rec-title">
          Top Recommended Issues
        </h1>

        <p className="rec-subtitle">
          Ranked using semantic matching,
          embeddings, repository activity,
          and skill similarity.
        </p>

      </div>

    </div>

    {issues.length === 0 ? (
      <div className="empty-state">
        No recommendations found.
      </div>
    ) : (
      <div className="rec-grid">

        {issues.map((issue) => (

          <div
            key={issue.url}
            className="issue-card"
          >

            <div className="issue-top">

              <div>

                <h3 className="issue-title">
                  {issue.title}
                </h3>

                <div className="issue-repo">
                  Recommended Issue
                </div>

              </div>

              <div className="issue-score">
                {Math.max(
                  0,
                  Math.round(
                    (1 - issue.score) * 100
                  )
                )}
                %
              </div>

            </div>

            <div className="issue-meta">

              <div className="issue-skills">

                {issue.labels?.map(
                  (label) => (
                    <span
                      key={label}
                      className="skill-pill"
                    >
                      {label}
                    </span>
                  )
                )}

              </div>

            </div>

            <div className="issue-ai">

              <div className="issue-ai-title">
                Recommended because:
              </div>

              <div className="issue-reason">
                ✓ Semantic similarity
              </div>

              <div className="issue-reason">
                ✓ Matches extracted skills
              </div>

              <div className="issue-reason">
                ✓ Relevant repository
              </div>

              <div className="issue-reason">
                ✓ High ranking score
              </div>

            </div>

            <div className="issue-actions">

              <button
                className="view-btn"
                onClick={() =>
                  window.open(
                    issue.url,
                    "_blank"
                  )
                }
              >
                View Issue
              </button>

              <button
                className="save-btn"
                onClick={() =>
                  toggleSave(
                    issue.url
                  )
                }
              >
                {saved.includes(
                  issue.url
                )
                  ? "Saved"
                  : "Save Issue"}
              </button>

            </div>

          </div>

        ))}

      </div>
    )}

  </main>

</div>

);
}