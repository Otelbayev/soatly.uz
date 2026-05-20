import { MetadataRoute } from 'next';
import { api } from '@/lib/api';

const BASE = 'https://soatly.uz';

// Sitemap'ni har soatda yangilash (Google Search Console uchun optimal)
export const revalidate = 3600;

const toAbsolute = (src: string): string =>
  src.startsWith('http') ? src : `${BASE}${src.startsWith('/') ? '' : '/'}${src}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productsResult, categoriesResult, brandsResult] = await Promise.allSettled([
    api.getProducts({ limit: 1000 }),
    api.getCategories(),
    api.getBrands(),
  ]);

  const products   = productsResult.status   === 'fulfilled' ? productsResult.value.products : [];
  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
  const brands     = brandsResult.status     === 'fulfilled' ? brandsResult.value : [];

  const now = new Date();

  // Statik sahifalar — robots.txt'da allow qilingan barcha kanonik route'lar
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: { languages: { 'uz-UZ': BASE, 'ru-RU': BASE, 'x-default': BASE } },
    },
    {
      url: `${BASE}/products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: { languages: { 'uz-UZ': `${BASE}/products`, 'ru-RU': `${BASE}/products` } },
    },
    {
      url: `${BASE}/categories`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: { 'uz-UZ': `${BASE}/categories`, 'ru-RU': `${BASE}/categories` } },
    },
    {
      url: `${BASE}/brands`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: { 'uz-UZ': `${BASE}/brands`, 'ru-RU': `${BASE}/brands` } },
    },
  ];

  // Mahsulotlar — yangilari yuqori prioritet
  const productRoutes: MetadataRoute.Sitemap = products.map((p) => {
    const created = p.created_at ? new Date(p.created_at) : now;
    const ageDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return {
      url: `${BASE}/products/${p.id}`,
      lastModified: created,
      changeFrequency: ageDays < 30 ? 'daily' : 'weekly',
      priority: ageDays < 30 ? 0.9 : 0.7,
      images: p.images?.length ? p.images.slice(0, 6).map(toAbsolute) : undefined,
    };
  });

  // Kategoriya sahifalari
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE}/categories/${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
    images: c.icon ? [toAbsolute(c.icon)] : undefined,
  }));

  // Brend sahifalari (Rolex, Omega, Patek Philippe va h.k. — ranking uchun muhim)
  const brandRoutes: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${BASE}/brands/${b.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
    images: b.icon ? [toAbsolute(b.icon)] : undefined,
  }));

  return [...staticRoutes, ...categoryRoutes, ...brandRoutes, ...productRoutes];
}
