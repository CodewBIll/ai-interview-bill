'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthActions from '@/components/AuthActions';
import { InterviewSession } from '@/types/interview';
import type { CvScreening } from '@/types/cv-screening';
import { formatFileSize, scoreColor, statusBadge, statusLabel } from '@/lib/utils';

type Tab = 'interview' | 'screening';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('interview');
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [screenings, setScreenings] = useState<CvScreening[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sessRes, scrRes] = await Promise.all([
          fetch('/api/session'),
          fetch('/api/cv-screening'),
        ]);
        if (sessRes.ok) {
          const data = await sessRes.json();
          setSessions(Array.isArray(data) ? data : []);
        }
        if (scrRes.ok) {
          const data = await scrRes.json();
          setScreenings(Array.isArray(data) ? data : []);
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const completedSessions = sessions.filter(s => s.status === 'completed');
  const avgScore = completedSessions.length
    ? Math.round(completedSessions.reduce((sum, s) => sum + (s.overall_score || 0), 0) / completedSessions.length)
    : 0;
  const roleCounts: Record<string, number> = {};
  sessions.forEach(s => { roleCounts[s.role] = (roleCounts[s.role] || 0) + 1; });
  const topRole = Object.entries(roleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  const completedScreenings = screenings.filter(s => s.status === 'completed').length;

  const tabs: { id: Tab; label: string; icon: string; count: number }[] = [
    { id: 'interview', label: 'Riwayat Interview', icon: 'bi bi-camera-video-fill', count: sessions.length },
    { id: 'screening', label: 'Screening CV', icon: 'bi bi-file-earmark-person-fill', count: screenings.length },
  ];

  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="logo" className="h-8 w-auto object-contain brightness-150" />
          <span className="text-white font-semibold text-lg">Interva AI</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/interview" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
            + Interview Baru
          </Link>
          <Link href="/cv-screening" className="px-4 py-2 bg-white/5 border border-white/10 text-gray-200 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors">
            Screening CV
          </Link>
          <AuthActions />
        </div>
      </nav>

      <div className="flex-1 px-6 py-10 max-w-6xl mx-auto w-full">

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">Pantau progress interview dan riwayat screening CV kamu.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="glass-card rounded-2xl p-5">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <i className="bi bi-camera-video text-primary" /> Total Sesi
            </p>
            <p className="text-3xl font-bold text-white">{sessions.length}</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <i className="bi bi-star text-amber-400" /> Rata-rata Skor
            </p>
            <p className={`text-3xl font-bold ${scoreColor(avgScore)}`}>{avgScore || '-'}</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <i className="bi bi-briefcase text-purple-400" /> Role Terbanyak
            </p>
            <p className="text-3xl font-bold text-white truncate">{topRole}</p>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <i className="bi bi-file-earmark-check text-emerald-400" /> CV Discreened
            </p>
            <p className="text-3xl font-bold text-white">{completedScreenings}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/3 border border-white/8 rounded-2xl p-1 w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <i className={tab.icon} />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-white/10 text-gray-300' : 'bg-white/5 text-gray-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Memuat data...
          </div>
        ) : activeTab === 'interview' ? (
          sessions.length === 0 ? (
            <div className="text-center py-24 glass-card rounded-3xl">
              <div className="text-5xl mb-4 text-gray-700"><i className="bi bi-camera-video-off" /></div>
              <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Sesi Interview</h3>
              <p className="text-gray-500 mb-6 text-sm">Mulai interview pertama kamu dan pantau perkembanganmu!</p>
              <Link href="/interview" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">
                <i className="bi bi-play-fill" /> Mulai Interview
              </Link>
            </div>
          ) : (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/8">
                      <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                      <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
                      <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Level</th>
                      <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Skor</th>
                      <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => (
                      <tr
                        key={s.id}
                        onClick={() => s.status === 'completed' ? router.push(`/results/${s.id}`) : null}
                        className={`border-b border-white/5 transition-colors ${s.status === 'completed' ? 'hover:bg-white/4 cursor-pointer' : 'opacity-60'}`}
                      >
                        <td className="px-5 py-4 text-sm text-gray-400">{new Date(s.created_at).toLocaleDateString('id-ID')}</td>
                        <td className="px-5 py-4 text-sm text-white font-medium">{s.name}</td>
                        <td className="px-5 py-4 text-sm text-gray-300">{s.role}</td>
                        <td className="px-5 py-4 text-sm text-gray-300">{s.level}</td>
                        <td className={`px-5 py-4 text-sm font-bold ${scoreColor(s.overall_score)}`}>
                          {s.overall_score ?? '-'}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge(s.status)}`}>
                            {statusLabel(s.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          /* Screening Tab */
          screenings.length === 0 ? (
            <div className="text-center py-24 glass-card rounded-3xl">
              <div className="text-5xl mb-4 text-gray-700"><i className="bi bi-file-earmark-person" /></div>
              <h3 className="text-xl font-semibold text-white mb-2">Belum Ada CV yang Discreening</h3>
              <p className="text-gray-500 mb-6 text-sm">Upload CV kamu untuk mendapatkan evaluasi AI yang mendalam.</p>
              <Link href="/cv-screening" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold text-sm hover:bg-purple-500/90 transition-colors">
                <i className="bi bi-cloud-arrow-up-fill" /> Screening CV Sekarang
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {screenings.map((s) => (
                <div key={s.id} className="glass-card rounded-2xl p-5 hover:bg-white/5 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center shrink-0">
                        <i className="bi bi-file-earmark-pdf text-purple-400 text-lg" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{s.cv_file_name}</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {s.email} · {formatFileSize(s.cv_file_size)} · {new Date(s.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge(s.status)}`}>
                      {statusLabel(s.status)}
                    </span>
                  </div>
                  {s.result_summary && (
                    <div className="mt-4 pt-4 border-t border-white/8">
                      <p className="text-sm text-gray-400 leading-relaxed">{s.result_summary}</p>
                    </div>
                  )}
                  {s.error_message && (
                    <div className="mt-3 flex items-start gap-2 text-sm text-red-300">
                      <i className="bi bi-exclamation-triangle-fill mt-0.5 shrink-0" />
                      <p>{s.error_message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </main>
  );
}
