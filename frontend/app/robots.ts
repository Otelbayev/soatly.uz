import { MetadataRoute } from 'next';

const BASE = 'https://soatly.uz';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Asosiy qoidalar — barcha botlar uchun
      {
        userAgent: '*',
        allow: [
          '/',
          '/products',
          '/products/',
          '/categories',
          '/categories/',
          '/brands',
          '/brands/',
        ],
        // Admin, API va kanonik bo'lmagan dublikat URL'lar
        // (`/products?category=...` → kanoniki `/categories/[slug]`,
        //  `/products?brand=...`    → kanoniki `/brands/[slug]`)
        disallow: [
          '/admin',
          '/admin/',
          '/api',
          '/api/',
          '/cart',
          '/checkout',
          '/*?category=',
          '/*?brand=',
          '/*?search=',
          '/*?sort=',
          '/*?page=',
          '/*?min_price=',
          '/*?max_price=',
        ],
      },
      // Googlebot — to'liq ruxsat (asosiy maqsad: indexing)
      {
        userAgent: 'Googlebot',
        allow: ['/', '/products', '/categories', '/brands'],
        disallow: ['/admin', '/api', '/cart', '/checkout'],
      },
      // Yandex — Rossiya bozori uchun muhim
      {
        userAgent: 'Yandex',
        allow: ['/', '/products', '/categories', '/brands'],
        disallow: ['/admin', '/api', '/cart', '/checkout'],
      },
      // Bing
      {
        userAgent: 'Bingbot',
        allow: ['/', '/products', '/categories', '/brands'],
        disallow: ['/admin', '/api', '/cart', '/checkout'],
      },
      // AI/LLM kraulerlar — kontent tahlilini cheklash (ixtiyoriy)
      { userAgent: 'GPTBot',         disallow: '/' },
      { userAgent: 'CCBot',          disallow: '/' },
      { userAgent: 'anthropic-ai',   disallow: '/' },
      { userAgent: 'ClaudeBot',      disallow: '/' },
      { userAgent: 'Google-Extended', disallow: '/' },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
