'use client';

import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase/client';

interface AuthUserState {
  email: string | null;
  name: string | null;
}

export default function AuthActions() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUserState | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function loadUser() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      setUser({
        email: currentUser?.email ?? null,
        name: (currentUser?.user_metadata?.full_name as string) ?? null,
      });
      setIsReady(true);
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (!isMounted) {
          return;
        }

        setUser({
          email: session?.user?.email ?? null,
          name: (session?.user?.user_metadata?.full_name as string) ?? null,
        });
        setIsReady(true);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (!isReady) {
    return <div className="h-10 w-36 rounded-lg bg-white/5" />;
  }

  if (!user?.email) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Daftar
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200 sm:block">
        <span className="font-medium text-white">{user.name || user.email?.split('@')[0]}</span>
      </div>
      <button
        type="button"
        onClick={() => {
          void handleSignOut();
        }}
        className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-white/5 hover:text-white"
      >
        Keluar
      </button>
    </div>
  );
}
