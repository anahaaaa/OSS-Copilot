"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./analysis-progress.css";

/* ─── Types ──────────────────────────────────────────── */
type StepStatus = "done" | "active" | "pending";

interface PipelineStep {
  id: string;
  label: string;
  desc: string;
  duration: number; // ms this step takes
}

interface LogEntry {
  time: string;
  prefix: string;
  msg: string;
  type: "ok" | "info" | "default";
}

/* ─── Pipeline config ────────────────────────────────── */
const PIPELINE: PipelineStep[] = [
  {
    id: "github",
    label: "GitHub Connected",
    desc: "OAuth handshake complete",
    duration: 0, // already done
  },
  {
    id: "repos",
    label: "Repositories Retrieved",
    desc: "Fetched via GitHub REST API",
    duration: 0, // already done
  },
  {
    id: "skills",
    label: "Extracting Skills",
    desc: "Claude AI reading READMEs and dependencies",
    duration: 4200,
  },
  {
    id: "profile",
    label: "Building Developer Profile",
    desc: "Generating skill vectors with OpenAI embeddings",
    duration: 3000,
  },
  {
    id: "recs",
    label: "Preparing Recommendations",
    desc: "Running cosine similarity search across issues",
    duration: 2500,
  },
];

/* ─── Inline SVG icons ───────────────────────────────── */
const Icon = {
  GitFork: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/>
      <path d="M6 9v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9"/><line x1="12" y1="12" x2="12" y2="15"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Lock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Repo: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
    </svg>
  ),
};

/* ─── Log message pool ───────────────────────────────── */
const LOG_POOL: Record<string, LogEntry[]> = {
  skills: [
    { time: "", prefix: "→", msg: "Reading README.md from 12 repositories", type: "info" },
    { time: "", prefix: "→", msg: "Sending to claude-sonnet-4-20250514…", type: "info" },
    { time: "", prefix: "✓", msg: "Detected: Python, FastAPI, SQLAlchemy", type: "ok" },
    { time: "", prefix: "✓", msg: "Detected: TypeScript, Next.js, React", type: "ok" },
    { time: "", prefix: "→", msg: "Inferring experience level…", type: "info" },
    { time: "", prefix: "✓", msg: "Level: intermediate (backend-heavy)", type: "ok" },
  ],
  profile: [
    { time: "", prefix: "→", msg: "Calling text-embedding-3-small…", type: "info" },
    { time: "", prefix: "→", msg: "Embedding skill vector (1536 dims)", type: "info" },
    { time: "", prefix: "✓", msg: "Stored in pgvector", type: "ok" },
    { time: "", prefix: "→", msg: "Building domain categories…", type: "info" },
    { time: "", prefix: "✓", msg: "Domains: backend, ai-ml, devops", type: "ok" },
  ],
  recs: [
    { time: "", prefix: "→", msg: "Running cosine similarity search…", type: "info" },
    { time: "", prefix: "→", msg: "Scanning 2,841 open issues…", type: "info" },
    { time: "", prefix: "✓", msg: "Found 47 strong matches (score ≥ 0.78)", type: "ok" },
    { time: "", prefix: "→", msg: "Generating match explanations…", type: "info" },
    { time: "", prefix: "✓", msg: "Recommendations ready!", type: "ok" },
  ],
};

