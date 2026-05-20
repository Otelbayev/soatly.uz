import type { Metadata } from 'next';

const BASE_URL = 'https://soatly.uz';
const TITLE = "Soatlar kolleksiyasi — Rolex, Omega, Patek Philippe";
const DESC = "Dunyoning eng mashhur brendlaridan lyuks qo'l soatlari to'plami — " +
  "Rolex, Omega, Patek Philippe va yana 10+ brend. SOATLY.uz da asl mahsulot, kafolat va tezkor yetkazib berish.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ['soat', 'qo\'l soati', 'lyuks soat', 'Rolex narxi', 'Omega narxi', 'soatly.uz', 'luxury watches Uzbekistan'],
  alternates: { canonical: `${BASE_URL}/products` },
  openGraph: {
    title: `${TITLE} · SOATLY`,
    description: DESC,
    url: `${BASE_URL}/products`,
    siteName: 'SOATLY',
    type: 'website',
    locale: 'uz_UZ',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SOATLY — Luxury Watch Store' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} · SOATLY`,
    description: DESC,
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
