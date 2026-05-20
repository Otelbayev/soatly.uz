'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { end: 50,   suffix: '+',  label: 'Premium Brendlar',    sub: 'Jahon mashhur markalari' },
  { end: 5000, suffix: '+',  label: 'Mamnun Mijozlar',     sub: "O'zbekiston bo'ylab" },
  { end: 3,    suffix: '+',  label: 'Yil Tajriba',         sub: 'Ishonchli va sertifikatlangan' },
  { end: 24,   suffix: '/7', label: "Qo'llab-quvvatlash",  sub: 'Har doim aloqada' },
] as const;

export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      sectionRef.current!.querySelectorAll<HTMLElement>('[data-counter]').forEach((el) => {
        const end = parseInt(el.dataset.counter!, 10);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: end,
          duration: 2.2,
          ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.v).toString(); },
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
        });
      });

      // Fade-in each stat card
      gsap.utils.toArray<HTMLElement>('[data-stat-card]').forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: i * 0.12,
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 relative overflow-hidden"
      style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
    >
      {/* Radial glow top */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 65%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-0 md:divide-x" style={{ borderColor: 'var(--border)' }}>
          {STATS.map((stat, i) => (
            <div key={i} data-stat-card className="text-center px-4 md:px-8">
              {/* Number + suffix */}
              <div className="flex items-baseline justify-center gap-0.5 mb-3">
                <span
                  data-counter={stat.end}
                  className="gold-text"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)',
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  0
                </span>
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 'clamp(1.4rem, 2.5vw, 2.2rem)',
                    fontWeight: 700,
                    color: 'var(--gold)',
                    lineHeight: 1,
                  }}
                >
                  {stat.suffix}
                </span>
              </div>

              {/* Divider */}
              <div
                className="w-8 h-px mx-auto mb-3"
                style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }}
              />

              <p
                className="text-xs font-bold uppercase tracking-[0.15em]"
                style={{ color: 'var(--text)' }}
              >
                {stat.label}
              </p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-subtle)' }}>
                {stat.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
