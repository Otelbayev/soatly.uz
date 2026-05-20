'use client';
import { Shield, Zap, Award, Headphones, RotateCcw, Lock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
  badge: string;
}

const FEATURES: Feature[] = [
  {
    icon: Shield,
    title: 'Haqiqiylik Kafolati',
    desc: "Har bir soat zavoddan bevosita yoki akkreditatsiyalangan distribyutorlardan keladi. 100% original va sertifikatlangan.",
    badge: 'Sertifikatlangan',
  },
  {
    icon: Zap,
    title: 'Tezkor Yetkazib Berish',
    desc: "Toshkent bo'ylab 1–2 soat ichida. Butun O'zbekiston bo'ylab 1–3 ish kunida yetkazib beramiz.",
    badge: 'Tez',
  },
  {
    icon: Award,
    title: 'Premium Sifat',
    desc: "Faqat 5 yulduzli brendlar. Rolex, Omega, Patek Philippe, Audemars Piguet va ko'plab boshqalar.",
    badge: 'Lyuks',
  },
  {
    icon: Headphones,
    title: "24/7 Qo'llab-quvvatlash",
    desc: "Savol bormi? Mutaxassislarimiz har doim tayyordur. Telegram, WhatsApp yoki to'g'ridan-to'g'ri qo'ng'iroq.",
    badge: 'Doim Aloqada',
  },
  {
    icon: RotateCcw,
    title: 'Qulay Qaytarish',
    desc: "14 kun ichida hech qanday sabab ko'rsatmasdan qaytarish imkoniyati. Mijoz doim haqliydir.",
    badge: '14 Kun',
  },
  {
    icon: Lock,
    title: "Xavfsiz To'lov",
    desc: "Barcha to'lovlar shifrlangan SSL orqali amalga oshiriladi. Payme, Click, karta va naqd pul.",
    badge: 'Xavfsiz',
  },
];

export default function WhyUsSection() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Background glows */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at right top, rgba(201,168,76,0.05) 0%, transparent 60%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-1/3 h-1/2 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at left bottom, rgba(139,92,246,0.03) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16" data-gsap="fade-up">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] mb-2"
            style={{ color: 'var(--gold)' }}
          >
            Nima Uchun Soatly?
          </p>
          <h2 className="section-title mb-4" style={{ color: 'var(--text)' }}>
            Mukammal <span className="gold-text italic">Xizmat</span>
          </h2>
          <p
            className="max-w-xl mx-auto text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            Biz shunchaki soat sotmaymiz — siz uchun eng yaxshi tajribani yaratamiz.
            Har bir mijoz biz uchun VIP.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-gsap="stagger">
          {FEATURES.map((feat, i) => (
            <div key={i} className="glass-card p-6 group" data-gsap="scale">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: 'rgba(201,168,76,0.1)',
                    border: '1px solid rgba(201,168,76,0.22)',
                  }}
                >
                  <feat.icon size={20} style={{ color: 'var(--gold)' }} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold mb-2"
                    style={{
                      color: 'var(--text)',
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '1.1rem',
                    }}
                  >
                    {feat.title}
                  </h3>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>
                    {feat.desc}
                  </p>
                  <span className="badge badge-gold">{feat.badge}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
