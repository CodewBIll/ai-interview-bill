export function formatFileSize(size: number): string {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(size / 1024)} KB`;
}

export function scoreColor(score: number | null): string {
  if (!score) return 'text-gray-500';
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
}

export function statusBadge(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20';
    case 'failed':
      return 'bg-red-400/10 text-red-400 border-red-400/20';
    case 'processing':
      return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
    case 'submitted':
    case 'pending':
    default:
      return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
  }
}

export function statusLabel(status: string): string {
  switch (status) {
    case 'completed':
      return 'Selesai';
    case 'failed':
      return 'Gagal';
    case 'processing':
      return 'Diproses';
    case 'submitted':
      return 'Terkirim';
    case 'pending':
      return 'Menunggu';
    default:
      return 'Berlangsung';
  }
}
