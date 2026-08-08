'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bot, Sparkles, ArrowRight, ShieldCheck, Zap, Award } from 'lucide-react';

export default function LandingPage() {
  const [role, setRole] = useState('Frontend Engineer');
  const [level, setLevel] = useState('Mid-Level');

  const roles = [
    'Frontend Engineer',
    'Backend Engineer',
    'Full Stack Engineer',
    'DevOps Engineer',
    'AI / ML Engineer',
    'Product Manager',
  ];

  const levels = ['Junior', 'Mid-Level', 'Senior', 'Tech Lead'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Background Decorator */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Bot className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">The Interview Agent</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>v1.0 Adaptive AI Engine</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
          <Zap className="w-3.5 h-3.5" />
          <span>Next-Gen Technical Interview Practice</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-2xl leading-tight">
          Master your tech interviews with an <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Adaptive AI</span>.
        </h1>

        <p className="mt-4 text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
          Unlike standard mock tools, our agent adapts in real time—probing shallow answers, challenging trade-offs, and scoring your performance.
        </p>

        {/* Configuration Card */}
        <div className="w-full max-w-md mt-10 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl text-left backdrop-blur-sm">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
            Setup Your Session
          </h2>

          {/* Role Selection */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Select Target Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500/50 transition"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Level Selection */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Experience Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition ${
                    level === lvl
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Start Session CTA */}
          <Link
            href="/interview"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 group shadow-lg shadow-emerald-500/10"
          >
            <span>Start Interview Session</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        {/* Value Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 w-full max-w-3xl text-left">
          <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="text-xs font-bold text-slate-200">Adaptive Probing</h3>
            <p className="text-xs text-slate-400 mt-1">
              Catches vague responses and pushes you for technical specifics.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-xl">
            <Zap className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="text-xs font-bold text-slate-200">Real-Time Evaluation</h3>
            <p className="text-xs text-slate-400 mt-1">
              Monitors depth, clarity, and architectural reasoning dynamically.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-xl">
            <Award className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="text-xs font-bold text-slate-200">Detailed Feedback</h3>
            <p className="text-xs text-slate-400 mt-1">
              Get targeted scorecards and exact areas for improvement.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-900/30 px-6 py-4 text-center text-xs text-slate-500">
        Built for the ABTalks Vibe Code Hackathon • The Interview Agent
      </footer>
    </div>
  );
}