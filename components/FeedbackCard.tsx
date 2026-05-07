'use client';

import { Feedback } from '@/types/interview';

interface FeedbackCardProps {
  feedback: Feedback;
  questionNumber: number;
}

function getScoreColor(score: number): string {
  if (score >= 8) return 'text-emerald-400 bg-emerald-400/15 border-emerald-400/30';
  if (score >= 6) return 'text-amber-400 bg-amber-400/15 border-amber-400/30';
  return 'text-red-400 bg-red-400/15 border-red-400/30';
}

function getScoreBarColor(score: number): string {
  if (score >= 8) return 'bg-emerald-400';
  if (score >= 6) return 'bg-amber-400';
  return 'bg-red-400';
}

export default function FeedbackCard({
  feedback,
  questionNumber,
}: FeedbackCardProps) {
  const scores = [
    { label: 'Teknis', value: feedback.scores.technical, key: 'technical' },
    { label: 'Kejelasan', value: feedback.scores.clarity, key: 'clarity' },
    { label: 'Relevansi', value: feedback.scores.relevance, key: 'relevance' },
  ];

  return (
    <div className="mx-auto max-w-[80%] mb-4 bg-white/5 border border-white/10 rounded-2xl p-5 animate-fadeIn">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Feedback Pertanyaan {questionNumber}
        </span>
      </div>

      {/* Score Boxes */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {scores.map((score) => (
          <div
            key={score.key}
            className={`text-center p-3 rounded-xl border ${getScoreColor(score.value)}`}
          >
            <div className="text-2xl font-bold">{score.value}</div>
            <div className="text-xs font-medium mt-1 opacity-80">
              {score.label}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <p className="text-gray-300 text-sm leading-relaxed mb-4">
        {feedback.summary}
      </p>

      {/* Strengths */}
      {feedback.strengths.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {feedback.strengths.map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-400/10 border border-emerald-400/20 rounded-full text-emerald-400 text-xs font-medium"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Improvements */}
      {feedback.improvements.length > 0 && (
        <div>
          <div className="flex flex-wrap gap-2">
            {feedback.improvements.map((imp, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-400/10 border border-amber-400/20 rounded-full text-amber-400 text-xs font-medium"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {imp}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
