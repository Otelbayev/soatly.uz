import type { Metadata } from 'next';
import { api } from '@/lib/api';
import ProductDetailClient from '@/components/ProductDetailClient';
import { JsonLd } from '@/components/JsonLd';

const BASE_URL = 'https://soatly.uz';

interface Props { params: Promise<{ id: string }> }

const truncate = (s: string, n: number) =>
  s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const p = await api.getProduct(id);
    const brand = p.brand_name_uz || '';
    const category = p.categories?.[0]?.name_uz || '';
    const titleBase = brand ? `${p.name_uz} — ${brand}` : p.name_uz;
    const fallbackDesc = [
      brand && `${brand}`,
      category && `${category}`,
      `${p.price.toLocaleString('uz-UZ')} so'm`,
      "SOATLY.uz da sotib oling — O'zbekiston bo'ylab yetkazib berish.",
    ].filter(Boolean).join(' · ');
    const description = truncate(p.description_uz || fallbackDesc, 200);
    const url = `${BASE_URL}/products/${p.id}`;
    const images = (p.images || []).slice(0, 4).map((src) => ({
      url: src,
      alt: p.name_uz,
      width: 1200,
      height: 1200,
    }));

    return {
      title: titleBase,
      description,
      keywords: [
        p.name_uz, brand, category, 'soat', 'qo\'l soati', 'luxury watch',
        brand ? `${brand} narxi` : '', 'soatly.uz',
      ].filter(Boolean) as string[],
      alternates: { canonical: url },
      openGraph: {
        title: `${titleBase} | SOATLY`,
        description,
        url,
        siteName: 'SOATLY',
        type: 'website',
        locale: 'uz_UZ',
        images: images.length ? images : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${titleBase} | SOATLY`,
        description,
        images: images.length ? images.map((i) => i.url) : undefined,
      },
      other: {
        'og:type': 'product',
        'product:price:amount': String(p.price),
        'product:price:currency': 'UZS',
        'product:availability': p.stock > 0 ? 'in stock' : 'out of stock',
        'product:condition': 'new',
        ...(brand ? { 'product:brand': brand } : {}),
        ...(category ? { 'product:category': category } : {}),
      },
      robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
    };
  } catch {
    return { title: 'Soat topilmadi', robots: { index: false, follow: false } };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  let productLd: Record<string, unknown> | null = null;
  let breadcrumbLd: Record<string, unknown> | null = null;

  try {
    const p = await api.getProduct(id);
    const url = `${BASE_URL}/products/${p.id}`;
    const inStock = p.stock > 0;

    productLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name_uz,
      description: p.description_uz || p.name_uz,
      image: p.images?.length ? p.images : undefined,
      sku: String(p.id),
      mpn: String(p.id),
      ...(p.brand_name_uz ? { brand: { '@type': 'Brand', name: p.brand_name_uz } } : {}),
      ...(p.categories?.[0]?.name_uz ? { category: p.categories[0].name_uz } : {}),
      offers: {
        '@type': 'Offer',
        price: p.price,
        priceCurrency: 'UZS',
        availability: inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        url,
        priceValidUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90)
          .toISOString().slice(0, 10),
        seller: { '@type': 'Organization', name: 'SOATLY', url: BASE_URL },
      },
    };

    const crumbs: { name: string; item: string }[] = [
      { name: 'Bosh sahifa', item: BASE_URL },
      { name: 'Soatlar', item: `${BASE_URL}/products` },
    ];
    if (p.brand_slug && p.brand_name_uz) {
      crumbs.push({ name: p.brand_name_uz, item: `${BASE_URL}/brands/${p.brand_slug}` });
    } else if (p.categories?.[0]) {
      crumbs.push({
        name: p.categories[0].name_uz,
        item: `${BASE_URL}/categories/${p.categories[0].slug}`,
      });
    }
    crumbs.push({ name: p.name_uz, item: url });

    breadcrumbLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: c.item,
      })),
    };
  } catch {
    // client component handles 404 state
  }

  return (
    <>
      {productLd && <JsonLd data={productLd} />}
      {breadcrumbLd && <JsonLd data={breadcrumbLd} />}
      <ProductDetailClient id={id} />
    </>
  );
}
