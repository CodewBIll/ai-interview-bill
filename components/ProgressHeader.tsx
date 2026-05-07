'use client';

interface ProgressHeaderProps {
  role: string;
  level: string;
  currentQuestion: number;
}

export default function ProgressHeader({
  role,
  level,
  currentQuestion,
}: ProgressHeaderProps) {
  const progress = (currentQuestion / 5) * 100;

  return (
    <div className="w-full bg-white/5 backdrop-blur-sm border-b border-white/10 px-6 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-white font-semibold text-lg">{role}</h2>
            <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-bold uppercase tracking-wider">
              {level}
            </span>
          </div>
          <div className="text-gray-300 text-sm font-medium">
            Pertanyaan{' '}
            <span className="text-white font-bold text-base">
              {currentQuestion}
            </span>{' '}
            / 5
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-purple-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
