'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Category, pick } from '@/lib/types';
import { useLang } from '@/context/LanguageContext';
import { balancedColumns } from '@/lib/grid';
import { CSSProperties } from 'react';

export default function CategorySection({ categories }: { categories: Category[] }) {
  const { t, locale } = useLang();

  if (!categories.length) return null;

  const cols = balancedColumns(categories.length);

  return (
    <section className="bg-bg-surface border-y border-border py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12" data-gsap="fade-up">
          <p className="text-gold text-xs font-bold uppercase tracking-[0.2em] mb-2">{t.categories.subtitle}</p>
          <h2 className="section-title text-text">{t.categories.title}</h2>
        </div>

        <div
          className="tile-grid"
          data-gsap="stagger"
          style={{ '--tile-cols': cols } as CSSProperties}
        >
          {categories.map((cat) => {
            const name = pick(cat, 'name', locale);
            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-border hover:border-gold transition-all duration-300"
                style={{ background: 'var(--bg-surface2)' }}
              >
                {cat.icon ? (
                  <Image
                    src={cat.icon}
                    alt={name}
                    fill
                    sizes="(min-width: 1024px) 200px, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl opacity-50">📁</span>
                  </div>
                )}

                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)' }}
                />

                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-white font-heading font-semibold text-base sm:text-lg line-clamp-2 drop-shadow-md">
                    {name}
                  </p>
                </div>

                <div
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(201,168,76,0.15) 0%, transparent 60%)',
                    boxShadow: 'inset 0 0 0 1px var(--gold)',
                    borderRadius: 'inherit',
                  }}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
