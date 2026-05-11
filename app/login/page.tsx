import Link from 'next/link';

import AuthForm from '@/components/AuthForm';

function getSafeNext(next: string | string[] | undefined) {
  if (typeof next === 'string' && next.startsWith('/')) {
    return next;
  }

  return '/dashboard';
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen px-6 py-10">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between border-b border-white/5 pb-4">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="logo"
            className="h-8 w-auto object-contain brightness-150"
          />
          <span className="text-lg font-semibold text-white">Interva AI</span>
        </Link>
      </nav>

      <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-6xl items-center justify-center">
        <AuthForm mode="login" nextPath={getSafeNext(params.next)} />
      </div>
    </main>
  );
}
