import { GitBranchIcon } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-3xl text-center">
        
        <div className="inline-flex items-center gap-2 border border-zinc-800 bg-zinc-900 px-4 py-2 rounded-full mb-6">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <p className="text-sm text-zinc-300">
            AI-Powered Open Source Contribution Assistant
          </p>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
          OSS
          <span className="text-zinc-400">Copilot</span>
        </h1>

        <p className="mt-6 text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          Discover open source issues tailored to your skills, understand
          repositories faster, and contribute confidently using AI-powered
          recommendations and codebase insights.
        </p>

        <div className="mt-10 flex items-center justify-center">
          <button className="flex items-center gap-3 bg-white text-black hover:bg-zinc-200 transition-all px-6 py-3 rounded-xl font-medium text-lg">
            <GitBranchIcon className="h-5 w-5" />
            Continue with GitHub
          </button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-2">
              Smart Recommendations
            </h3>
            <p className="text-zinc-400 text-sm">
              Find GitHub issues matching your skills and experience level.
            </p>
          </div>

          <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-2">
              Repo Understanding
            </h3>
            <p className="text-zinc-400 text-sm">
              AI-powered repository architecture and onboarding explanations.
            </p>
          </div>

          <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-2">
              Contribution Guidance
            </h3>
            <p className="text-zinc-400 text-sm">
              Step-by-step implementation plans for open source issues.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}