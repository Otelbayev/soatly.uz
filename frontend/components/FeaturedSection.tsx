'use client';
import { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

export default function FeaturedSection({ products }: { products: Product[] }) {
  const { t } = useLang();

  if (!products.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12" data-gsap="fade-up">
        <div>
          <p className="text-gold text-xs font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
            <span className="w-5 h-px bg-gold-gradient inline-block" />
            {t.featured.eyebrow}
          </p>
          <h2 className="section-title text-text">{t.featured.title}</h2>
        </div>
        <Link
          href="/products?featured=true"
          className="text-gold-light text-sm font-medium flex items-center gap-2 hover:gap-3 transition-all duration-200 group"
        >
          {t.featured.viewAll} <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-gsap="stagger">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
