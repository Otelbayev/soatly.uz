import type { Metadata } from 'next';
import { api } from '@/lib/api';
import CategorySection from '@/components/CategorySection';
import { JsonLd } from '@/components/JsonLd';

const BASE_URL = 'https://soatly.uz';
const TITLE = 'Soat kategoriyalari — Sport, Klassik, Lyuks';
const DESC = "Sport, klassik, lyuks, biznes va kunlik qo'l soatlari kategoriyalari. " +
  "SOATLY.uz da har bir kategoriya bo'yicha eng yaxshi modellarni tanlang.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ['soat kategoriyalari', 'sport soat', 'klassik soat', 'lyuks soat', 'biznes soat', 'soatly.uz'],
  alternates: { canonical: `${BASE_URL}/categories` },
  openGraph: {
    title: `${TITLE} · SOATLY`,
    description: DESC,
    url: `${BASE_URL}/categories`,
    siteName: 'SOATLY',
    type: 'website',
    locale: 'uz_UZ',
  },
  twitter: { card: 'summary_large_image', title: `${TITLE} · SOATLY`, description: DESC },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
};

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await api.getCategories().catch(() => []);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Bosh sahifa', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Kategoriyalar', item: `${BASE_URL}/categories` },
    ],
  };

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Soat kategoriyalari',
    numberOfItems: categories.length,
    itemListElement: categories.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${BASE_URL}/categories/${c.slug}`,
      name: c.name_uz,
      image: c.icon || undefined,
    })),
  };

  return (
    <div className="min-h-screen pt-24">
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={itemListLd} />
      <CategorySection categories={categories} />
    </div>
  );
}
