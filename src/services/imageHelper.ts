/**
 * Compresses an image file to reduce storage in IndexedDB
 */
export const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const maxW = 360;
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error('Canvas context not available'));
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
};

const COLOR_PALETTES = [
  ['#4338ca', '#312e81', '#6366f1'], // Indigo
  ['#047857', '#064e3b', '#10b981'], // Emerald
  ['#b91c1c', '#7f1d1d', '#ef4444'], // Ruby / Red
  ['#c2410c', '#7c2d12', '#f97316'], // Amber / Orange
  ['#6d28d9', '#4c1d95', '#8b5cf6'], // Purple
  ['#0e7490', '#164e63', '#06b6d4'], // Cyan / Teal
  ['#be185d', '#831843', '#ec4899'], // Rose
  ['#374151', '#111827', '#4b5563'], // Slate / Charcoal
];

/**
 * Deterministically generates an artistic SVG / Canvas book cover
 */
export const generateArtisticCover = (title: string, category: string): string => {
  // Deterministic palette index based on title characters
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
    hash |= 0;
  }
  const palette = COLOR_PALETTES[Math.abs(hash) % COLOR_PALETTES.length];

  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 460;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background Gradient
  const grad = ctx.createLinearGradient(0, 0, 320, 460);
  grad.addColorStop(0, palette[0]);
  grad.addColorStop(1, palette[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 320, 460);

  // Left spine shadow & highlight
  const spineGrad = ctx.createLinearGradient(0, 0, 28, 0);
  spineGrad.addColorStop(0, 'rgba(0,0,0,0.4)');
  spineGrad.addColorStop(0.7, 'rgba(255,255,255,0.15)');
  spineGrad.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = spineGrad;
  ctx.fillRect(0, 0, 24, 460);

  // Decorative border
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(36, 20, 264, 420);
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.strokeRect(42, 26, 252, 408);

  // Decorative Header Ribbon / Badge
  ctx.fillStyle = palette[2];
  ctx.beginPath();
  ctx.roundRect(50, 40, 220, 28, 6);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px "Hind Siliguri", "Noto Sans Bengali", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText((category || 'সাধারণ বই').toUpperCase(), 160, 58);

  // Decorative Central Circle / Emblem
  ctx.beginPath();
  ctx.arc(160, 160, 42, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Book emblem icon inside circle
  ctx.fillStyle = '#ffffff';
  ctx.font = '32px sans-serif';
  ctx.fillText('📖', 160, 172);

  // Book Title text (wrapping 2-4 lines)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "Hind Siliguri", "Noto Sans Bengali", sans-serif';
  ctx.textAlign = 'center';

  const words = title.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    if (ctx.measureText(testLine).width > 220 && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length >= 3) break;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine && lines.length < 4) {
    lines.push(currentLine);
  }

  const startY = 250;
  lines.forEach((line, idx) => {
    ctx.fillText(line, 160, startY + idx * 28);
  });

  // Bottom footer tag
  ctx.font = '11px "Hind Siliguri", "Noto Sans Bengali", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.fillText('ডিজিটাল বাংলা লাইব্রেরি', 160, 415);

  return canvas.toDataURL('image/png');
};

/**
 * Format bytes into human readable KB / MB
 */
export const formatFileSize = (bytes: number): string => {
  if (!bytes || isNaN(bytes)) return '0 KB';
  if (bytes > 1048576) {
    return (bytes / 1048576).toFixed(1) + ' MB';
  }
  return Math.round(bytes / 1024) + ' KB';
};
