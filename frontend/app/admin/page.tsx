'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { OrderStats } from '@/lib/types';
import { useLang } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Package, ShoppingBag, DollarSign, Clock, TrendingUp, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { t } = useLang();
  const { format } = useCurrency();
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getStats().catch(() => null),
      adminApi.getProducts({ limit: 1 }).catch(() => null),
    ])
      .then(([s, p]) => {
        setStats(s || { pending: 0, sold: 0, cancelled: 0, total: 0, revenue: 0 });
        setProductsCount(p?.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { icon: Package,      label: t.admin.totalProducts,    value: productsCount,                   href: '/admin/products', color: 'var(--gold)' },
    { icon: ShoppingBag,  label: t.admin.totalOrders,      value: stats.total,                     href: '/admin/orders',                            color: '#93C5FD' },
    { icon: DollarSign,   label: t.admin.revenue,          value: format(stats.revenue),           href: '/admin/orders?status=sold',                color: '#86EFAC' },
    { icon: Clock,        label: t.admin.pendingOrders,    value: stats.pending,                   href: '/admin/orders?status=pending',             color: '#FDE047' },
    { icon: CheckCircle2, label: t.admin.soldOrders,       value: stats.sold,                      href: '/admin/orders?status=sold',                color: '#86EFAC' },
    { icon: XCircle,      label: t.admin.cancelledOrders,  value: stats.cancelled,                 href: '/admin/orders?status=cancelled',           color: '#FCA5A5' },
  ] : [];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] font-bold mb-1" style={{ color: 'var(--gold)' }}>
          SOATLY Admin
        </p>
        <h1 className="font-heading text-3xl font-bold" style={{ color: 'var(--text)' }}>
          {t.admin.dashboard}
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="w-8 h-8 rounded-lg mb-3" style={{ background: 'var(--bg-surface2)' }} />
                <div className="h-3 rounded mb-2" style={{ background: 'var(--bg-surface2)', width: '60%' }} />
                <div className="h-7 rounded" style={{ background: 'var(--bg-surface2)', width: '40%' }} />
              </div>
            ))
          : cards.map(({ icon: Icon, label, value, href, color }) => (
              <Link key={label} href={href} className="glass-card p-5 group block">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-subtle)' }}
                    className="group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="font-heading text-2xl font-bold" style={{ color: 'var(--text)' }}>{value}</p>
              </Link>
            ))
        }
      </div>

      <h2 className="font-heading text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>
        <TrendingUp size={18} className="inline mr-2" style={{ color: 'var(--gold)' }} />
        Tezkor harakatlar
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/admin/products/new" className="glass-card p-5 flex items-center gap-4 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid var(--border-gold)' }}>
            <Package size={18} style={{ color: 'var(--gold)' }} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{t.admin.newProduct}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.admin.products}</p>
          </div>
        </Link>

        <Link href="/admin/categories" className="glass-card p-5 flex items-center gap-4 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(147,197,253,0.1)', border: '1px solid rgba(147,197,253,0.25)' }}>
            <Package size={18} style={{ color: '#93C5FD' }} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{t.admin.newCategory}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.admin.categories}</p>
          </div>
        </Link>

        <Link href="/admin/orders" className="glass-card p-5 flex items-center gap-4 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(134,239,172,0.1)', border: '1px solid rgba(134,239,172,0.25)' }}>
            <ShoppingBag size={18} style={{ color: '#86EFAC' }} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{t.admin.orders}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stats?.pending ?? 0} {t.admin.pendingOrders}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
