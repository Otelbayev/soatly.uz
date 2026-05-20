import { MetadataRoute } from 'next';

const BASE = 'https://soatly.uz';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/products', '/products/', '/categories', '/categories/', '/brands', '/brands/'],
        // Admin va dublikat URL'larni indekslashni cheklaymiz.
        // `/products?category=...` va `/products?brand=...` — bu kanonik bo'lmagan dublikatlar,
        // chunki ularning kanonik versiyalari `/categories/[slug]` va `/brands/[slug]`.
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
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
