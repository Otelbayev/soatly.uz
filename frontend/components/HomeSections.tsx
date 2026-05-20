'use client';
import Link from 'next/link';
import { Star, ArrowRight, Quote } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

const TESTIMONIALS = [
  {
    name: 'Jasur T.',
    location: 'Toshkent',
    watch: 'Rolex Daytona',
    text: "Soatni olib, juda mamnun qoldim. Asl nusxa, qadoqlash a'lo darajada. Yana buyurtma beraman!",
    rating: 5,
  },
  {
    name: 'Dilnoza K.',
    location: 'Samarqand',
    watch: 'Omega Seamaster',
    text: "Erimga tug'ilgan kun sovg'asi sifatida oldim. U juda xursand bo'ldi. Yetkazib berish 1 kunda bo'ldi.",
    rating: 5,
  },
  {
    name: 'Bobur M.',
    location: 'Buxoro',
    watch: 'Casio G-Shock',
    text: "Narxi adolatli, sifati yuqori. Soatly.uz ga ishonsa bo'ladi. Do'stlarimga ham tavsiya qildim!",
    rating: 5,
  },
];

export default function HomeSections() {
  const { t } = useLang();

  return (
    <>
      {/* ── Testimonials ── */}
      <section
        className="py-24 relative overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(201,168,76,0.04) 0%, transparent 60%)' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-gsap="fade-up">
            <p
              className="text-xs font-bold uppercase tracking-[0.2em] mb-2"
              style={{ color: 'var(--gold)' }}
            >
              {t.testimonials.eyebrow}
            </p>
            <h2 className="section-title mb-4" style={{ color: 'var(--text)' }}>
              {t.testimonials.title}
            </h2>
            <p className="max-w-md mx-auto text-sm" style={{ color: 'var(--text-muted)' }}>
              Mijozlarimizning fikrlari bizning eng katta motivatsiyamiz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-gsap="stagger">
            {TESTIMONIALS.map((item) => (
              <div key={item.name} className="glass-card p-7 flex flex-col" data-gsap="scale">
                <Quote
                  size={28}
                  style={{ color: 'var(--gold)', opacity: 0.35, marginBottom: '1rem' }}
                />

                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: item.rating }).map((_, j) => (
                    <Star
                      key={j}
                      size={12}
                      style={{ fill: 'var(--gold)', color: 'var(--gold)' }}
                    />
                  ))}
                </div>

                <p
                  className="text-sm leading-relaxed mb-6 flex-1 italic"
                  style={{ color: 'var(--text-muted)' }}
                >
                  &ldquo;{item.text}&rdquo;
                </p>

                <div className="gold-divider mb-5" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                      {item.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-subtle)' }}>
                      {item.location}
                    </p>
                  </div>
                  <span className="badge badge-gold">{item.watch}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-32 overflow-hidden" style={{ background: 'var(--bg)' }}>
        {/* Layered background */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 50% 50%, rgba(201,168,76,0.09) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              opacity: 0.03,
            }}
          />
          {/* Decorative rings */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none animate-aurora-breathe"
            style={{ border: '1px solid rgba(201,168,76,0.06)' }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full pointer-events-none"
            style={{ border: '1px solid rgba(201,168,76,0.04)' }}
          />
        </div>

        <div
          className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          data-gsap="fade-up"
        >
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] mb-4"
            style={{ color: 'var(--gold)' }}
          >
            {t.cta.eyebrow}
          </p>
          <h2 className="section-title mb-6" style={{ color: 'var(--text)' }}>
            {t.cta.title}{' '}
            <span className="gold-text italic">{t.cta.titleAccent}</span>
          </h2>
          <div
            className="gold-divider mx-auto mb-8"
            style={{ maxWidth: '120px' }}
          />
          <p
            className="mb-10 text-base leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            {t.cta.subtitle}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/products" className="gold-btn text-sm">
              {t.cta.button} <ArrowRight size={16} />
            </Link>
            <Link href="/categories" className="outline-btn text-sm">
              Kategoriyalar
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
