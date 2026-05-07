'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { InterviewSession } from '@/types/interview';

export default function DashboardPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/session');
        if (res.ok) {
          const data = await res.json();
          setSessions(Array.isArray(data) ? data : []);
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const completedSessions = sessions.filter(s => s.status === 'completed');
  const avgScore = completedSessions.length
    ? Math.round(completedSessions.reduce((sum, s) => sum + (s.overall_score || 0), 0) / completedSessions.length)
    : 0;

  // Most common role
  const roleCounts: Record<string, number> = {};
  sessions.forEach(s => { roleCounts[s.role] = (roleCounts[s.role] || 0) + 1; });
  const topRole = Object.entries(roleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  const scoreColor = (score: number | null) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const statusBadge = (status: string) => {
    if (status === 'completed') return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
    return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-sm font-bold">AI</div>
          <span className="text-white font-semibold text-lg">Interview Coach</span>
        </Link>
        <Link href="/interview" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
          + Interview Baru
        </Link>
      </nav>

      <div className="flex-1 px-6 py-10 max-w-6xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="glass-card rounded-2xl p-5">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Total Sesi</p>
            <p className="text-3xl font-bold text-white">{sessions.length}</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Rata-rata Skor</p>
            <p className={`text-3xl font-bold ${scoreColor(avgScore)}`}>{avgScore || '-'}</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Role Terbanyak</p>
            <p className="text-3xl font-bold text-white truncate">{topRole}</p>
          </div>
        </div>

        {/* Session Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Memuat data...
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4"><i className="bi bi-clock-history"></i></div>
            <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Sesi</h3>
            <p className="text-gray-400 mb-6">Mulai interview pertama kamu!</p>
            <Link href="/interview" className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">
              Mulai Interview
            </Link>
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tanggal</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nama</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Level</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Skor</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id}
                      onClick={() => s.status === 'completed' ? router.push(`/results/${s.id}`) : null}
                      className={`border-b border-white/5 transition-colors ${s.status === 'completed' ? 'hover:bg-white/5 cursor-pointer' : 'opacity-60'}`}>
                      <td className="px-5 py-4 text-sm text-gray-300">{new Date(s.created_at).toLocaleDateString('id-ID')}</td>
                      <td className="px-5 py-4 text-sm text-white font-medium">{s.name}</td>
                      <td className="px-5 py-4 text-sm text-gray-300">{s.role}</td>
                      <td className="px-5 py-4 text-sm text-gray-300">{s.level}</td>
                      <td className={`px-5 py-4 text-sm font-bold ${scoreColor(s.overall_score)}`}>
                        {s.overall_score ?? '-'}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge(s.status)}`}>
                          {s.status === 'completed' ? 'Selesai' : 'Berlangsung'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
