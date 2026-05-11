import SetupForm from '@/components/SetupForm';
import Link from 'next/link';
import AuthActions from '@/components/AuthActions';

export default function InterviewSetupPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation */}
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

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Setup Interview
          </h1>
          <p className="text-gray-400 text-lg">
            Isi detail di bawah untuk memulai sesi mock interview
          </p>
        </div>

        <SetupForm />
      </div>
    </main>
  );
}
