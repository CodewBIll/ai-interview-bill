import SetupForm from '@/components/SetupForm';
import Link from 'next/link';

export default function InterviewSetupPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">

          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center overflow-hidden">
            <img
              src="/logo.png"
              alt="logo"
              className="w-full h-full object-contain filter invert brightness-150 opacity-70"
            />
          </div>
          <span className="text-white font-semibold text-lg">
            Boach AI
          </span>
        </Link>
      </nav>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center mb-10">
          <img src="/logo.png" alt="Logo" className="w-20 h-20 filter invert brightness-150" />
          <p className="text-gray-400 text-lg">
            Isi detail di bawah untuk memulai sesi mock interview
          </p>
        </div>

        <SetupForm />
      </div>
    </main>
  );
}
