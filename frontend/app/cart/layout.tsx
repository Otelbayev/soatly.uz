import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Savatcha',
  description: "SOATLY savatchasi — tanlangan soatlarni ko'rib chiqing va buyurtmani rasmiylashtiring.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
