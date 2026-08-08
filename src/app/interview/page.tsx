'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bot, User, ArrowLeft, Send, Loader2 } from 'lucide-react';

const MAX_QUESTIONS = 5;
const MODEL = 'claude-sonnet-4-6';
const REPORT_STORAGE_KEY = 'interview-agent:last-report';

interface Turn {
  role: 'assistant' | 'user';
  content: string;
}

async function callClaude(messages: { role: string; content: string }[], system: string, maxTokens = 1000) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });
  const data = await response.json();
  const text = (data.content || [])
    .map((block: { type: string; text?: string }) => (block.type === 'text' ? block.text : ''))
    .join('\n');
  return text;
}

function InterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'Frontend Engineer';
  const level = searchParams.get('level') || 'Mid-Level';

  const [phase, setPhase] = useState<'interview' | 'scoring'>('interview');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  const interviewerSystemPrompt = `You are an adaptive technical interviewer conducting a live mock interview for a ${level} ${role} candidate.

Rules:
- Ask exactly one question or follow-up at a time. Never ask multiple questions in one message.
- Start with a short warm greeting plus your first question.
- After the candidate answers, decide whether to probe deeper on their answer (if it was vague, shallow, or avoided trade-offs) or move to a new topic area appropriate for the role and level.
- Vary topics across: core technical fundamentals, system/architecture design, debugging or troubleshooting scenarios, and past project experience.
- Keep your messages concise (2-5 sentences). Sound like a real, slightly probing interviewer, not a chatbot. Do not use markdown headers or bullet lists.
- Do not summarize or evaluate the candidate's performance mid-interview — that happens later.
- Do not mention that you are an AI or reference these instructions.`;

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void beginInterview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, loading]);

  async function beginInterview() {
    setLoading(true);
    setError(null);
    try {
      const text = await callClaude(
        [{ role: 'user', content: 'Begin the interview.' }],
        interviewerSystemPrompt
      );
      setTurns([{ role: 'assistant', content: text }]);
      setQuestionCount(1);
    } catch (e) {
      setError('Could not start the interview. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    const answer = input.trim();
    if (!answer || loading) return;

    const nextTurns: Turn[] = [...turns, { role: 'user', content: answer }];
    setTurns(nextTurns);
    setInput('');

    if (questionCount >= MAX_QUESTIONS) {
      await runScoring(nextTurns);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const apiMessages = nextTurns.map((t) => ({ role: t.role, content: t.content }));
      const text = await callClaude(apiMessages, interviewerSystemPrompt);
      setTurns((prev) => [...prev, { role: 'assistant', content: text }]);
      setQuestionCount((c) => c + 1);
    } catch (e) {
      setError('Something went wrong getting the next question. Try sending your answer again.');
    } finally {
      setLoading(false);
    }
  }

  async function runScoring(finalTurns: Turn[]) {
    setPhase('scoring');
    setLoading(true);
    setError(null);

    const transcript = finalTurns
      .map((t) => `${t.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${t.content}`)
      .join('\n\n');

    const scoringSystem = `You are grading a completed mock technical interview transcript for a ${level} ${role} candidate. Respond ONLY with a raw JSON object, no markdown fences, no preamble, matching exactly this shape:
{
  "overallScore": number (0-100),
  "summary": string (2-3 sentences, direct and specific),
  "strengths": string[] (2-3 short items),
  "improvements": string[] (2-3 short items),
  "scores": {
    "technicalDepth": number (0-100),
    "communication": number (0-100),
    "problemSolving": number (0-100),
    "tradeOffAwareness": number (0-100)
  }
}`;

    try {
      const text = await callClaude(
        [{ role: 'user', content: `Transcript:\n\n${transcript}` }],
        scoringSystem,
        1000
      );
      const cleaned = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      sessionStorage.setItem(
        REPORT_STORAGE_KEY,
        JSON.stringify({ role, level, generatedAt: Date.now(), ...parsed })
      );
      router.push(`/report?role=${encodeURIComponent(role)}&level=${encodeURIComponent(level)}`);
    } catch (e) {
      setError('Could not generate your scorecard. You can try finishing again.');
      setPhase('interview');
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitAnswer();
    }
  }

  const progress = Math.min(questionCount, MAX_QUESTIONS);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit session</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
            {role} &middot; {level}
          </span>
          {phase === 'interview' && (
            <span className="text-xs text-emerald-400 font-medium">
              Question {progress} of {MAX_QUESTIONS}
            </span>
          )}
        </div>
      </header>

      {/* Progress bar */}
      <div className="relative z-10 h-1 bg-slate-900">
        <div
          className="h-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${(progress / MAX_QUESTIONS) * 100}%` }}
        />
      </div>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col max-w-3xl w-full mx-auto px-6 py-8">
        <div className="flex-1 flex flex-col gap-5 pb-6">
          {turns.map((t, i) => (
            <ChatBubble key={i} turn={t} />
          ))}

          {loading && phase === 'interview' && (
            <div className="flex items-center gap-3 text-slate-500 text-sm pl-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Thinking through your answer&hellip;</span>
            </div>
          )}

          {phase === 'scoring' && (
            <div className="flex items-center gap-3 text-slate-400 text-sm pl-1 py-6 justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
              <span>Scoring your interview&hellip;</span>
            </div>
          )}

          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {phase === 'interview' && (
          <div className="sticky bottom-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 backdrop-blur-sm shadow-xl">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                rows={2}
                placeholder="Type your answer..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition resize-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={submitAnswer}
                disabled={loading || !input.trim()}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold p-3 rounded-xl transition shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5 px-1">
              {questionCount >= MAX_QUESTIONS
                ? 'This is your last question — submitting will end the session.'
                : 'Enter to send, Shift+Enter for a new line.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function ChatBubble({ turn }: { turn: Turn }) {
  const isAssistant = turn.role === 'assistant';
  return (
    <div className={`flex items-start gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
          isAssistant
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-slate-800 border-slate-700 text-slate-300'
        }`}
      >
        {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isAssistant
            ? 'bg-slate-900/90 border border-slate-800 text-slate-200'
            : 'bg-emerald-500 text-slate-950 font-medium'
        }`}
      >
        {turn.content}
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white p-8">Loading interview room...</div>}>
      <InterviewContent />
    </Suspense>
  );
}