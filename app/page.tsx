import Link from 'next/link';

const features = [
  {
    icon: 'bi bi-robot',
    title: 'AI Interviewer Profesional',
    description:
      'Didukung oleh AI, interviewer yang memahami konteks teknis dan memberikan pertanyaan relevan sesuai role dan level kamu.',
  },
  {
    icon: 'bi bi-bar-chart',
    title: 'Feedback Real-time',
    description:
      'Dapatkan skor dan feedback detail untuk setiap jawaban — teknis, kejelasan, dan relevansi. Perbaiki di setiap pertanyaan.',
  },
  {
    icon: 'bi bi-graph-up',
    title: 'Tracking Progress',
    description:
      'Lihat riwayat semua sesi interview, bandingkan skor, dan pantau perkembangan kemampuan interview kamu dari waktu ke waktu.',
  },
];

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Navigation */}
      <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-sm font-bold">
            AI
          </div>
          <span className="text-white font-semibold text-lg">
            Interview Coach
          </span>
        </div>

        <Link
          href="/dashboard"
          className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
        >
          Dashboard →
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Latih Interview{' '}
            <span className="gradient-text">Teknis Kamu</span>
            <br />
            dengan AI Coach
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Simulasi interview realistis dengan AI interviewer profesional.
            Dapatkan feedback instant untuk setiap jawaban.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/interview"
              className="px-8 py-4 bg-gradient-to-r from-primary to-purple-500 text-white font-bold text-lg rounded-xl"
            >
              Mulai Interview
            </Link>

            <Link
              href="/dashboard"
              className="px-8 py-4 bg-white/5 border border-white/10 text-gray-300 font-semibold text-lg rounded-xl"
            >
              Lihat Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="glass-card rounded-2xl p-6 hover:bg-white/5 transition-all duration-300 group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <i className={`${feature.icon}`}></i>
              </div>

              <h3 className="text-white font-semibold text-lg mb-2">
                {feature.title}
              </h3>

              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}