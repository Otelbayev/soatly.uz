'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Award, Phone, Truck } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';

// Deterministic particles — avoids hydration mismatch
const PARTICLES = [
  { id: 0,  x: 8,  y: 25, s: 2,   delay: 0,   dur: 8,  op: 0.30 },
  { id: 1,  x: 18, y: 72, s: 1.5, delay: 1.5, dur: 11, op: 0.18 },
  { id: 2,  x: 32, y: 15, s: 2.5, delay: 3,   dur: 9,  op: 0.28 },
  { id: 3,  x: 45, y: 88, s: 1,   delay: 0.8, dur: 13, op: 0.15 },
  { id: 4,  x: 58, y: 35, s: 3,   delay: 2.2, dur: 7,  op: 0.32 },
  { id: 5,  x: 72, y: 60, s: 1.5, delay: 4,   dur: 10, op: 0.20 },
  { id: 6,  x: 85, y: 20, s: 2,   delay: 1,   dur: 12, op: 0.26 },
  { id: 7,  x: 92, y: 78, s: 1,   delay: 3.5, dur: 8,  op: 0.14 },
  { id: 8,  x: 25, y: 50, s: 1.5, delay: 2,   dur: 14, op: 0.22 },
  { id: 9,  x: 65, y: 10, s: 2,   delay: 0.5, dur: 9,  op: 0.30 },
  { id: 10, x: 78, y: 45, s: 1,   delay: 3,   dur: 11, op: 0.16 },
  { id: 11, x: 12, y: 90, s: 2.5, delay: 1.8, dur: 7,  op: 0.25 },
  { id: 12, x: 50, y: 65, s: 1.5, delay: 4.5, dur: 10, op: 0.20 },
  { id: 13, x: 38, y: 40, s: 1,   delay: 2.7, dur: 15, op: 0.12 },
  { id: 14, x: 90, y: 55, s: 2,   delay: 0.3, dur: 8,  op: 0.24 },
  { id: 15, x: 55, y: 82, s: 1,   delay: 1.2, dur: 12, op: 0.16 },
];

// SVG clock constants — viewBox 320×320, center (160,160)
const CX = 160, CY = 160, R = 148;

const r4 = (n: number) => Math.round(n * 1e4) / 1e4;
function deg2rad(deg: number) { return (deg - 90) * Math.PI / 180; }
function handXY(deg: number, len: number) {
  const a = deg2rad(deg);
  return { x: r4(CX + len * Math.cos(a)), y: r4(CY + len * Math.sin(a)) };
}

// Pre-computed at module level so SSR and client always emit identical values
const TICKS = Array.from({ length: 60 }, (_, i) => {
  const isHour = i % 5 === 0;
  const inner  = isHour ? R - 16 : R - 9;
  const outer  = R - 2;
  const a      = deg2rad(i * 6);
  return {
    isHour,
    x1: r4(CX + inner * Math.cos(a)), y1: r4(CY + inner * Math.sin(a)),
    x2: r4(CX + outer * Math.cos(a)), y2: r4(CY + outer * Math.sin(a)),
  };
});

const ROMANS = [
  { label: 'XII', x: r4(CX + (R - 32) * Math.cos(deg2rad(0))),   y: r4(CY + (R - 32) * Math.sin(deg2rad(0)))   },
  { label: 'III', x: r4(CX + (R - 32) * Math.cos(deg2rad(90))),  y: r4(CY + (R - 32) * Math.sin(deg2rad(90)))  },
  { label: 'VI',  x: r4(CX + (R - 32) * Math.cos(deg2rad(180))), y: r4(CY + (R - 32) * Math.sin(deg2rad(180))) },
  { label: 'IX',  x: r4(CX + (R - 32) * Math.cos(deg2rad(270))), y: r4(CY + (R - 32) * Math.sin(deg2rad(270))) },
];

