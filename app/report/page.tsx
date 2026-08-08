'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  RotateCcw,
  BarChart3,
  ShieldCheck,
  FileQuestion,
} from 'lucide-react';

const REPORT_STORAGE_KEY = 'interview-agent:last-report';

const METRIC_DEFS = [
  { key: 'technicalDepth', name: 'Technical Depth' },
  { key: 'communication', name: 'Communication Clarity' },
  { key: 'problemSolving', name: 'Problem Solving & Edge Cases' },
  { key: 'tradeOffAwareness', name: 'Trade-off Awareness' },
];

function statusForScore(score: number) {
  if (score >= 85) return { label: 'Excellent', color: 'bg-teal-400' };
  if (score >= 70) return { label: 'Strong', color: 'bg-emerald-500' };
  if (score >= 50) return { label: 'Needs Polish', color: 'bg-amber-400' };
  return { label: 'Needs Work', color: 'bg-rose-500' };
}

function readinessLabel(score: number) {
  if (score >= 85) return 'Hire Ready';
  if (score >= 70) return 'Close to Ready';
  if (score >= 50) return 'Needs Practice';
  return 'Early Stage';
}

function ReportContent() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const levelParam = searchParams.get('level');

  const [report, setReport] = useState<any>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(REPORT_STORAGE_KEY);
      setReport(raw ? JSON.parse(raw) : null);
    } catch (e) {
      setReport(null);
    } finally {
      setChecked(true);
    }
  }, []);

  if (!checked) {
    return null;
  }

  if (!report) {
    return <EmptyState role={roleParam} level={levelParam} />;
  }

  const role = report.role || roleParam || 'Software Engineer';
  const level = report.level || levelParam || 'Mid-Level';
  const overallScore = report.overallScore ?? 0;
  const metrics = METRIC_DEFS.map((m) => {
    const score = report.scores?.[m.key] ?? 0;
    return { ...m, score, ...statusForScore(score) };
  });
  const keyStrengths = report.strengths || [];
  const improvementAreas = report.improvements || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-emerald-400">
            <ShieldCheck className="w-4 h-4" /> Session Verified
          </div>
        </div>

        {/* Hero Score Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
              Diagnostic Evaluation
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Interview Assessment Scorecard
            </h1>
            <p className="text-xs text-slate-400">
              Target Role: <strong className="text-slate-200">{role} ({level})</strong>
            </p>
            {report.summary && (
              <p className="text-xs text-slate-400 max-w-md leading-relaxed pt-1">
                {report.summary}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 p-4 rounded-xl shrink-0">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 text-2xl font-black">
              {overallScore}
            </div>
            <div>
              <div className="text-xs text-slate-400">Overall Readiness</div>
              <div className="text-sm font-bold text-slate-100">
                {readinessLabel(overallScore)}
              </div>
            </div>
          </div>
        </div>

        {/* Metric Bars */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" /> Core Dimension Scores
          </h2>
          <div className="space-y-4">
            {metrics.map((m) => (
              <div key={m.key} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">{m.name}</span>
                  <span className="text-slate-400">
                    {m.score}% ({m.label})
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full ${m.color} transition-all duration-500`}
                    style={{ width: `${m.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Demonstrated Strengths
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {keyStrengths.length > 0 ? (
                keyStrengths.map((item: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/50"
                  >
                    <span className="text-emerald-400 font-bold">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500">No strengths recorded for this session.</li>
              )}
            </ul>
          </div>

          {/* Growth Areas */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Targeted Growth Areas
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {improvementAreas.length > 0 ? (
                improvementAreas.map((item: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/50"
                  >
                    <span className="text-amber-400 font-bold">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500">No growth areas recorded for this session.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Call To Action */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Link
            href="/"
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-500/10"
          >
            <RotateCcw className="w-4 h-4" /> Practice Another Session
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ role, level }: { role: string | null; level: string | null }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <FileQuestion className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white">No scorecard to show yet</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          This report loads from a completed interview session. Start a session first and your
          scorecard will land here automatically.
        </p>
        <Link
          href={
            role
              ? `/interview?role=${encodeURIComponent(role)}&level=${encodeURIComponent(level || 'Mid-Level')}`
              : '/'
          }
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl transition text-sm"
        >
          Start an interview
        </Link>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-slate-950 text-white p-8">Loading scorecard&hellip;</div>}
    >
      <ReportContent />
    </Suspense>
  );
}