"use client";

import { GitBranchIcon, User, Lock } from "lucide-react";
import "./landing.css";

export default function Home() {
  const githubLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user user:email`;
  };

  return (
    <main className="landing-root">
      {/* Decorative blobs */}
      <div className="blob blob-tl" />
      <div className="blob blob-tr" />
      <div className="blob blob-bl" />
      <div className="blob blob-br" />

      <div className="landing-card">
        {/* Left panel */}
        <div className="left-panel">
          <div className="logo-badge">
            <span className="logo-dot" />
            <span className="logo-text">OSSCopilot</span>
          </div>

          <h1 className="hero-title">
            OSS<span className="hero-accent">Copilot</span>
          </h1>

          <p className="hero-desc">
            Discover open source issues tailored to your skills, understand
            repositories faster, and contribute confidently using AI-powered
            recommendations and codebase insights.
          </p>

          <div className="feature-pills">
            <span className="pill">Smart Recommendations</span>
            <span className="pill">Repo Understanding</span>
            <span className="pill">Contribution Guidance</span>
          </div>
        </div>

        {/* Right panel — Sign In */}
        <div className="right-panel">
          <div className="signin-box">
            <h2 className="signin-title">SIGN IN</h2>

            <div className="input-group">
              <User className="input-icon" size={16} />
              <input className="signin-input" placeholder="Username" type="text" readOnly />
            </div>

            <div className="input-group">
              <Lock className="input-icon" size={16} />
              <input className="signin-input" placeholder="Password" type="password" readOnly />
            </div>

            <label className="agree-row">
              <input type="checkbox" className="agree-check" defaultChecked />
              <span>Accept Agreement and Privacy Policy</span>
            </label>

            <button onClick={githubLogin} className="signin-btn">
              <GitBranchIcon size={18} />
              Continue with GitHub
            </button>

            <p className="signin-footer">
              Don't have an account?{" "}
              <a href="#" className="create-link">Create</a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}