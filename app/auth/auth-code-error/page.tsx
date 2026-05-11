import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
        <div className="mb-4 text-5xl text-red-400">
          <i className="bi bi-exclamation-triangle" />
        </div>
        <h1 className="text-2xl font-bold text-white">
          Login gagal diproses
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-400">
          Callback autentikasi tidak berhasil dipertukarkan menjadi session.
          Coba login lagi, lalu pastikan redirect URL provider sudah benar di
          dashboard Supabase.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="flex-1 rounded-xl bg-primary px-4 py-3 font-semibold text-white"
          >
            Kembali ke Login
          </Link>
          <Link
            href="/"
            className="flex-1 rounded-xl border border-white/10 px-4 py-3 font-semibold text-gray-300"
          >
            Ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
