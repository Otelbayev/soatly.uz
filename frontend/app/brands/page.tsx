import type { Metadata } from 'next';
import { api } from '@/lib/api';
import BrandSection from '@/components/BrandSection';
import { JsonLd } from '@/components/JsonLd';

const BASE_URL = 'https://soatly.uz';
const TITLE = 'Soat brendlari — Rolex, Omega, Patek Philippe va boshqalar';
const DESC = "Dunyoning eng yaxshi soat brendlari — Rolex, Omega, Patek Philippe, " +
  "Audemars Piguet va boshqalar. SOATLY.uz da asl mahsulot, kafolat bilan.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ['Rolex', 'Omega', 'Patek Philippe', 'Audemars Piguet', 'soat brendlari', 'lyuks soat brendlari', 'soatly.uz'],
  alternates: { canonical: `${BASE_URL}/brands` },
  openGraph: {
    title: `${TITLE} · SOATLY`,
    description: DESC,
    url: `${BASE_URL}/brands`,
    siteName: 'SOATLY',
    type: 'website',
    locale: 'uz_UZ',
  },
  twitter: { card: 'summary_large_image', title: `${TITLE} · SOATLY`, description: DESC },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
};

export const dynamic = 'force-dynamic';

export default async function BrandsPage() {
  const brands = await api.getBrands().catch(() => []);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Bosh sahifa', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Brendlar', item: `${BASE_URL}/brands` },
    ],
  };

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Soat brendlari',
    numberOfItems: brands.length,
    itemListElement: brands.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${BASE_URL}/brands/${b.slug}`,
      name: b.name_uz,
      image: b.icon || undefined,
    })),
  };

  return (
    <div className="min-h-screen pt-24">
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={itemListLd} />
      <BrandSection brands={brands} />
    </div>
  );
}
