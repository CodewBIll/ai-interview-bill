import Link from 'next/link';

import AuthActions from '@/components/AuthActions';
import CvScreeningForm from '@/components/CvScreeningForm';

export default function CvScreeningPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="logo"
            className="h-8 w-auto object-contain brightness-150"
          />
          <span className="text-white font-semibold text-lg">
            Interva AI
          </span>
        </Link>
        <AuthActions />
      </nav>

      <div className="flex-1 px-6 py-12">
        <div className="mx-auto w-full max-w-6xl">
          <CvScreeningForm />
        </div>
      </div>
    </main>
  );
}
