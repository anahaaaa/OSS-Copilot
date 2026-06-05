"use client";

import { useEffect } from "react";
import "./landing.css";

/* ── Inline SVG icons (no extra dep) ─────────────────── */
const Icons = {
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
  Sparkle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
    </svg>
  ),
  Brain: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66z"/>
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  Map: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
      <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Layers: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
  Zap: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Database: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  ),
  Server: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
      <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
    </svg>
  ),
  Monitor: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  Code: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Layout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
    </svg>
  ),
  Heart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
};

export default function Home() {
  const githubLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user user:email`;
  };

  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* ── Topnav ───────────────────────────────── */}
      <nav className="topnav">
        <a href="#" className="nav-logo">
          <div className="nav-logo-icon">
            <Icons.GitFork />
          </div>
          OSSCopilot
        </a>

        <div className="nav-links">
          <a href="#how" className="nav-link">How it works</a>
          <a href="#arch" className="nav-link">Architecture</a>
          <a
            href="https://github.com/anahaaaa/OSS-Copilot"
            target="_blank"
            rel="noreferrer"
            className="nav-link"
          >
            GitHub
          </a>
        </div>
      </nav>

      <main className="landing-root">

        {/* ── HERO ─────────────────────────────────── */}
        <section className="hero">
          <div className="hero-inner">

            <h1 className="hero-h1">
              Contribute to open source<br />
              <span className="grad">with confidence</span>
            </h1>

            <p className="hero-sub">
              OSSCopilot reads your GitHub profile, understands your real skill stack,
              and surfaces the exact issues you are ready to solve — with a step-by-step
              contribution plan.
            </p>

            <div className="hero-actions">
              <button onClick={githubLogin} className="nav-cta-primary">
                <Icons.Github />
                Continue with GitHub
              </button>

              <button
                onClick={() =>
                  document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })
                }
                className="btn-ghost"
              >
                View Demo
              </button>
            </div>
          </div>
        </section>

        {/* ── LOGO STRIP ───────────────────────────── */}
        <div className="logo-strip">
          <div className="logo-strip-label">Built with</div>
          <div className="logo-strip-items">
            {[
              { label: "Next.js",    icon: <Icons.Monitor /> },
              { label: "FastAPI",    icon: <Icons.Zap /> },
              { label: "PostgreSQL", icon: <Icons.Database /> },
              { label: "pgvector",   icon: <Icons.Layers /> },
              { label: "Claude AI",  icon: <Icons.Brain /> },
              { label: "OpenAI",     icon: <Icons.Sparkle /> },
            ].map(({ label, icon }) => (
              <div className="logo-item" key={label}>
                {icon}
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ─────────────────────────── */}
        <section className="section" id="how">
          <div className="section-label">How it works</div>
          <h2 className="section-h2">From your GitHub profile<br />to your first PR</h2>
          <p className="section-sub">
            Four steps. Fully automated. No manual setup or profile building required.
          </p>

          <div className="how-grid">
            {[
              {
                num: "01",
                icon: <Icons.Github />,
                title: "Connect GitHub",
                desc: "Sign in with GitHub OAuth. We read your public repositories — nothing else. No write access, ever.",
              },
              {
                num: "02",
                icon: <Icons.Brain />,
                title: "Skill extraction",
                desc: "Claude AI analyses your repos, READMEs, and languages to build an accurate skill profile automatically.",
              },
              {
                num: "03",
                icon: <Icons.Search />,
                title: "Semantic matching",
                desc: "Vector embeddings compare your skill profile to thousands of open issues using cosine similarity — not keywords.",
              },
              {
                num: "04",
                icon: <Icons.Map />,
                title: "Contribution plan",
                desc: "Pick any recommended issue and get a step-by-step plan: files to edit, implementation approach, and a PR checklist.",
              },
            ].map(({ num, icon, title, desc }) => (
              <div className="how-step" key={num}>
                <div className="how-step-num">{num}</div>
                <div className="how-step-icon">{icon}</div>
                <div className="how-step-title">{title}</div>
                <div className="how-step-desc">{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRODUCT SCREENSHOT ───────────────────── */}
        <section className="screenshot-section">
          <div className="screenshot-outer">
            <div className="screenshot-header">
              <div className="section-label">Product</div>
              <h2 className="section-h2">Your personalised<br />issue dashboard</h2>
              <p className="section-sub">
                Every issue is ranked by match score. Every recommendation comes with
                an explanation. Every plan is generated in seconds.
              </p>
            </div>

            <div className="screenshot-frame">
              {/* Window chrome */}
              <div className="screenshot-topbar">
                <div className="win-dot r" />
                <div className="win-dot y" />
                <div className="win-dot g" />
                <div className="url-bar">osscopilot.vercel.app/dashboard</div>
              </div>

              <div className="screenshot-body">
                {/* Sidebar */}
                <div className="dash-sidebar">
                  <div className="dash-sidebar-logo">
                    <div className="dash-sidebar-logo-icon">
                      <Icons.GitFork />
                    </div>
                    OSSCopilot
                  </div>

                  <div className="dash-nav-section">Overview</div>
                  <div className="dash-nav-item active">
                    <Icons.Layout /> Dashboard
                  </div>
                  <div className="dash-nav-item">
                    <Icons.Sparkle /> Recommendations
                  </div>
                  <div className="dash-nav-item">
                    <Icons.Heart /> Saved issues
                  </div>

                  <div className="dash-nav-section">Account</div>
                  <div className="dash-nav-item">
                    <Icons.Code /> Skill profile
                  </div>

                  <div className="dash-sidebar-footer">
                    <div className="dash-user">
                      <div className="dash-avatar">AK</div>
                      <div className="dash-user-info">
                        <div className="dash-user-name">anagha-rs</div>
                        <div className="dash-user-role">GitHub connected</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main */}
                <div className="dash-main">
                  <div className="dash-topbar">
                    <div className="dash-page-title">Dashboard</div>
                    <div className="dash-topbar-actions">
                      <button className="dash-btn">
                        <Icons.Github /> Sync repos
                      </button>
                      <button className="dash-btn primary">
                        <Icons.Sparkle /> View all recommendations
                      </button>
                    </div>
                  </div>

                  <div className="dash-content">
                    {/* Stats */}
                    <div className="stat-row">
                      {[
                        { label: "Repositories", value: "12", sub: "+2 this month", icon: <Icons.Code /> },
                        { label: "Matched issues", value: "47", sub: "Updated now", icon: <Icons.Sparkle /> },
                        { label: "Match score", value: "91%", sub: "Top 5% of users", icon: <Icons.TrendingUp /> },
                        { label: "Skills found", value: "8", sub: "Auto-extracted", icon: <Icons.Brain /> },
                      ].map(({ label, value, sub, icon }) => (
                        <div className="stat-card" key={label}>
                          <div className="stat-label">{icon} {label}</div>
                          <div className="stat-value">{value}</div>
                          <div className="stat-sub"><Icons.TrendingUp /> {sub}</div>
                        </div>
                      ))}
                    </div>

                    {/* Skills */}
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--txt-3)", marginBottom: "10px" }}>
                        Extracted skill profile
                      </div>
                      <div className="skills-row">
                        {[
                          { label: "Python",      color: "#3b82f6" },
                          { label: "FastAPI",     color: "#3dd68c" },
                          { label: "PostgreSQL",  color: "#336791" },
                          { label: "SQLAlchemy",  color: "#a855f7" },
                          { label: "TypeScript",  color: "#5b5bd6" },
                          { label: "React",       color: "#38bdf8" },
                          { label: "Backend",     color: "#f59e0b" },
                        ].map(({ label, color }) => (
                          <div className="skill-tag" key={label}>
                            <span className="skill-dot" style={{ background: color }} />
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Issue cards */}
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--txt-3)", marginBottom: "10px" }}>
                        Top recommendations
                      </div>
                      <div className="issue-list">
                        {[
                          {
                            score: "91",
                            title: "Add async connection pool support to SQLAlchemy integration",
                            why: "You use SQLAlchemy across 3 repos and this involves async patterns you already know",
                            repo: "tiangolo/sqlmodel",
                            diff: "intermediate",
                          },
                          {
                            score: "84",
                            title: "Improve startup error messages for missing env variables",
                            why: "Your ossCopilot project uses FastAPI + pydantic-settings — direct match",
                            repo: "fastapi/fastapi",
                            diff: "beginner",
                          },
                        ].map(({ score, title, why, repo, diff }) => (
                          <div className="issue-card" key={title}>
                            <div className="issue-score">
                              <div className="issue-score-val">{score}%</div>
                              <div className="issue-score-lbl">match</div>
                            </div>
                            <div className="issue-body">
                              <div className="issue-title">{title}</div>
                              <div className="issue-why">{why}</div>
                              <div className="issue-tags">
                                <span className={`tag ${diff}`}>{diff}</span>
                                <span className="tag repo">{repo}</span>
                              </div>
                            </div>
                            <div className="issue-action">
                              <button className="issue-btn cta">Get plan</button>
                              <button className="issue-btn">View issue</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── ARCHITECTURE ─────────────────────────── */}
        <section className="arch-section" id="arch">
          <div className="section-label">Architecture</div>
          <h2 className="section-h2">How the AI pipeline<br />actually works</h2>
          <p className="section-sub">
            A full-stack AI system — not just a wrapper. Every layer is purpose-built
            for semantic developer-issue matching.
          </p>

          <div className="arch-diagram">
            {/* Top row */}
            <div className="arch-row">
              <div className="arch-node">
                <div className="arch-node-box accent"><Icons.Monitor /> Next.js</div>
                <div className="arch-node-label">Frontend · Vercel</div>
              </div>
              <div className="arch-arrow" />
              <div className="arch-node">
                <div className="arch-node-box accent"><Icons.Zap /> FastAPI</div>
                <div className="arch-node-label">Backend · Render</div>
              </div>
              <div className="arch-arrow" />
              <div className="arch-node">
                <div className="arch-node-box"><Icons.Database /> PostgreSQL</div>
                <div className="arch-node-label">Neon + pgvector</div>
              </div>
              <div className="arch-arrow" />
              <div className="arch-node">
                <div className="arch-node-box"><Icons.Server /> Redis</div>
                <div className="arch-node-label">Cache + queue</div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", margin: "0 auto" }}>
              <div className="arch-vert-connector" style={{ marginLeft: "200px" }} />
            </div>

            {/* Bottom row */}
            <div className="arch-bottom-row">
              <div className="arch-col">
                <div className="arch-node">
                  <div className="arch-node-box green"><Icons.Github /> GitHub API</div>
                  <div className="arch-node-label">Issue ingestion</div>
                </div>
              </div>
              <div className="arch-col">
                <div className="arch-node">
                  <div className="arch-node-box green"><Icons.Brain /> Claude API</div>
                  <div className="arch-node-label">Skill extraction · planning</div>
                </div>
              </div>
              <div className="arch-col">
                <div className="arch-node">
                  <div className="arch-node-box green"><Icons.Layers /> OpenAI</div>
                  <div className="arch-node-label">text-embedding-3-small</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── OPEN SOURCE CTA ──────────────────────── */}
        <section className="oss-cta">
          <div className="oss-cta-inner">
            <div className="oss-cta-badge">
              <Icons.Check /> Open source · MIT licensed
            </div>
            <h2>Built in public.<br />Free forever.</h2>
            <p>
              OSSCopilot is fully open source. Read the code, open issues,
              submit PRs. Built to help developers — maintained by developers.
            </p>
            <div className="oss-actions">
              <button onClick={githubLogin} className="btn-green">
                <Icons.Github />
                Start contributing now
              </button>
              <a
                href="https://github.com/anahaaa/ossCopilot"
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
              >
                <Icons.Star />
                Star the repo
              </a>
            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────── */}
        <footer className="footer">
          <div className="footer-logo">
            <div className="footer-logo-icon"><Icons.GitFork /></div>
            OSSCopilot
          </div>

          <div className="footer-links">
            <a href="#how" className="footer-link">How it works</a>
            <a href="#arch" className="footer-link">Architecture</a>
            <a href="https://github.com/your-username/ossCopilot" target="_blank" rel="noreferrer" className="footer-link">GitHub</a>
            <a href="#" className="footer-link">Privacy</a>
          </div>

          <div className="footer-copy">© 2025 OSSCopilot · MIT License</div>
        </footer>

      </main>
    </>
  );
}