'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLang } from '@/context/LanguageContext';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import CurrencyToggle from './CurrencyToggle';
import clsx from 'clsx';

export default function Navbar() {
  const { count } = useCart();
  const { t } = useLang();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Scroll listener — passive + rAF throttle (faqat haqiqiy o'zgarishda setState)
  useEffect(() => {
    let raf = 0;
    let last = window.scrollY > 20;
    setScrolled(last);
    const handler = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const next = window.scrollY > 20;
        if (next !== last) { last = next; setScrolled(next); }
      });
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => {
      window.removeEventListener('scroll', handler);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Drawer ochiq paytda body scroll'ni qulflaymiz
  useEffect(() => {
    if (!open) return;
    document.body.classList.add('drawer-open');
    return () => { document.body.classList.remove('drawer-open'); };
  }, [open]);

  // Marshrut o'zgarganda drawer'ni avtomatik yopamiz
  useEffect(() => { setOpen(false); }, [pathname]);

  const links = [
    { href: '/', label: t.nav.home },
    { href: '/products', label: t.nav.collection },
    { href: '/categories', label: t.nav.categories },
    { href: '/brands', label: t.nav.brands },
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href);

  return (
    <>
      <header
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 pt-safe',
          scrolled ? 'glass-nav py-2.5 sm:py-3' : 'py-3 sm:py-5'
        )}
        style={!scrolled ? { background: 'transparent' } : undefined}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0" aria-label="SOATLY">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden shrink-0"
              style={{ boxShadow: 'var(--shadow-gold)', border: '1px solid rgba(201,168,76,0.3)' }}>
              <Image src="/logo.jpg" alt="SOATLY" fill className="object-cover" sizes="36px" priority />
            </div>
            <div className="leading-none">
              <span className="gold-text font-heading text-lg sm:text-xl font-bold tracking-[0.18em]">SOATLY</span>
              <span className="hidden sm:block text-[9px] tracking-[0.3em] uppercase mt-0.5" style={{ color: 'var(--text-subtle)' }}>
                soatly.uz
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="font-body text-[0.78rem] font-semibold tracking-[0.12em] uppercase transition-colors duration-200"
                style={{ color: isActive(l.href) ? 'var(--gold-light)' : 'var(--text-muted)' }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Actions — desktop'da hamma toggle, mobile'da faqat cart + menu */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="hidden md:flex items-center gap-2.5">
              <CurrencyToggle />
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

            <Link
              href="/cart"
              className="relative flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-200 active:scale-95"
              style={{ borderColor: 'var(--border-gold)', color: 'var(--text-muted)' }}
              aria-label={`${t.nav.cart}, ${count}`}
            >
              <ShoppingCart size={16} />
              {count > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-bold"
                  style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-bright))', color: '#0A0A0A' }}
                >
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>

            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-full border transition-colors active:scale-95"
              style={{ borderColor: 'var(--border-gold)', color: 'var(--text-muted)' }}
              onClick={() => setOpen(true)}
              aria-label="Menyu"
              aria-expanded={open}
            >
              <Menu size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer — right side */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <button
            className="absolute inset-0 animate-backdrop"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setOpen(false)}
            aria-label="Yopish"
            tabIndex={-1}
          />

          {/* Panel */}
          <aside
            className="absolute top-0 right-0 bottom-0 w-[84vw] max-w-sm flex flex-col animate-drawer-right pt-safe pb-safe"
            style={{
              background: 'var(--bg-surface)',
              borderLeft: '1px solid var(--border-gold)',
              boxShadow: '-12px 0 40px rgba(0,0,0,0.4)',
            }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0"
                  style={{ boxShadow: 'var(--shadow-gold)', border: '1px solid rgba(201,168,76,0.3)' }}>
                  <Image src="/logo.jpg" alt="SOATLY" fill className="object-cover" sizes="32px" />
                </div>
                <div>
                  <span className="gold-text font-heading text-base font-bold tracking-[0.18em] block leading-none">SOATLY</span>
                  <span className="text-[9px] tracking-[0.25em] uppercase" style={{ color: 'var(--text-subtle)' }}>soatly.uz</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors active:scale-95"
                style={{ borderColor: 'var(--border-gold)', color: 'var(--text-muted)' }}
                aria-label="Yopish"
              >
                <X size={16} />
              </button>
            </div>

            {/* Links */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-3 py-3.5 rounded-xl text-sm font-semibold tracking-[0.08em] uppercase transition-colors active:scale-[0.98]"
                  style={{
                    color: isActive(l.href) ? 'var(--gold-light)' : 'var(--text)',
                    background: isActive(l.href) ? 'rgba(201,168,76,0.08)' : 'transparent',
                    border: `1px solid ${isActive(l.href) ? 'var(--border-gold)' : 'transparent'}`,
                  }}
                >
                  <span>{l.label}</span>
                  <span className="text-[10px] opacity-50">→</span>
                </Link>
              ))}

              <div className="gold-divider my-4 opacity-40" />

              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-3 py-3.5 rounded-xl text-sm font-semibold tracking-[0.08em] uppercase"
                style={{ color: 'var(--gold)' }}
              >
                <span>{t.nav.admin}</span>
                <span className="text-[10px] opacity-50">→</span>
              </Link>
            </nav>

            {/* Footer: toggles */}
            <div className="px-5 pt-3 pb-5 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: 'var(--text-subtle)' }}>
                Sozlamalar
              </p>
              <div className="flex items-center gap-2">
                <CurrencyToggle />
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