function LiveClock() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime({ h: now.getHours(), m: now.getMinutes(), s: now.getSeconds() });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const secDeg  = time.s * 6;
  const minDeg  = time.m * 6 + time.s * 0.1;
  const hourDeg = (time.h % 12) * 30 + time.m * 0.5;

  const pad = (n: number) => String(n).padStart(2, '0');

  const hourTip  = handXY(hourDeg, 82);
  const hourTail = handXY(hourDeg + 180, 18);
  const minTip   = handXY(minDeg, 108);
  const minTail  = handXY(minDeg + 180, 22);
  const secTip   = handXY(secDeg, 118);
  const secTail  = handXY(secDeg + 180, 28);


  return (
    <div className="relative flex flex-col items-center">
      {/* SVG Clock — uses CSS vars so it follows light/dark theme */}
      <svg
        viewBox="0 0 320 320"
        width={280}
        height={280}
        style={{ overflow: 'visible', filter: 'drop-shadow(var(--clock-shadow))' }}
      >
        <defs>
          <radialGradient id="faceBg" cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor="var(--clock-face-1)" />
            <stop offset="100%" stopColor="var(--clock-face-2)" />
          </radialGradient>
          <radialGradient id="jewel" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="var(--gold-light)" />
            <stop offset="100%" stopColor="var(--gold)" />
          </radialGradient>
          <linearGradient id="goldHand" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--gold)" />
            <stop offset="100%" stopColor="var(--gold-light)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Outer bezel ring */}
        <circle cx={CX} cy={CY} r={R + 6} fill="none" stroke="var(--border-gold)" strokeWidth={12} />

        {/* Conic shimmer on bezel — via 4 arcs */}
        {[0, 90, 180, 270].map((deg) => {
          const a1 = deg2rad(deg);
          const a2 = deg2rad(deg + 30);
          const rr = R + 6;
          return (
            <path key={deg}
              d={`M ${CX + rr * Math.cos(a1)} ${CY + rr * Math.sin(a1)} A ${rr} ${rr} 0 0 1 ${CX + rr * Math.cos(a2)} ${CY + rr * Math.sin(a2)}`}
              fill="none" stroke="var(--gold)" strokeOpacity={0.5} strokeWidth={2}
            />
          );
        })}

        {/* Clock face */}
        <circle cx={CX} cy={CY} r={R} fill="url(#faceBg)" stroke="var(--clock-rim)" strokeWidth={1.5} />

        {/* Tick marks — 60 total, pre-computed to avoid SSR/client float mismatch */}
        {TICKS.map((t, i) => (
          <line key={i}
            x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.isHour ? 'var(--clock-tick)' : 'var(--clock-tick-dim)'}
            strokeWidth={t.isHour ? 2 : 1}
            strokeLinecap="round"
          />
        ))}

        {/* Roman numerals */}
        {ROMANS.map(({ label, x, y }) => (
          <text key={label} x={x} y={y}
            textAnchor="middle" dominantBaseline="central"
            fontSize={11} fontWeight={600}
            fontFamily="'Cormorant Garamond', Georgia, serif"
            fill="var(--clock-numeral)"
            letterSpacing="0.05em"
          >
            {label}
          </text>
        ))}

        {/* Brand text */}
        <text x={CX} y={CY - 30} textAnchor="middle" dominantBaseline="central"
          fontSize={8} fontWeight={700} letterSpacing="3"
          fontFamily="'Outfit', sans-serif"
          fill="var(--gold)"
        >
          SOATLY
        </text>

        {/* Digital display */}
        <text x={CX} y={CY + 38} textAnchor="middle" dominantBaseline="central"
          fontSize={9} letterSpacing="1.5"
          fontFamily="'DM Mono', monospace"
          fill="var(--gold-light)"
        >
          {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
        </text>

        {/* Hour hand */}
        <line
          x1={hourTail.x} y1={hourTail.y}
          x2={hourTip.x}  y2={hourTip.y}
          stroke="url(#goldHand)" strokeWidth={4} strokeLinecap="round"
          style={{ transition: 'all 0.5s cubic-bezier(0.4,2.5,0.6,1)' }}
          filter="url(#glow)"
        />

        {/* Minute hand */}
        <line
          x1={minTail.x} y1={minTail.y}
          x2={minTip.x}  y2={minTip.y}
          stroke="var(--clock-min-hand)" strokeWidth={2.5} strokeLinecap="round"
          style={{ transition: 'all 0.5s cubic-bezier(0.4,2.5,0.6,1)' }}
        />

        {/* Second hand */}
        <line
          x1={secTail.x} y1={secTail.y}
          x2={secTip.x}  y2={secTip.y}
          stroke="#ef4444" strokeWidth={1.2} strokeLinecap="round"
          style={{ transition: time.s === 0 ? 'none' : 'all 0.15s linear' }}
        />

        {/* Center cap */}
        <circle cx={CX} cy={CY} r={7} fill="url(#jewel)" />
        <circle cx={CX} cy={CY} r={3} fill="var(--text)" fillOpacity={0.15} />
      </svg>

      {/* Digital time display below */}
      <div
        className="mt-3 px-4 py-1.5 rounded-full"
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-gold)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <span style={{ fontSize: '11px', fontFamily: "'DM Mono', monospace", color: 'var(--gold)', letterSpacing: '0.1em' }}>
          {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
        </span>
      </div>
    </div>
  );
}

