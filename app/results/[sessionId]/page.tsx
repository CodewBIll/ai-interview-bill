'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { InterviewSession, Message, ClaudeResponse, Feedback } from '@/types/interview';
import ScoreRadar from '@/components/ScoreRadar';
import AuthActions from '@/components/AuthActions';

interface QAItem {
  question: string;
  answer: string;
  feedback?: Feedback;
  qn: number;
}

export default function ResultsPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [qaItems, setQaItems] = useState<QAItem[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `/api/session?id=${sessionId}&messages=true`
        );
        if (!res.ok) throw new Error('Gagal memuat data');
        const data = await res.json();

        setSession(data.session);

        // Parse messages into Q&A items
        const msgs: Message[] = data.messages || [];
        const items: QAItem[] = [];
        let currentQuestion = '';
        let currentQn = 0;
        let currentFeedback: Feedback | undefined;

        for (const msg of msgs) {
          if (msg.role === 'assistant') {
            try {
              const parsed: ClaudeResponse = JSON.parse(msg.content);
              if (parsed.question) {
                // If we already had a question and this has feedback, save the previous Q&A
                if (currentQuestion && parsed.feedback) {
                  // This feedback belongs to the previous answer
                  // We'll attach it when we process the answer
                }
                currentFeedback = parsed.feedback || undefined;
                if (currentQuestion && items.length > 0 && currentFeedback) {
                  // Attach feedback to the last QA item
                  items[items.length - 1].feedback = currentFeedback;
                }
                currentQuestion = parsed.question;
                currentQn = parsed.qn;
              } else if (parsed.done && parsed.feedback) {
                // Final response — attach feedback to the last QA item
                if (items.length > 0) {
                  items[items.length - 1].feedback = {
                    summary: parsed.feedback.summary,
                    strengths: parsed.feedback.strengths,
                    improvements: parsed.feedback.improvements,
                    scores: {
                      technical: parsed.feedback.scores.technical,
                      clarity: parsed.feedback.scores.clarity,
                      relevance: parsed.feedback.scores.relevance,
                    },
                  };
                }
              }
            } catch {
              // Non-JSON message, skip
            }
          } else if (msg.role === 'user' && currentQuestion) {
            items.push({
              question: currentQuestion,
              answer: msg.content,
              qn: currentQn,
            });
            currentQuestion = '';
          }
        }

        setQaItems(items);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Terjadi kesalahan'
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Memuat hasil...
        </div>
      </main>
    );
  }

  if (error || !session) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {error || 'Sesi Tidak Ditemukan'}
          </h2>
          <Link
            href="/interview"
            className="text-primary hover:underline"
          >
            Mulai interview baru
          </Link>
        </div>
      </main>
    );
  }

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const scoreBg = (score: number) => {
    if (score >= 80)
      return 'from-emerald-400/20 to-emerald-400/5 border-emerald-400/30';
    if (score >= 60)
      return 'from-amber-400/20 to-amber-400/5 border-amber-400/30';
    return 'from-red-400/20 to-red-400/5 border-red-400/30';
  };

  const scores = [];
  if (
    session.avg_technical !== null &&
    session.avg_clarity !== null &&
    session.avg_relevance !== null
  ) {
    scores.push({
      technical: session.avg_technical!,
      clarity: session.avg_clarity!,
      relevance: session.avg_relevance!,
    });
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-sm font-bold">
            AI
          </div>
          <span className="text-white font-semibold text-lg">
            Interview Coach
          </span>
        </Link>
        <AuthActions />
      </nav>

      <div className="flex-1 px-6 py-12 max-w-4xl mx-auto w-full">
        {/* Score Hero */}
        <div className="text-center mb-12 animate-fadeIn">
          <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
            Skor Keseluruhan
          </p>
          <div
            className={`inline-flex items-center justify-center w-36 h-36 rounded-full bg-gradient-to-b ${scoreBg(
              session.overall_score || 0
            )} border-2 animate-pulseGlow mb-4`}
          >
            <span
              className={`text-5xl font-bold ${scoreColor(
                session.overall_score || 0
              )}`}
            >
              {session.overall_score || 0}
            </span>
          </div>
          <p className="text-gray-500 text-sm">dari 100</p>

          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-gray-300 text-sm">
              {session.role}
            </span>
            <span className="px-3 py-1.5 bg-primary/20 border border-primary/30 rounded-full text-primary text-sm font-medium">
              {session.level}
            </span>
          </div>
        </div>

        {/* Score Radar */}
        {scores.length > 0 && (
          <div className="mb-10 animate-fadeIn">
            <ScoreRadar scores={scores} />
          </div>
        )}

        {/* Final Summary */}
        {session.final_summary && (
          <div className="mb-10 glass-card rounded-2xl p-6 animate-fadeIn">
            <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
              📝 Ringkasan Akhir
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {session.final_summary}
            </p>
          </div>
        )}

        {/* Q&A Accordion */}
        {qaItems.length > 0 && (
          <div className="mb-10 animate-fadeIn">
            <h3 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
              💬 Pertanyaan & Jawaban
            </h3>
            <div className="space-y-3">
              {qaItems.map((item, idx) => (
                <div
                  key={idx}
                  className="glass-card rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedIdx(expandedIdx === idx ? null : idx)
                    }
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <span className="text-white font-medium text-sm flex items-center gap-3">
                      <span className="w-7 h-7 bg-primary/20 text-primary rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                        {item.qn}
                      </span>
                      <span className="line-clamp-1">{item.question}</span>
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ml-3 ${
                        expandedIdx === idx ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {expandedIdx === idx && (
                    <div className="px-5 pb-5 border-t border-white/5 pt-4 animate-fadeIn">
                      {/* Question */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Pertanyaan
                        </p>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {item.question}
                        </p>
                      </div>

                      {/* Answer */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Jawaban Kamu
                        </p>
                        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                          <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                            {item.answer}
                          </p>
                        </div>
                      </div>

                      {/* Feedback Scores */}
                      {item.feedback && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Feedback
                          </p>
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            {[
                              {
                                label: 'Teknis',
                                value: item.feedback.scores.technical,
                              },
                              {
                                label: 'Kejelasan',
                                value: item.feedback.scores.clarity,
                              },
                              {
                                label: 'Relevansi',
                                value: item.feedback.scores.relevance,
                              },
                            ].map((s) => (
                              <div
                                key={s.label}
                                className={`text-center p-2 rounded-lg border ${
                                  s.value >= 8
                                    ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400'
                                    : s.value >= 6
                                    ? 'bg-amber-400/10 border-amber-400/20 text-amber-400'
                                    : 'bg-red-400/10 border-red-400/20 text-red-400'
                                }`}
                              >
                                <div className="text-lg font-bold">
                                  {s.value}
                                </div>
                                <div className="text-xs opacity-80">
                                  {s.label}
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-gray-400 text-sm leading-relaxed">
                            {item.feedback.summary}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Session Info */}
        <div className="mb-10 glass-card rounded-2xl p-6 animate-fadeIn">
          <h3 className="text-white font-semibold text-base mb-4">
            📋 Detail Sesi
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                Kandidat
              </p>
              <p className="text-white font-medium">{session.name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                Role
              </p>
              <p className="text-white font-medium">{session.role}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                Level
              </p>
              <p className="text-white font-medium">{session.level}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                Tanggal
              </p>
              <p className="text-white font-medium">
                {new Date(session.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fadeIn">
          <Link
            href="/interview"
            id="btn-new-interview"
            className="flex-1 py-4 bg-gradient-to-r from-primary to-purple-500 text-white font-bold text-center rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            🚀 Mulai Interview Baru
          </Link>
          <Link
            href="/dashboard"
            id="btn-go-dashboard"
            className="flex-1 py-4 bg-white/5 border border-white/10 text-gray-300 font-semibold text-center rounded-xl hover:bg-white/10 hover:text-white transition-all duration-300"
          >
            📋 Lihat Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
