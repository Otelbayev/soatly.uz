import { MetadataRoute } from 'next';
import { api } from '@/lib/api';

const BASE = 'https://soatly.uz';

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

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/products`,  lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/categories`,lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/brands`,    lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/cart`,      lastModified: now, changeFrequency: 'monthly', priority: 0.2 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE}/products/${p.id}`,
    lastModified: p.created_at ? new Date(p.created_at) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
    images: p.images?.length ? p.images.slice(0, 6) : undefined,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE}/categories/${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.6,
    images: c.icon ? [c.icon] : undefined,
  }));

  const brandRoutes: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${BASE}/brands/${b.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.6,
    images: b.icon ? [b.icon] : undefined,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...brandRoutes];
}