function LiveClockWrapper() {
  return (
    <div className="relative flex flex-col items-center">
      <LiveClock />

      {/* Floating chips */}
      {/* Phone */}
      <div
        className="absolute -left-8 top-4 flex items-center gap-2 px-3 py-2 animate-stagger-in"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border-gold)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-card)',
          animationDelay: '400ms',
          minWidth: 180,
        }}
      >
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)' }}>
          <Phone size={13} style={{ color: 'var(--gold)' }} />
        </div>
        <div>
          <p style={{ fontSize: '9px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Bog&apos;lanish</p>
          <p className="font-semibold" style={{ fontSize: '12px', color: 'var(--text)', letterSpacing: '0.05em' }}>+998 94 010-30-56</p>
        </div>
      </div>

      {/* Delivery */}
      <div
        className="absolute -right-6 bottom-8 flex items-center gap-2 px-3 py-2 animate-stagger-in"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border-gold)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-card)',
          animationDelay: '550ms',
          minWidth: 170,
        }}
      >
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)' }}>
          <Truck size={13} style={{ color: 'var(--gold)' }} />
        </div>
        <div>
          <p style={{ fontSize: '9px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Yetkazib berish</p>
          <p className="font-semibold" style={{ fontSize: '11px', color: 'var(--text)' }}>O&apos;zbekiston bo&apos;ylab</p>
        </div>
      </div>

      {/* Category badge — top right */}
      <div
        className="absolute -right-4 top-0 px-3 py-1.5 animate-stagger-in"
        style={{
          background: 'rgba(201,168,76,0.12)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: '10px',
          animationDelay: '300ms',
        }}
      >
        <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Erkaklar uchun
        </p>
      </div>

      {/* Glow behind clock */}
      <div
        className="absolute inset-0 -z-10 rounded-full animate-glow-hero"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.18) 0%, transparent 70%)',
          filter: 'blur(32px)',
          transform: 'scale(1.5)',
        }}
      />
    </div>
  );
}

