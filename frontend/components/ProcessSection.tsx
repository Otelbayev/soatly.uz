'use client';
import Link from 'next/link';
import { Search, ShoppingCart, Package, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Step {
  icon: LucideIcon;
  title: string;
  desc: string;
  link?: { label: string; href: string };
}

const STEPS: Step[] = [
  {
    icon: Search,
    title: "Katalogni Ko'ring",
    desc: "500+ premium soat orasidan o'zingizga mosini toping. Brend, narx, kategoriya bo'yicha filter qiling.",
    link: { label: "Katalogga o'tish", href: '/products' },
  },
  {
    icon: ShoppingCart,
    title: 'Buyurtma Bering',
    desc: "Savatga qo'shing va qulay to'lov usulini tanlang: Payme, Click, karta yoki naqd pul.",
  },
  {
    icon: Package,
    title: 'Qabul Qiling',
    desc: "Soatingiz premium qadoqda, tezkor va xavfsiz yetkazib beriladi. Kafolat sertifikati bilan birga.",
  },
];

export default function ProcessSection() {
  return (
    <section className="py-24 relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Bottom glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(201,168,76,0.07) 0%, transparent 60%)' }}
      />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(201,168,76,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.4) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          opacity: 0.015,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16" data-gsap="fade-up">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] mb-2"
            style={{ color: 'var(--gold)' }}
          >
            Qanday Ishlaydi?
          </p>
          <h2 className="section-title mb-4" style={{ color: 'var(--text)' }}>
            3 ta Oddiy <span className="gold-text italic">Qadam</span>
          </h2>
          <p
            className="max-w-xl mx-auto text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            Soatly orqali buyurtma berish juda oson. Bir necha daqiqa ichida tugatib,
            soatingizni qo&apos;lingizda ko&apos;rasiz.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line — desktop only */}
          <div
            className="hidden md:block absolute top-10 left-[calc(16.6%+2.5rem)] right-[calc(16.6%+2.5rem)] h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.5) 15%, rgba(201,168,76,0.5) 85%, transparent 100%)',
            }}
            data-gsap="line-grow"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10" data-gsap="stagger">
            {STEPS.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center" data-gsap="fade-up">
                {/* Icon circle */}
                <div className="relative mb-6">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center transition-transform duration-300 hover:scale-105"
                    style={{
                      background: 'var(--bg-surface2)',
                      border: '1px solid var(--border-gold)',
                      boxShadow: '0 0 28px rgba(201,168,76,0.12), inset 0 1px 0 rgba(201,168,76,0.08)',
                    }}
                  >
                    <step.icon size={28} style={{ color: 'var(--gold)' }} />
                  </div>
                  {/* Step badge */}
                  <span
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{
                      background: 'linear-gradient(135deg, var(--gold), var(--gold-bright))',
                      color: '#0A0A0A',
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    {i + 1}
                  </span>
                </div>

                <h3
                  className="text-xl font-semibold mb-3"
                  style={{ color: 'var(--text)', fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-5"
                  style={{ color: 'var(--text-muted)', maxWidth: '240px' }}
                >
                  {step.desc}
                </p>

                {step.link && (
                  <Link
                    href={step.link.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:gap-2.5"
                    style={{ color: 'var(--gold)' }}
                  >
                    {step.link.label} <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