function nowStr() {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/* ─── Main component ─────────────────────────────────── */
interface AnalysisProgressProps {
  repoCount?: number;
  username?: string;
  onComplete?: () => void;
}

export default function AnalysisProgress({
  repoCount = 12,
  username = "you",
  onComplete,
}: AnalysisProgressProps) {
  const router = useRouter();

  // step index: 0-1 start as done, 2 starts active
  const [activeStep, setActiveStep] = useState(2); // index into PIPELINE
  const [stepBar, setStepBar]       = useState(0);  // 0-100 for active step bar
  const [pct, setPct]               = useState(28); // ring %
  const [logs, setLogs]             = useState<LogEntry[]>([]);
  const [done, setDone]             = useState(false);

  const arcRef    = useRef<SVGCircleElement>(null);
  const logBoxRef = useRef<HTMLDivElement>(null);

  /* ── Drive the animation sequence ─────────────────── */
  useEffect(() => {
    // Steps 0 and 1 are already done when we arrive.
    // We'll animate through steps 2, 3, 4.
    console.log("EFFECT STARTED");
    const sequence = PIPELINE.slice(2); // skills, profile, recs
    let cancelled = false;

    const runStep = async (stepIdx: number, globalIdx: number) => {
      if (cancelled) return;
      const step = sequence[stepIdx];

      setActiveStep(globalIdx);
      setStepBar(0);

      // Animate bar 0→100 over step.duration
      const start = Date.now();
      const tick = () => {
        if (cancelled) return;
        const elapsed = Date.now() - start;
        const progress = Math.min((elapsed / step.duration) * 100, 100);
        setStepBar(progress);

        // Ring: map steps to %
        // step 0 (global 2) → 28→55
        // step 1 (global 3) → 55→78
        // step 2 (global 4) → 78→100
        const pctRanges = [[28, 55], [55, 78], [78, 100]];
        const [lo, hi] = pctRanges[stepIdx];
        setPct(Math.round(lo + (progress / 100) * (hi - lo)));

        if (progress < 100) {
          requestAnimationFrame(tick);
        }
      };
      requestAnimationFrame(tick);

      // Drip logs for this step
      const pool = LOG_POOL[step.id] ?? [];
      const interval = step.duration / (pool.length + 1);
      for (let i = 0; i < pool.length; i++) {
        await new Promise(r => setTimeout(r, interval));
        if (cancelled) return;
        setLogs(prev => [
          ...prev,
          { ...pool[i], time: nowStr() },
        ].slice(-6)); // keep last 6
      }

      await new Promise(r => setTimeout(r, step.duration - interval * pool.length));
      if (cancelled) return;

      setActiveStep(globalIdx + 1); // mark done, move pointer forward
    };

    (async () => {
      await runStep(0, 2);
      await runStep(1, 3);
      await runStep(2, 4);
      if (!cancelled) {
        setDone(true);
        setPct(100);
        setStepBar(100);
        setTimeout(() => {
          console.log("TIMEOUT FIRED");
          console.log("cancelled =", cancelled);
          console.log("onComplete =", onComplete);

          if (!cancelled && onComplete) {
            console.log("CALLING ONCOMPLETE");
            onComplete();
          }
        }, 900);
      }
    })();

    return () => { 
      console.log("EFFECT CLEANUP");
      cancelled = true; };
  }, []);

  /* ── Sync ring SVG dash ───────────────────────────── */
  useEffect(() => {
    if (arcRef.current) {
      const circumference = 377; // 2π × 60
      arcRef.current.style.strokeDashoffset = String(
        circumference - (pct / 100) * circumference
      );
    }
  }, [pct]);

  /* ── Auto-scroll terminal ─────────────────────────── */
  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs]);

  /* ── Status helpers ───────────────────────────────── */
  const stepStatus = (idx: number): StepStatus => {
    if (idx < activeStep) return "done";
    if (idx === activeStep) return "active";
    return "pending";
  };

  const stepTime = (idx: number): string => {
    if (idx < activeStep) return "✓";
    if (idx === activeStep) return "running";
    return "—";
  };

  /* ── Est. time remaining ──────────────────────────── */
  const remaining = PIPELINE.slice(activeStep + 1)
    .reduce((acc, s) => acc + s.duration, 0);
  const remainSec = Math.ceil(remaining / 1000);

  return (
    <>
      {/* Backgrounds */}
      <div className="ap-bg">
        <div className="ap-grid" />
        <div className="ap-glow" />
        <div className="ap-grain" />
        <div className="ap-scanline" />
      </div>

      {/* Topnav */}
      <nav className="ap-nav">
        <div className="ap-nav-logo">
          <div className="ap-nav-logo-icon"><Icon.GitFork /></div>
          OSSCopilot
        </div>
        <div className="ap-nav-right">
          {!done && <div className="ap-nav-dot" />}
          {done ? "analysis complete" : `analysing ${username}'s repos`}
        </div>
      </nav>

      {/* Main */}
      <div className="ap-root">
        <div className="ap-content">

          {/* Header */}
          <div className="ap-header">
            <div className="ap-eyebrow">
              <span className="ap-eyebrow-dot" />
              {done ? "analysis complete" : "analysis in progress"}
            </div>
            <h1 className="ap-h1">
              {done
                ? <><span>Ready.</span> Let's find your issues.</>
                : <>Analysing your <span>repositories</span></>
              }
            </h1>
            <div className="ap-sub">
              {done
                ? "analysis complete"
                : `${repoCount} repos · ~${remainSec}s remaining`
              }
            </div>
          </div>

          {/* Ring */}
          <div className="ap-ring-wrap">
            <div className="ap-ring-outer">
              <div className="ap-ring-halo" />
              <svg className="ap-ring-svg" viewBox="0 0 140 140">
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                <circle className="ap-ring-track" cx="70" cy="70" r="60" />
                <circle
                  ref={arcRef}
                  className="ap-ring-arc"
                  cx="70" cy="70" r="60"
                />
              </svg>
              <div className="ap-ring-center">
                <div className="ap-ring-pct">{pct}%</div>
                <div className="ap-ring-lbl">complete</div>
              </div>
            </div>
            <div className="ap-repo-count">
              <Icon.Repo />
              Scanning <span>{repoCount} repositories</span>
            </div>
          </div>

          {/* Pipeline steps */}
          <div className="ap-pipeline">
            <div className="ap-pipe-header">
              <div className="ap-pipe-title">Pipeline</div>
              <div className="ap-pipe-badge">
                {PIPELINE.filter((_, i) => i < activeStep).length} / {PIPELINE.length} steps
              </div>
            </div>

            {PIPELINE.map((step, i) => {
              const status = stepStatus(i);
              return (
                <div key={step.id} className={`ap-step ${status}`}>
                  {/* Icon */}
                  <div className={`ap-step-icon ${status}`}>
                    {status === "done"    && <Icon.Check />}
                    {status === "active"  && <div className="ap-step-spinner" />}
                    {status === "pending" && <Icon.Clock />}
                  </div>

                  {/* Body */}
                  <div className="ap-step-body">
                    <div className={`ap-step-label ${status}`}>
                      {step.label}
                    </div>
                    <div className="ap-step-desc">{step.desc}</div>
                    {/* Animated bar under active step */}
                    {status === "active" && (
                      <div className="ap-step-bar">
                        <div
                          className="ap-step-bar-fill"
                          style={{ width: `${stepBar}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Right indicator */}
                  <div className={`ap-step-right ${status}`}>
                    {stepTime(i)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Terminal log */}
          <div className="ap-terminal">
            <div className="ap-term-header">
              <div className="ap-term-dots">
                <div className="ap-term-dot" />
                <div className="ap-term-dot" />
                <div className="ap-term-dot" />
              </div>
              <div className="ap-term-label">osscopilot — analysis log</div>
            </div>
            <div className="ap-term-body" ref={logBoxRef}>
              {logs.map((l, i) => (
                <div
                  className="ap-log-line"
                  key={i}
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <span className="ap-log-time">{l.time}</span>
                  <span className="ap-log-prefix">{l.prefix}</span>
                  <span className={`ap-log-msg ${l.type}`}>{l.msg}</span>
                </div>
              ))}
              {!done && (
                <div className="ap-log-line" style={{ animationDelay: "0s" }}>
                  <span className="ap-log-time">{nowStr()}</span>
                  <span className="ap-log-prefix" style={{ color: "var(--purple-hi)" }}>▶</span>
                  <span className="ap-log-msg">
                    <span className="ap-cursor" />
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer note */}
          <div className="ap-note">
            <Icon.Lock />
            read-only · no code is stored · analysis runs server-side
          </div>

        </div>
      </div>
    </>
  );
}