export default function HeroSection() {
  const { t } = useLang();

  return (
    <section className="relative min-h-[88vh] sm:min-h-screen flex items-center justify-center overflow-hidden">

      {/* ── Layer 0: Base ── */}
      <div className="absolute inset-0" style={{ background: 'var(--bg)' }} />

      {/* ── Layer 1: Aurora rotating conic ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-aurora-rotate"
          style={{
            width: '140%',
            height: '140%',
            background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(201,168,76,0.07) 30deg, rgba(201,168,76,0.04) 60deg, transparent 90deg, transparent 170deg, rgba(201,168,76,0.05) 210deg, rgba(224,185,90,0.03) 240deg, transparent 270deg)',
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {/* ── Layer 2: Aurora counter-rotating ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-aurora-counter"
          style={{
            width: '160%',
            height: '160%',
            background: 'conic-gradient(from 180deg at 30% 70%, transparent 0deg, rgba(139,92,246,0.03) 45deg, transparent 90deg, rgba(201,168,76,0.04) 200deg, transparent 250deg)',
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {/* ── Layer 3: Radial glows ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute animate-aurora-breathe"
          style={{
            top: '-20%', right: '-10%',
            width: '70%', height: '90%',
            background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.09) 0%, rgba(201,168,76,0.03) 45%, transparent 70%)',
            filter: 'blur(48px)',
          }}
        />
        <div
          className="absolute animate-aurora-breathe"
          style={{
            bottom: '-30%', left: '-5%',
            width: '55%', height: '70%',
            background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.04) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animationDelay: '4s',
          }}
        />
      </div>

      {/* ── Layer 4: Grid ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(201,168,76,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.4) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          opacity: 0.025,
        }}
      />

      {/* ── Layer 5: Particles ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.s, height: p.s,
              background: 'var(--gold)',
              opacity: p.op,
              animation: `particle-float ${p.dur}s ${p.delay}s ease-in-out infinite`,
              boxShadow: `0 0 ${p.s * 4}px rgba(201,168,76,0.7)`,
            }}
          />
        ))}
      </div>

      {/* ── Decorative rings ── */}
      <div className="absolute rounded-full pointer-events-none" style={{ right: '6%', top: '50%', width: 520, height: 520, border: '1px solid rgba(201,168,76,0.06)', animation: 'ring-pulse 6s ease-in-out infinite', transform: 'translate(0,-50%)' }} />
      <div className="absolute rounded-full pointer-events-none" style={{ right: '10%', top: '50%', width: 340, height: 340, border: '1px solid rgba(201,168,76,0.04)', animation: 'ring-pulse 6s 3s ease-in-out infinite', transform: 'translate(0,-50%)' }} />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:py-24 lg:py-32 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

        {/* Left — text */}
        <div>
          <p className="animate-stagger-in text-xs font-bold uppercase tracking-[0.25em] mb-4 flex items-center gap-2"
            style={{ color: 'var(--gold)', animationDelay: '0ms' }}>
            <span className="w-5 h-px inline-block" style={{ background: 'linear-gradient(90deg, var(--gold), var(--gold-bright))' }} />
            {t.hero.eyebrow}
          </p>

          <h1 className="section-title mb-3 animate-stagger-in" style={{ animationDelay: '80ms' }}>
            {t.hero.title}{' '}
            <span className="gold-text italic">{t.hero.titleAccent}</span>
          </h1>

          {/* Tagline strip */}
          <p className="animate-stagger-in text-base font-semibold mb-4"
            style={{ color: 'var(--gold-light)', animationDelay: '120ms', letterSpacing: '0.03em' }}>
            Erkaklar uchun qo&apos;l soatlari
          </p>

          <p className="text-base leading-relaxed mb-8 max-w-lg animate-stagger-in"
            style={{ color: 'var(--text-muted)', animationDelay: '160ms' }}>
            {t.hero.subtitle}
          </p>

          {/* Info row */}
          <div className="flex flex-wrap gap-3 mb-8 animate-stagger-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.22)' }}>
              <Phone size={11} style={{ color: 'var(--gold)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>+998 94 010-30-56</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.18)' }}>
              <Truck size={11} style={{ color: 'var(--gold)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>O&apos;zbekiston bo&apos;ylab tezkor yetkazib berish</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 animate-stagger-in" style={{ animationDelay: '240ms' }}>
            <Link href="/products" className="gold-btn text-sm">
              {t.hero.cta} <ArrowRight size={16} />
            </Link>
            <Link href="/products?featured=true" className="outline-btn text-sm">
              {t.hero.ctaFeatured}
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4 sm:gap-6 mt-8 sm:mt-12 animate-stagger-in" style={{ animationDelay: '320ms' }}>
            {[
              { icon: Award,  label: t.hero.badge2, desc: t.hero.badge2Desc },
              { icon: Truck,  label: t.hero.badge3, desc: "O'zbekiston bo'ylab" },
              { icon: Phone,  label: 'Bog\'lanish', desc: '+998 94 010-30-56' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <Icon size={16} style={{ color: 'var(--gold)' }} />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{label}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-subtle)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — live clock */}
        <div className="hidden lg:flex justify-center items-center" style={{ minHeight: 360 }}>
          <LiveClockWrapper />
        </div>
      </div>

      {/* ── Scroll indicator (desktop only) ── */}
      <div className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2">
        <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: 'var(--text-subtle)' }}>Scroll</p>
        <div className="w-px h-10" style={{ background: 'linear-gradient(180deg, var(--gold), transparent)' }} />
        <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: 'var(--gold)' }} />
      </div>
    </section>
  );
}
