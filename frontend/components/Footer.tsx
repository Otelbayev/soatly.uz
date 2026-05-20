'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { api } from '@/lib/api';
import { Category, Brand, pick } from '@/lib/types';

export default function Footer() {
  const { t, locale } = useLang();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
    api.getBrands().then(setBrands).catch(() => {});
  }, []);

  return (
    <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }} className="mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0"
                style={{ boxShadow: 'var(--shadow-gold)', border: '1px solid rgba(201,168,76,0.3)' }}>
                <Image src="/logo.jpg" alt="SOATLY" fill className="object-cover" sizes="36px" />
              </div>
              <div>
                <span className="gold-text font-heading text-lg font-bold tracking-[0.18em]">SOATLY</span>
                <span className="block text-[9px] tracking-[0.25em] uppercase" style={{ color: 'var(--text-subtle)' }}>soatly.uz</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-xs" style={{ color: 'var(--text-muted)' }}>
              {t.footer.tagline}
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Instagram, href: 'https://www.instagram.com/soatly.uz/' },
                { Icon: Twitter,   href: '#' },
                { Icon: Mail,      href: 'mailto:info@soatly.uz' },
              ].map(({ Icon, href }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = 'var(--gold-bright)'; el.style.color = 'var(--gold-light)'; }}
                  onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--text-muted)'; }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Collections (real) */}
          <div>
            <h4 className="font-heading font-semibold mb-5 text-sm tracking-widest uppercase" style={{ color: 'var(--text)' }}>
              {t.footer.collections}
            </h4>
            <ul className="space-y-3">
              {categories.length === 0 && (
                <li className="text-xs" style={{ color: 'var(--text-subtle)' }}>—</li>
              )}
              {categories.slice(0, 8).map((c) => (
                <li key={c.id}>
                  <Link href={`/categories/${c.slug}`}
                    className="text-sm transition-colors duration-200" style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold-light)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}>
                    {pick(c, 'name', locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands (real) */}
          <div>
            <h4 className="font-heading font-semibold mb-5 text-sm tracking-widest uppercase" style={{ color: 'var(--text)' }}>
              {t.footer.brands}
            </h4>
            <ul className="space-y-3">
              {brands.length === 0 && (
                <li className="text-xs" style={{ color: 'var(--text-subtle)' }}>—</li>
              )}
              {brands.slice(0, 8).map((b) => (
                <li key={b.id}>
                  <Link href={`/brands/${b.slug}`}
                    className="text-sm transition-colors duration-200" style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold-light)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}>
                    {pick(b, 'name', locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold mb-5 text-sm tracking-widest uppercase" style={{ color: 'var(--text)' }}>
              {t.footer.contact}
            </h4>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                <MapPin size={15} style={{ color: 'var(--gold)', marginTop: 2 }} className="shrink-0" />
                <span>Toshkent, O&apos;zbekiston<br />soatly.uz</span>
              </li>
              <li className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                <Phone size={15} style={{ color: 'var(--gold)' }} className="shrink-0" />
                <a href="tel:+998940103056" style={{ color: 'inherit' }}>+998 94 010-30-56</a>
              </li>
              <li className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                <Instagram size={15} style={{ color: 'var(--gold)' }} className="shrink-0" />
                <a href="https://www.instagram.com/soatly.uz/" target="_blank" rel="noopener noreferrer"
                  className="hover:underline" style={{ color: 'var(--gold-light)' }}>
                  @soatly.uz
                </a>
              </li>
            </ul>

            <div>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--text)' }}>{t.footer.newsletter}</p>
              <div className="flex gap-2">
                <input type="email" placeholder={t.footer.newsletterPlaceholder}
                  className="input-luxury flex-1 text-xs py-2.5" aria-label="Newsletter email" />
                <button className="gold-btn px-4 py-2.5 text-xs">{t.footer.join}</button>
              </div>
            </div>
          </div>
        </div>

        <div className="gold-divider my-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ color: 'var(--text-subtle)' }}>
          <p>{t.footer.rights}</p>
          <div className="flex gap-5">
            <Link href="/products" className="transition-colors hover:underline" style={{ color: 'var(--text-subtle)' }}>{t.nav.collection}</Link>
            <Link href="/cart" className="transition-colors hover:underline" style={{ color: 'var(--text-subtle)' }}>{t.nav.cart}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
