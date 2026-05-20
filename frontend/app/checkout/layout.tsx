import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buyurtma rasmiylashtirish',
  description: "SOATLY — buyurtmani rasmiylashtirish sahifasi.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
