import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { JsonLd } from '@/components/JsonLd';
import ProductCard from '@/components/ProductCard';
import { ChevronRight } from 'lucide-react';

const BASE_URL = 'https://soatly.uz';

interface Props { params: Promise<{ slug: string }> }

const truncate = (s: string, n: number) =>
  s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const b = await api.getBrandBySlug(slug);
    const title = `${b.name_uz} soatlari — Asl mahsulot`;
    const description = truncate(
      b.description_uz ||
        `${b.name_uz} qo'l soatlari — SOATLY.uz da. Sertifikatlangan asl mahsulot, ` +
          "kafolat va O'zbekiston bo'ylab tezkor yetkazib berish.",
      200,
    );
    const url = `${BASE_URL}/brands/${slug}`;
    const images = b.icon
      ? [{ url: b.icon, alt: b.name_uz, width: 1200, height: 1200 }]
      : undefined;
    return {
      title,
      description,
      keywords: [b.name_uz, `${b.name_uz} soat`, `${b.name_uz} narxi`, 'soat', 'qo\'l soati', 'soatly.uz', 'luxury watches'],
      alternates: { canonical: url },
      openGraph: {
        title: `${title} · SOATLY`,
        description,
        url,
        siteName: 'SOATLY',
        type: 'website',
        locale: 'uz_UZ',
        images,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} · SOATLY`,
        description,
        images: b.icon ? [b.icon] : undefined,
      },
      robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
    };
  } catch {
    return { title: 'Brend topilmadi', robots: { index: false, follow: false } };
  }
}

export const dynamic = 'force-dynamic';

export default async function BrandSlugPage({ params }: Props) {
  const { slug } = await params;
  const brand = await api.getBrandBySlug(slug).catch(() => null);

  if (!brand) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text)' }}>Brend topilmadi</h1>
        <Link href="/brands" className="gold-btn">Brendlar</Link>
      </div>
    );
  }

  const productsData = await api
    .getProducts({ brand: slug, limit: 24 })
    .catch(() => ({ products: [], total: 0, page: 1, pages: 1, limit: 24 }));
  const products = productsData.products;
  const url = `${BASE_URL}/brands/${slug}`;

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Bosh sahifa', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Brendlar', item: `${BASE_URL}/brands` },
      { '@type': 'ListItem', position: 3, name: brand.name_uz, item: url },
    ],
  };

  const brandLd = {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: brand.name_uz,
    description: brand.description_uz || `${brand.name_uz} qo'l soatlari`,
    logo: brand.icon || undefined,
    url,
  };

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${brand.name_uz} soatlari`,
    description: brand.description_uz || `${brand.name_uz} brendining qo'l soatlari`,
    url,
    image: brand.icon || undefined,
    about: { '@type': 'Brand', name: brand.name_uz, logo: brand.icon || undefined },
    isPartOf: { '@type': 'WebSite', name: 'SOATLY', url: BASE_URL },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: productsData.total,
      itemListElement: products.slice(0, 20).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${BASE_URL}/products/${p.id}`,
        name: p.name_uz,
        image: p.images?.[0],
      })),
    },
  };

  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={brandLd} />
      <JsonLd data={collectionLd} />

      <div className="min-h-screen pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
            <Link href="/" className="hover:text-gold-light transition-colors">Bosh sahifa</Link>
            <ChevronRight size={12} style={{ color: 'var(--border)' }} />
            <Link href="/brands" className="hover:text-gold-light transition-colors">Brendlar</Link>
            <ChevronRight size={12} style={{ color: 'var(--border)' }} />
            <span style={{ color: 'var(--text)' }}>{brand.name_uz}</span>
          </nav>

          <header className="flex items-center gap-5 mb-10">
            {brand.icon && (
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0"
                style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border-gold)' }}>
                <Image src={brand.icon} alt={brand.name_uz} fill className="object-cover" sizes="96px" priority />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--gold)' }}>
                Brend
              </p>
              <h1 className="section-title mb-2" style={{ color: 'var(--text)' }}>{brand.name_uz}</h1>
              {brand.description_uz && (
                <p className="text-sm sm:text-base leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
                  {brand.description_uz}
                </p>
              )}
              <p className="text-xs mt-2" style={{ color: 'var(--text-subtle)' }}>
                {productsData.total} ta mahsulot
              </p>
            </div>
          </header>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-base mb-4" style={{ color: 'var(--text-muted)' }}>
                Hozircha ushbu brend mahsulotlari yo&apos;q
              </p>
              <Link href="/products" className="gold-btn">Boshqa soatlarni ko&apos;ring</Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              {productsData.total > products.length && (
                <div className="text-center mt-10">
                  <Link href={`/products?brand=${slug}`} className="outline-btn">
                    Hamma {productsData.total} ta mahsulotni ko&apos;rsatish
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
