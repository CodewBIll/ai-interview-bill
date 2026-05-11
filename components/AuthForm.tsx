'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import type { Provider } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/client';

type AuthMode = 'login' | 'register';

interface AuthFormProps {
  mode: AuthMode;
  nextPath?: string;
}

const modeContent: Record<
  AuthMode,
  {
    title: string;
    description: string;
    submitLabel: string;
    alternateLabel: string;
    alternateHref: string;
    alternateText: string;
  }
> = {
  login: {
    title: 'Masuk ke Interva AI',
    description:
      'Lanjutkan mock interview kamu dengan email, Google, atau GitHub.',
    submitLabel: 'Masuk',
    alternateLabel: 'Belum punya akun?',
    alternateHref: '/register',
    alternateText: 'Daftar sekarang',
  },
  register: {
    title: 'Buat akun baru',
    description:
      'Daftar untuk menyimpan riwayat interview dan dashboard progress kamu.',
    submitLabel: 'Daftar',
    alternateLabel: 'Sudah punya akun?',
    alternateHref: '/login',
    alternateText: 'Masuk di sini',
  },
};

export default function AuthForm({
  mode,
  nextPath = '/dashboard',
}: AuthFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const content = modeContent[mode];

  const handleOAuth = async (provider: Provider) => {
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            nextPath
          )}`,
        },
      });

      if (oauthError) {
        throw oauthError;
      }
    } catch (oauthError) {
      setError(
        oauthError instanceof Error
          ? oauthError.message
          : 'Gagal memulai login OAuth.'
      );
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      if (mode === 'register') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
              nextPath
            )}`,
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        if (data.session) {
          router.replace(nextPath);
          router.refresh();
          return;
        }

        setMessage(
          'Akun berhasil dibuat. Cek email kamu untuk verifikasi sebelum masuk.'
        );
        setIsSubmitting(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      router.replace(nextPath);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Terjadi kesalahan saat memproses autentikasi.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">{content.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-400">
          {content.description}
        </p>
      </div>

      <div className="grid gap-3">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => {
            void handleOAuth('google');
          }}
          className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white px-4 py-3 font-semibold text-slate-900 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="text-lg">G</span>
          Lanjut dengan Google
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => {
            void handleOAuth('github');
          }}
          className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#111827] px-4 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <i className="bi bi-github text-lg" />
          Lanjut dengan GitHub
        </button>
      </div>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs uppercase tracking-[0.25em] text-gray-500">
          atau
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label
              htmlFor="fullName"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Nama lengkap
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-gray-500 focus:border-primary focus:outline-none"
              placeholder="Nama kamu"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-gray-500 focus:border-primary focus:outline-none"
            placeholder="nama@email.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-gray-500 focus:border-primary focus:outline-none"
            placeholder="Minimal 8 karakter"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-gradient-to-r from-primary to-blue-500 px-4 py-3 font-bold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Memproses...' : content.submitLabel}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        {content.alternateLabel}{' '}
        <Link
          href={`${content.alternateHref}${nextPath !== '/dashboard' ? `?next=${encodeURIComponent(nextPath)}` : ''}`}
          className="font-semibold text-primary hover:text-white"
        >
          {content.alternateText}
        </Link>
      </p>
    </div>
  );
}
