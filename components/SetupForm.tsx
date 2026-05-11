'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';

const ROLES = [
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Engineer',
  'Mobile Developer',
  'Data Scientist',
  'ML Engineer',
  'DevOps Engineer',
  'Product Manager',
];

const LEVELS = ['Junior', 'Mid', 'Senior', 'Lead'];

const ROLE_ICONS: Record<string, string> = {
  'Frontend Engineer': 'bi bi-palette',
  'Backend Engineer': 'bi bi-cpu',
  'Full Stack Engineer': 'bi bi-diagram-3',
  'Mobile Developer': 'bi bi-phone',
  'Data Scientist': 'bi bi-bar-chart',
  'ML Engineer': 'bi bi-robot',
  'DevOps Engineer': 'bi bi-cloud-upload',
  'Product Manager': 'bi bi-kanban',
};

export default function SetupForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isReady = name.trim() && selectedRole && selectedLevel;

  useEffect(() => {
    const supabase = createClient();

    async function hydrateName() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const metadataName = user?.user_metadata?.full_name;
      const fallbackName =
        typeof metadataName === 'string' && metadataName.trim()
          ? metadataName.trim()
          : user?.email?.split('@')[0] ?? '';

      setName((currentName) => currentName || fallbackName);
    }

    void hydrateName();
  }, []);

  const handleSubmit = async () => {
    if (!isReady || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          role: selectedRole,
          level: selectedLevel,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Gagal membuat sesi');
      }

      const { sessionId } = await res.json();
      router.push(`/interview/${sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Name */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
          Nama Kamu
        </label>
        <input
          type="text"
          placeholder="Masukkan nama lengkap..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Role */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
          Pilih Role
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`relative p-4 rounded-xl border text-left transition-all ${
                selectedRole === role
                  ? 'border-primary bg-primary/15'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              {/* ICON FIXED HERE */}
              <i
                className={`${ROLE_ICONS[role]} text-2xl mb-2 block ${
                  selectedRole === role ? 'text-white' : 'text-gray-400'
                }`}
              />

              <span
                className={`text-sm font-medium ${
                  selectedRole === role ? 'text-white' : 'text-gray-300'
                }`}
              >
                {role}
              </span>

              {selectedRole === role && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Level */}
      <div className="mb-10">
        <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
          Level Pengalaman
        </label>

        <div className="grid grid-cols-4 gap-3">
          {LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`py-3.5 px-4 rounded-xl border font-semibold transition-all ${
                selectedLevel === level
                  ? 'border-primary bg-primary/15 text-white'
                  : 'border-white/10 bg-white/5 text-gray-400'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!isReady || isSubmitting}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          isReady && !isSubmitting
            ? 'bg-primary text-white hover:opacity-90'
            : 'bg-white/5 text-gray-600 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? 'Menyiapkan Interview...' : 'Mulai Interview'}
      </button>
    </div>
  );
}
