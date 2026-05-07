'use client';

import { ScoreMetrics } from '@/types/interview';

interface ScoreRadarProps {
  scores: ScoreMetrics[];
}

function getBarColor(value: number): string {
  if (value >= 8) return 'bg-emerald-400';
  if (value >= 6) return 'bg-amber-400';
  return 'bg-red-400';
}

function getTextColor(value: number): string {
  if (value >= 8) return 'text-emerald-400';
  if (value >= 6) return 'text-amber-400';
  return 'text-red-400';
}

export default function ScoreRadar({ scores }: ScoreRadarProps) {
  if (!scores.length) return null;

  const avgTechnical =
    scores.reduce((sum, s) => sum + s.technical, 0) / scores.length;
  const avgClarity =
    scores.reduce((sum, s) => sum + s.clarity, 0) / scores.length;
  const avgRelevance =
    scores.reduce((sum, s) => sum + s.relevance, 0) / scores.length;

  const metrics = [
    { label: 'Teknis', value: avgTechnical, icon: '⚙️' },
    { label: 'Kejelasan', value: avgClarity, icon: '💬' },
    { label: 'Relevansi', value: avgRelevance, icon: '🎯' },
  ];

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-semibold text-base mb-5">
        Rata-rata Skor per Metrik
      </h3>
      <div className="space-y-5">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm font-medium flex items-center gap-2">
                <span>{metric.icon}</span>
                {metric.label}
              </span>
              <span
                className={`text-lg font-bold ${getTextColor(metric.value)}`}
              >
                {metric.value.toFixed(1)}
              </span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${getBarColor(
                  metric.value
                )}`}
                style={{ width: `${(metric.value / 10) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
