'use client';

import { useMemo, useState } from 'react';
import { formatFileSize } from '@/lib/utils';

const maxFileSizeLabel = 'Maks. 5MB';

const steps = [
  { icon: 'bi bi-envelope-fill', label: 'Masukkan email tujuan' },
  { icon: 'bi bi-file-earmark-arrow-up-fill', label: 'Upload file CV kamu' },
  { icon: 'bi bi-send-fill', label: 'Kirim ke pipeline AI' },
];

export default function CvScreeningForm() {
  const [email, setEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedFileMeta = useMemo(() => {
    if (!file) return null;
    return { name: file.name, size: formatFileSize(file.size) };
  }, [file]);

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0] ?? null;
    if (dropped) setFile(dropped);
  };

  const handleSubmit = async () => {
    if (!email.trim() || !file || isSubmitting) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('email', email.trim());
      formData.append('cv', file, file.name);

      const response = await fetch('/api/cv-screening', {
        method: 'POST',
        body: formData,
      });

      const result = (await response.json()) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengirim CV ke screening.');
      }

      setSuccess(
        result.message ||
          'CV berhasil dikirim ke pipeline AI! Cek riwayat di Dashboard kamu.'
      );
      setFile(null);
      setEmail('');
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Terjadi kesalahan saat mengirim CV.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReady = email.trim() && file && !isSubmitting;

  return (
    <div className="flex flex-col items-center w-full">

      {/* Page Header */}
      <div className="text-center mb-12 animate-fadeIn">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-purple-300 mb-5">
          <i className="bi bi-stars" />
          CV Screening
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
          Screening CV{' '}
          <span className="gradient-text">Otomatis</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
          Upload CV kamu dan biarkan AI menganalisis kualifikasi, kelebihan, dan rekomendasi role yang paling sesuai.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center gap-0 mb-12 w-full max-w-lg">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm mb-2 transition-all ${
                i === 0 && email.trim() ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' :
                i === 1 && file ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' :
                i === 2 && success ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' :
                'bg-white/5 border border-white/10 text-gray-500'
              }`}>
                <i className={success && i === 2 ? 'bi bi-check-lg' : step.icon} />
              </div>
              <p className="text-xs text-gray-500 text-center leading-tight hidden sm:block">{step.label}</p>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px flex-1 mx-2 mb-5 transition-all ${
                (i === 0 && email.trim()) || (i === 1 && file) ? 'bg-purple-500/50' : 'bg-white/10'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Main Form Card */}
      <div className="w-full max-w-lg glass-card rounded-3xl p-8 animate-fadeIn">

        {/* Success State */}
        {success ? (
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <i className="bi bi-check-circle-fill text-4xl text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">CV Terkirim!</h2>
            <p className="text-gray-400 leading-relaxed mb-8">{success}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/dashboard"
                className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90 hover:-translate-y-0.5"
              >
                <i className="bi bi-grid-fill mr-2" />
                Lihat di Dashboard
              </a>
              <button
                type="button"
                onClick={() => setSuccess('')}
                className="rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-gray-300 transition-all hover:bg-white/5"
              >
                Kirim CV Lagi
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">

            {/* Email Input */}
            <div>
              <label
                htmlFor="screening-email"
                className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-gray-300"
              >
                <i className="bi bi-envelope text-purple-400" />
                Email Penerima Laporan
              </label>
              <input
                id="screening-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@gmail.com"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder:text-gray-600 focus:border-purple-400/60 focus:bg-purple-400/5 focus:outline-none transition-all"
              />
            </div>

            {/* File Dropzone */}
            <div>
              <label className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-gray-300">
                <i className="bi bi-file-earmark-person text-purple-400" />
                File CV
              </label>
              <label
                className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all ${
                  isDragging
                    ? 'border-purple-400 bg-purple-400/10 scale-[1.01]'
                    : file
                    ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-400/60'
                    : 'border-white/10 bg-white/3 hover:border-purple-400/40 hover:bg-purple-400/5'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                {file ? (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <i className="bi bi-file-earmark-check-fill text-2xl text-emerald-400" />
                    </div>
                    <p className="font-semibold text-emerald-300 text-sm mb-1 truncate max-w-[200px]">
                      {selectedFileMeta?.name}
                    </p>
                    <p className="text-xs text-gray-500">{selectedFileMeta?.size} · Klik untuk ganti</p>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-purple-400/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <i className="bi bi-cloud-arrow-up text-2xl text-purple-300" />
                    </div>
                    <p className="font-semibold text-white mb-1">
                      {isDragging ? 'Lepaskan file di sini' : 'Drag & drop atau klik untuk upload'}
                    </p>
                    <p className="text-sm text-gray-500">PDF, DOC, DOCX · {maxFileSizeLabel}</p>
                  </>
                )}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3.5 text-sm text-red-300">
                <i className="bi bi-exclamation-triangle-fill mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              id="cv-screening-submit"
              onClick={() => { void handleSubmit(); }}
              disabled={!isReady}
              className={`relative w-full rounded-2xl py-4 text-base font-bold transition-all duration-300 overflow-hidden ${
                isReady
                  ? 'bg-gradient-to-r from-purple-500 to-primary text-white shadow-lg shadow-purple-500/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/30'
                  : 'cursor-not-allowed bg-white/5 text-gray-600'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Mengirim ke Pipeline AI...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <i className="bi bi-send-fill" />
                  Kirim untuk Screening
                </span>
              )}
            </button>

            <p className="text-center text-xs text-gray-600">
              <i className="bi bi-shield-check mr-1" />
              File CV kamu aman dan hanya digunakan untuk proses screening
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
