"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./onboarding.css";

/* ─── Types ──────────────────────────────────────────── */
interface OnboardingProps {
  user: {
    login: string;
    avatar_url: string;
    name?: string;
    public_repos: number;
    followers: number;
  };
  onStartAnalysis?: () => Promise<void>;
}

/* ─── Inline SVG icons ───────────────────────────────── */
const Icon = {
  GitFork: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/>
      <path d="M6 9v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9"/>
      <line x1="12" y1="12" x2="12" y2="15"/>
    </svg>
  ),
  Github: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Sparkle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
    </svg>
  ),
  Code: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  Brain: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66z"/>
    </svg>
  ),
  Target: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  Lock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Repo: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
};

/* ─── Analysis items config ──────────────────────────── */
const analysisItems = [
  {
    icon: <Icon.Repo />,
    label: "Repository languages",
    desc: "Detect your primary tech stack from commit history",
    countKey: "repos" as const,
  },
  {
    icon: <Icon.Code />,
    label: "Frameworks & libraries",
    desc: "Extract dependencies from package files and READMEs",
    countKey: "frameworks" as const,
  },
  {
    icon: <Icon.Brain />,
    label: "Skill level inference",
    desc: "Claude AI rates your depth per technology",
    countKey: "ai" as const,
  },
  {
    icon: <Icon.Target />,
    label: "Issue matching",
    desc: "Vector search for semantically relevant open issues",
    countKey: "issues" as const,
  },
];

/* ─── Component ──────────────────────────────────────── */
export default function OnboardingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("githubData");

    if (stored) {
      const data = JSON.parse(stored);
      setUser(data.user);
    }
  }, []);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const displayName = user.name || user.login;
  const initials = displayName.slice(0, 2).toUpperCase();

  const counts: Record<string, string> = {
    repos: `${user.public_repos ?? 0} repos`,
    frameworks: "auto-detected",
    ai: "pending",
    issues: "after analysis",
  };

const handleStart = async () => {
  setLoading(true);

  await new Promise((r) => setTimeout(r, 1200));

  router.push("/analysis");
};

  return (
    <>
      {/* ── Backgrounds ─────────────────────────── */}
      <div className="ob-bg">
        <div className="ob-grid" />
        <div className="ob-glow" />
        <div className="ob-grain" />
      </div>

      {/* ── Card ─────────────────────────────────── */}
      <div className="ob-card">

        {/* Logo + step indicator */}
        <div className="ob-logo-row">
          <div className="ob-logo">
            <div className="ob-logo-icon"><Icon.GitFork /></div>
            OSSCopilot
          </div>
          <div className="ob-step-badge">Step 1 of 2</div>
        </div>

        {/* Success pill */}
        <div className="ob-success-pill">
          
          GitHub connected successfully
        </div>

        {/* User identity */}
        <div className="ob-identity">
          {user.avatar_url ? (
            <div className="ob-avatar-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar_url}
                alt={user.login}
                className="ob-avatar"
              />
              <div className="ob-avatar-badge"><Icon.Check /></div>
            </div>
          ) : (
            <div className="ob-avatar-placeholder">{initials}</div>
          )}

          <div className="ob-identity-info">
            <div className="ob-username">{displayName}</div>
            <div className="ob-meta">
              <span className="ob-meta-item">
                <Icon.Repo /> {user.public_repos} repos
              </span>
              <span className="ob-meta-item">
                <Icon.Users /> {user.followers} followers
              </span>
            </div>
          </div>

          <div className="ob-gh-chip">
            <Icon.Github />
            @{user.login}
          </div>
        </div>

        <div className="ob-divider" />

        {/* Headline */}
        <div className="ob-headline">
          <h1 className="ob-h1">
            Welcome to{" "}
            <span className="accent">OSS Copilot</span>
          </h1>
          <p className="ob-sub">
            We'll analyse your repositories to understand your skills and
            recommend the best open-source contribution opportunities.
          </p>
        </div>

        {/* What we'll analyse */}
        <div className="ob-analysis-list">
          {analysisItems.map(({ icon, label, desc, countKey }) => (
            <div className="ob-analysis-item" key={label}>
              <div className="ob-ai-icon">{icon}</div>
              <div className="ob-ai-text">
                <div className="ob-ai-label">{label}</div>
                <div className="ob-ai-desc">{desc}</div>
              </div>
              <div className="ob-ai-count">{counts[countKey]}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="ob-cta-row">
          <button
            className={`ob-btn-primary${loading ? " loading" : ""}`}
            onClick={handleStart}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="ob-spinner" />
                Analysing your repositories…
              </>
            ) : (
              <>
                <Icon.Sparkle />
                Start Analysis
                <Icon.ArrowRight />
              </>
            )}
          </button>

          <button
            className="ob-btn-ghost"
            onClick={() => router.push("/dashboard")}
            disabled={loading}
          >
            Skip for now — explore manually
          </button>
        </div>

        {/* Privacy note */}
        <div className="ob-privacy">
          <Icon.Lock />
          Read-only access · we never write to your repositories
        </div>

        {/* Progress dots */}
        <div className="ob-progress">
          <div className="ob-dot active" />
          <div className="ob-dot" />
        </div>
      </div>
    </>
  );
}