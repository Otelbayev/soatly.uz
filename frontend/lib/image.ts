// Backend nisbiy URL'larini to'liq URL'ga aylantiradi.
// Backend `/uploads/products/x.png` qaytaradi — Next/Image to'liq URL talab qiladi.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
// /api dan oldingi qism — masalan http://localhost:5000
const ORIGIN = API_URL.replace(/\/api\/?$/, '');

export const resolveImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return `${ORIGIN}${url}`;
  return url;
};

export const API_ORIGIN = ORIGIN;
