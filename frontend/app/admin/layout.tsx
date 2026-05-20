'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Watch, LayoutDashboard, Package, Tag, Award, ShoppingBag, LogOut, Menu, X } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import CurrencyToggle from '@/components/CurrencyToggle';
import AdminUzBoundary from '@/components/admin/AdminUzBoundary';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout, isAuthenticated } = useAuth();
  const [sideOpen, setSideOpen] = useState(false);

  // Login sahifasidan tashqari hamma joyda token mavjudligini tekshiramiz
  useEffect(() => {
    if (loading) return;
    if (pathname === '/admin/login') return;
    if (!isAuthenticated()) {
      router.replace('/admin/login');
    }
  }, [loading, pathname, isAuthenticated, router]);

  // Marshrut o'zgarsa drawer'ni avtomatik yopamiz
  useEffect(() => { setSideOpen(false); }, [pathname]);

  // Drawer ochiq paytda body scroll-lock
  useEffect(() => {
    if (!sideOpen) return;
    document.body.classList.add('drawer-open');
    return () => { document.body.classList.remove('drawer-open'); };
  }, [sideOpen]);

  // Escape bilan yopish
  useEffect(() => {
    if (!sideOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSideOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sideOpen]);

  const handleLogout = async () => {
    await logout();
    router.replace('/admin/login');
  };

  // Login sahifasi sidebar/header'siz ko'rsatiladi
  if (pathname === '/admin/login') return <>{children}</>;

  if (loading || !isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <span className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--gold)' }} />
      </div>
    );
  }

  const navItems = [
    { href: '/admin',            icon: LayoutDashboard, label: t.admin.dashboard },
    { href: '/admin/products',   icon: Package,         label: t.admin.products },
    { href: '/admin/categories', icon: Tag,             label: t.admin.categories },
    { href: '/admin/brands',     icon: Award,           label: t.admin.brands },
    { href: '/admin/orders',     icon: ShoppingBag,     label: t.admin.orders },
  ];

  const isActive = (href: string) => href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      <aside
        className="hidden lg:flex flex-col w-60 shrink-0 border-r"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div className="p-5 border-b flex items-center gap-2.5" style={{ borderColor: 'var(--border)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-bright))' }}>
            <Watch size={15} color="#0A0A0A" />
          </div>
          <div>
            <p className="gold-text font-heading font-bold text-base tracking-widest">SOATLY</p>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`ghost-btn w-full ${isActive(href) ? 'active' : ''}`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
          {user && (
            <div className="px-2 py-1.5 text-[11px]" style={{ color: 'var(--text-subtle)' }}>
              <span className="opacity-70">@</span>
              <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>{user.username}</span>
            </div>
          )}
          <Link href="/" className="ghost-btn w-full text-xs" target="_blank">
            ← soatly.uz
          </Link>
          <button onClick={handleLogout} className="ghost-btn w-full text-xs">
            <LogOut size={14} />
            {t.admin.logout}
          </button>
        </div>
      </aside>

      {sideOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          <button
            className="absolute inset-0 animate-backdrop"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSideOpen(false)}
            aria-label="Yopish"
            tabIndex={-1}
          />
          <aside
            className="absolute top-0 left-0 bottom-0 w-[80vw] max-w-[280px] flex flex-col border-r animate-drawer-left pt-safe pb-safe"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border)',
              boxShadow: '12px 0 40px rgba(0,0,0,0.4)',
            }}
          >
            <div className="px-4 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-bright))' }}>
                  <Watch size={14} color="#0A0A0A" />
                </div>
                <div className="leading-none">
                  <p className="gold-text font-heading font-bold text-sm tracking-widest">SOATLY</p>
                  <p className="text-[9px] uppercase tracking-[0.2em] mt-0.5" style={{ color: 'var(--text-subtle)' }}>Admin Panel</p>
                </div>
              </div>
              <button
                onClick={() => setSideOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors active:scale-95"
                style={{ borderColor: 'var(--border-gold)', color: 'var(--text-muted)' }}
                aria-label="Yopish"
              >
                <X size={16} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {navItems.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`ghost-btn w-full ${isActive(href) ? 'active' : ''}`}
                >
                  <Icon size={16} />{label}
                </Link>
              ))}
            </nav>
            <div className="p-3 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
              {user && (
                <div className="px-2 py-1.5 text-[11px]" style={{ color: 'var(--text-subtle)' }}>
                  <span className="opacity-70">@</span>
                  <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>{user.username}</span>
                </div>
              )}
              <Link href="/" className="ghost-btn w-full text-xs" target="_blank">
                ← soatly.uz
              </Link>
              <button onClick={handleLogout} className="ghost-btn w-full text-xs">
                <LogOut size={14} />{t.admin.logout}
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="sticky top-0 z-30 px-3 sm:px-4 py-2.5 sm:py-3 border-b flex items-center justify-between pt-safe"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSideOpen(true)}
              className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center border transition-colors active:scale-95"
              style={{ borderColor: 'var(--border-gold)', color: 'var(--text-muted)' }}
              aria-label="Menyu"
            >
              <Menu size={16} />
            </button>
            <h2 className="font-heading font-semibold text-sm truncate" style={{ color: 'var(--text-muted)' }}>
              {navItems.find((n) => isActive(n.href))?.label || 'Admin'}
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <CurrencyToggle />
            <ThemeToggle />
            <button onClick={handleLogout} className="ghost-btn text-xs hidden sm:flex">
              <LogOut size={13} />{t.admin.logout}
            </button>
          </div>
        </header>

        <div className="flex-1 p-3 sm:p-6 overflow-auto">
          <AdminUzBoundary>{children}</AdminUzBoundary>
        </div>
      </div>
    </div>
  );
}
