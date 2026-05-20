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
const TITLE    = 'SOATLY — Luxury Watch Store';
const DESC     = 'Dunyoning eng yaxshi soatlari. Rolex, Omega, Patek Philippe va yana 10+ premium brend — haqiqiy lyuks soatlar soatly.uz da. Uzbekiston bo\'ylab tez yetkazib berish.';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: { default: TITLE, template: '%s | SOATLY' },
  description: DESC,
  keywords: [
    'soatly', 'soatly.uz', 'luxury watches', 'Rolex', 'Omega', 'Patek Philippe',
    'Audemars Piguet', 'Swiss watches', 'soat', 'qo\'l soati', 'lyuks soat',
    'Uzbekistan watches', 'premium timepieces',
  ],
  authors: [{ name: 'SOATLY', url: BASE_URL }],
  creator: 'SOATLY',
  publisher: 'SOATLY',
  alternates: {
    canonical: BASE_URL,
    languages: {
      'ru': `${BASE_URL}`,
      'uz': `${BASE_URL}`,
      'en': `${BASE_URL}`,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    alternateLocale: ['uz_UZ', 'en_US'],
    url: BASE_URL,
    siteName: 'SOATLY',
    title: TITLE,
    description: DESC,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SOATLY — Luxury Watch Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
    images: ['/og-image.jpg'],
    creator: '@soatly_uz',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/logo.jpg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  verification: {
    google: 'google-site-verification-placeholder',
  },
};

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'SOATLY',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.jpg`,
  description: DESC,
  foundingDate: '2020',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['Russian', 'Uzbek', 'English'],
  },
  sameAs: ['https://www.instagram.com/soatly.uz/'],
};

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'SOATLY',
  url: BASE_URL,
  inLanguage: ['ru', 'uz', 'en'],
  potentialAction: {
    '@type': 'SearchAction',
    target: `${BASE_URL}/products?search={search_term_string}`,
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
            __html: `(function(){try{var t=localStorage.getItem('soatly_theme');if(!t)t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`,
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
