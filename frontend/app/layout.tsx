import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { AuthProvider } from '@/context/AuthContext';
import SiteShell from '@/components/SiteShell';
import { JsonLd } from '@/components/JsonLd';

const BASE_URL = 'https://soatly.uz';
const SITE_NAME = 'SOATLY';
const TITLE = "SOATLY — Original lyuks qo'l soatlari · Rolex, Omega, Patek Philippe";
const DESC =
  "O'zbekistondagi №1 lyuks soat do'koni. Rolex, Omega, Patek Philippe, " +
  "Audemars Piguet va 20+ premium brend. 100% original, sertifikat va " +
  "kafolat bilan. Toshkent bo'ylab 1–2 soatda, viloyatlarga 1–3 kunda yetkazib berish.";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: { default: TITLE, template: `%s · ${SITE_NAME}` },
  description: DESC,
  applicationName: SITE_NAME,
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  category: 'shopping',
  classification: 'Luxury Watches E-Commerce',
  keywords: [
    // Uzbek (Latin)
    "soat", "qo'l soati", "lyuks soat", "original soat", "soat sotib olish",
    "soat narxi", "Toshkent soat", "asl soat", "shveytsariya soati",
    // Russian (Cyrillic)
    "часы", "наручные часы", "купить часы", "люкс часы", "оригинальные часы",
    "швейцарские часы", "часы Ташкент", "часы Узбекистан",
    // Brands
    "Rolex", "Omega", "Patek Philippe", "Audemars Piguet", "Cartier",
    "Tag Heuer", "Hublot", "Breitling", "IWC", "Tudor",
    // Brand + Brand + locale
    "Rolex Toshkent", "Omega Uzbekistan", "купить Rolex Ташкент",
    // Site
    "soatly", "soatly.uz", "SOATLY",
  ],
  authors: [{ name: SITE_NAME, url: BASE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      'uz-UZ': BASE_URL,
      'ru-RU': BASE_URL,
      'x-default': BASE_URL,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    alternateLocale: ['ru_RU'],
    url: BASE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESC,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: "SOATLY — O'zbekistondagi original lyuks soatlar do'koni",
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@soatly_uz',
    creator: '@soatly_uz',
    title: TITLE,
    description: DESC,
    images: [{ url: '/og-image.jpg', alt: 'SOATLY — Luxury Watches' }],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.jpg', type: 'image/jpeg' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/logo.jpg', sizes: '180x180', type: 'image/jpeg' }],
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: 'default',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'ouUtipTAK_ZKnf2WpKf_j0zyMlCG0qXxsOPxozyXnx4',
  },
  other: {
    'geo.region': 'UZ-TK',
    'geo.placename': 'Tashkent',
    'geo.position': '41.311081;69.240562',
    'ICBM': '41.311081, 69.240562',
    'theme-color': '#C9A84C',
  },
};

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'OnlineStore'],
  '@id': `${BASE_URL}/#organization`,
  name: SITE_NAME,
  legalName: 'SOATLY',
  alternateName: ['soatly.uz', 'Soatly Uzbekistan'],
  url: BASE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${BASE_URL}/logo.jpg`,
    width: 512,
    height: 512,
  },
  image: `${BASE_URL}/og-image.jpg`,
  description: DESC,
  foundingDate: '2020',
  areaServed: {
    '@type': 'Country',
    name: 'Uzbekistan',
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'UZ',
    addressLocality: 'Tashkent',
    addressRegion: 'Toshkent shahri',
  },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['uz', 'ru', 'en'],
      areaServed: 'UZ',
    },
  ],
  sameAs: ['https://www.instagram.com/soatly.uz/'],
  paymentAccepted: ['Cash', 'Credit Card', 'Payme', 'Click'],
  priceRange: '$$$$',
};

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  name: SITE_NAME,
  url: BASE_URL,
  description: DESC,
  publisher: { '@id': `${BASE_URL}/#organization` },
  inLanguage: ['uz-UZ', 'ru-RU'],
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/products?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* Anti-flicker: set theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('soatly_theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`,
          }}
        />
        <JsonLd data={organizationLd} />
        <JsonLd data={websiteLd} />
      </head>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <AuthProvider>
                <CartProvider>
                  <SiteShell>{children}</SiteShell>
                </CartProvider>
              </AuthProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
