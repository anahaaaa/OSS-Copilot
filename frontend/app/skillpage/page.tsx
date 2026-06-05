"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./skill_detected.css";

/* ─── Types ──────────────────────────────────────────── */
interface Skill {
  id:         string;
  name:       string;
  emoji:      string;
  category:   string;
  confidence: number; // 0-100
  accent:     string;
  iconBg:     string;
  iconBorder: string;
  pillBg:     string;
  pillBorder: string;
  barLo:      string;
  glow:       string;
}

/* ─── Default skills (replaced by API data) ─────────── */
const DEFAULT_SKILLS: Skill[] = [
  {
    id: "python",
    name: "Python", emoji: "🐍", category: "language",
    confidence: 96,
    accent: "#a5b4fc", barLo: "#6366f1", glow: "rgba(99,102,241,.10)",
    iconBg: "rgba(99,102,241,.10)", iconBorder: "rgba(99,102,241,.20)",
    pillBg: "rgba(99,102,241,.10)", pillBorder: "rgba(99,102,241,.20)",
  },
  {
    id: "fastapi",
    name: "FastAPI", emoji: "⚡", category: "framework",
    confidence: 91,
    accent: "#4ade80", barLo: "#16a34a", glow: "rgba(74,222,128,.08)",
    iconBg: "rgba(74,222,128,.08)", iconBorder: "rgba(74,222,128,.18)",
    pillBg: "rgba(74,222,128,.08)", pillBorder: "rgba(74,222,128,.18)",
  },
  {
    id: "postgresql",
    name: "PostgreSQL", emoji: "🐘", category: "database",
    confidence: 88,
    accent: "#38bdf8", barLo: "#0284c7", glow: "rgba(56,189,248,.08)",
    iconBg: "rgba(56,189,248,.08)", iconBorder: "rgba(56,189,248,.18)",
    pillBg: "rgba(56,189,248,.08)", pillBorder: "rgba(56,189,248,.18)",
  },
  {
    id: "ml",
    name: "Machine Learning", emoji: "🧠", category: "domain",
    confidence: 79,
    accent: "#a78bfa", barLo: "#7c3aed", glow: "rgba(167,139,250,.08)",
    iconBg: "rgba(167,139,250,.08)", iconBorder: "rgba(167,139,250,.18)",
    pillBg: "rgba(167,139,250,.08)", pillBorder: "rgba(167,139,250,.18)",
  },
  {
    id: "docker",
    name: "Docker", emoji: "🐳", category: "devops",
    confidence: 82,
    accent: "#2dd4bf", barLo: "#0f766e", glow: "rgba(45,212,191,.07)",
    iconBg: "rgba(45,212,191,.07)", iconBorder: "rgba(45,212,191,.18)",
    pillBg: "rgba(45,212,191,.07)", pillBorder: "rgba(45,212,191,.18)",
  },
  {
    id: "react",
    name: "React", emoji: "⚛️", category: "frontend",
    confidence: 74,
    accent: "#38bdf8", barLo: "#0369a1", glow: "rgba(56,189,248,.07)",
    iconBg: "rgba(56,189,248,.07)", iconBorder: "rgba(56,189,248,.15)",
    pillBg: "rgba(56,189,248,.07)", pillBorder: "rgba(56,189,248,.15)",
  },
  {
    id: "typescript",
    name: "TypeScript", emoji: "🔷", category: "language",
    confidence: 83,
    accent: "#a5b4fc", barLo: "#4f46e5", glow: "rgba(99,102,241,.09)",
    iconBg: "rgba(99,102,241,.09)", iconBorder: "rgba(99,102,241,.18)",
    pillBg: "rgba(99,102,241,.09)", pillBorder: "rgba(99,102,241,.18)",
  },
  {
    id: "sqlalchemy",
    name: "SQLAlchemy", emoji: "🔗", category: "library",
    confidence: 85,
    accent: "#fb923c", barLo: "#c2410c", glow: "rgba(251,146,60,.07)",
    iconBg: "rgba(251,146,60,.07)", iconBorder: "rgba(251,146,60,.18)",
    pillBg: "rgba(251,146,60,.07)", pillBorder: "rgba(251,146,60,.18)",
  },
];

/* ─── Inline SVG Icons ───────────────────────────────── */
const Icon = {
  GitFork: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/>
      <path d="M6 9v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9"/><line x1="12" y1="12" x2="12" y2="15"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Pencil: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Sparkle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
    </svg>
  ),
  Info: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  Warning: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
};

/* ─── Skill card component ───────────────────────────── */
function SkillCard({
  skill, index, editMode, onRemove,
}: {
  skill: Skill;
  index: number;
  editMode: boolean;
  onRemove: (id: string) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [removed, setRemoved] = useState(false);

  // Animate bar width in after card appears
  useEffect(() => {
    const delay = 300 + index * 80 + 300; // card delay + extra
    const t = setTimeout(() => {
      if (barRef.current) {
        barRef.current.style.width = `${skill.confidence}%`;
      }
    }, delay);
    return () => clearTimeout(t);
  }, [index, skill.confidence]);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRemoved(true);
    setTimeout(() => onRemove(skill.id), 280);
  };

  return (
    <div
      className={`sk-card${editMode ? " editable" : ""}${removed ? " removed" : ""}`}
      style={{
        animationDelay: `${index * 80}ms`,
        ["--card-accent" as string]:      skill.accent,
        ["--card-glow" as string]:        skill.glow,
        ["--card-icon-bg" as string]:     skill.iconBg,
        ["--card-icon-border" as string]: skill.iconBorder,
        ["--card-pill-bg" as string]:     skill.pillBg,
        ["--card-pill-border" as string]: skill.pillBorder,
        ["--card-bar-lo" as string]:      skill.barLo,
      }}
    >
      {/* Remove button (edit mode) */}
      {editMode && (
        <div className="sk-card-remove" onClick={handleRemove}>
          <Icon.X />
        </div>
      )}

      {/* Top row: icon + confidence */}
      <div className="sk-card-top">
        <div className="sk-card-icon">{skill.emoji}</div>
        <div className="sk-conf-pill">{skill.confidence}%</div>
      </div>

      {/* Name + category */}
      <div>
        <div className="sk-card-name">{skill.name}</div>
        <div className="sk-card-cat">{skill.category}</div>
      </div>

      {/* Confidence bar */}
      <div className="sk-bar-track">
        <div ref={barRef} className="sk-bar-fill" />
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────── */
interface SkillsDetectedProps {
  skills?:      Skill[];
  repoCount?:   number;
  username?:    string;
  onContinue?:  () => void;
}

export default function SkillsDetected({
  skills: initialSkills = DEFAULT_SKILLS,
  repoCount  = 12,
  username   = "you",
  onContinue,
}: SkillsDetectedProps) {
  const router    = useRouter();
  const [skills, setSkills]       = useState(initialSkills);
  const [editMode, setEditMode]   = useState(false);
  const [revealed, setRevealed]   = useState(false);

  // Trigger reveal after mount
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleRemove = (id: string) => {
    setTimeout(() => setSkills(prev => prev.filter(s => s.id !== id)), 290);
  };

  const handleContinue = () => {
    if (onContinue) onContinue();
    else router.push("/repository");
  };

  const avgConfidence = Math.round(
    skills.reduce((acc, s) => acc + s.confidence, 0) / skills.length
  );

  return (
    <>
      {/* Backgrounds */}
      <div className="sk-bg">
        <div className="sk-radial" />
        <div className="sk-grid" />
        <div className="sk-grain" />
        <div className="sk-orb sk-orb-1" />
        <div className="sk-orb sk-orb-2" />
        <div className="sk-orb sk-orb-3" />
      </div>

      {/* Nav */}
      <nav className="sk-nav">
        <div className="sk-nav-logo">
          <div className="sk-nav-logo-icon"><Icon.GitFork /></div>
          OSSCopilot
        </div>
        <div className="sk-nav-step">Step 2 of 2</div>
      </nav>

      {/* Progress bar */}
      <div className="sk-stepper">
        <div className="sk-stepper-fill" />
      </div>

      {/* Page */}
      <div className="sk-root">

        {/* ── Header ──────────────────────────────── */}
        <div className="sk-header">
          <div className="sk-header-badge">
            <span className="sk-badge-pulse" />
            analysis complete
          </div>

          <h1 className="sk-h1">
            We analysed your{" "}
            <span
              className="sk-h1-count"
              data-text={`${repoCount}`}
            >
              {repoCount}
            </span>{" "}
            repositories
          </h1>

          <p className="sk-sub">
            Found <strong style={{ color: "var(--txt-1)", fontWeight: 600 }}>
              {skills.length} skills
            </strong> across your codebase. Review them below — these drive
            your personalised recommendations.
          </p>
        </div>

        {/* ── Stats row ───────────────────────────── */}
        {revealed && (
          <div className="sk-stats">
            <div className="sk-stat">
              <div className="sk-stat-n">{skills.length}</div>
              <div className="sk-stat-l">skills found</div>
            </div>
            <div className="sk-stat">
              <div className="sk-stat-n">{avgConfidence}%</div>
              <div className="sk-stat-l">avg confidence</div>
            </div>
            <div className="sk-stat">
              <div className="sk-stat-n">{repoCount}</div>
              <div className="sk-stat-l">repos scanned</div>
            </div>
            <div className="sk-stat">
              <div className="sk-stat-n">
                {skills.filter(s => s.confidence >= 80).length}
              </div>
              <div className="sk-stat-l">high confidence</div>
            </div>
          </div>
        )}

        {/* ── Edit mode info bar ───────────────────── */}
        {editMode && (
          <div className="sk-edit-bar">
            <Icon.Warning />
            Edit mode — click the × on any card to remove a skill
          </div>
        )}

        {/* ── Skills grid ─────────────────────────── */}
        {revealed && (
          <div className="sk-grid-wrap">
            {skills.map((skill, i) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                index={i}
                editMode={editMode}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}

        {/* ── Explanation panel ────────────────────── */}
        <div className="sk-explain">
          <div className="sk-explain-icon">
            <Icon.Sparkle />
          </div>
          <div className="sk-explain-body">
            <div className="sk-explain-title">
              How these skills are used
            </div>
            <div className="sk-explain-text">
              These skills are embedded as a vector and matched against
              thousands of open GitHub issues using cosine similarity.
              Higher confidence = stronger signal in the matching algorithm.
              You can remove any skill that doesn't reflect your actual
              experience.
            </div>
          </div>
        </div>

        {/* ── CTA row ─────────────────────────────── */}
        <div className="sk-cta-row">
          <button className="sk-btn-primary" onClick={handleContinue}>
            <Icon.Sparkle />
            View my recommendations
            <Icon.ArrowRight />
          </button>

          <button
            className="sk-btn-ghost"
            onClick={() => setEditMode(e => !e)}
          >
            {editMode ? <Icon.Check /> : <Icon.Pencil />}
            {editMode ? "Done editing" : "Edit skills"}
          </button>
        </div>

      </div>
    </>
  );
}