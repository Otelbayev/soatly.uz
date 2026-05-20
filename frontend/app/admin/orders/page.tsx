'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { adminApi, isAbortError } from '@/lib/api';
import { Order, OrderStatus } from '@/lib/types';
import { useLang } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useDebounce } from '@/hooks/useDebounce';
import Pagination from '@/components/admin/Pagination';
import TableSkeleton from '@/components/admin/TableSkeleton';
import { Eye, RefreshCw, ChevronDown, Search } from 'lucide-react';

const ORDER_STATUSES: OrderStatus[] = ['pending', 'sold', 'cancelled'];

export default function AdminOrdersPage() {
  const { t } = useLang();
  const { format } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const statusLabel: Record<OrderStatus, string> = {
    pending: t.admin.statusPending,
    sold: t.admin.statusSold,
    cancelled: t.admin.statusCancelled,
  };

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      const data = await adminApi.getOrders(params, { signal });
      if (signal?.aborted) return;
      setOrders(data.orders);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      if (isAbortError(err)) return;
      alert((err as Error).message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page, statusFilter, debouncedSearch]);

  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    setUpdating(orderId);
    try {
      const updated = await adminApi.updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, ...updated } : o));
    } catch (err) { alert((err as Error).message); }
    finally { setUpdating(null); }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text)' }}>{t.admin.orders}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{total} ta buyurtma</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
            <input
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={t.admin.search}
              className="input-luxury pl-8 text-sm"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="input-luxury text-sm appearance-none pr-8"
            >
              <option value="">{t.admin.filterAll}</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{statusLabel[s]}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-subtle)' }} />
          </div>
          <button onClick={() => load()} className="outline-btn px-3" title={t.admin.refresh}><RefreshCw size={14} /></button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t.admin.customer}</th>
                <th>{t.admin.phone}</th>
                <th>{t.admin.total}</th>
                <th>{t.admin.status}</th>
                <th>{t.admin.date}</th>
                <th>{t.admin.actions}</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <TableSkeleton rows={5} cols={7} />
                : orders.map((o) => (
                    <tr key={o.id}>
                      <td><span className="font-mono text-xs" style={{ color: 'var(--gold)' }}>#{o.id}</span></td>
                      <td><span className="font-medium text-sm" style={{ color: 'var(--text)' }}>{o.customer_name}</span></td>
                      <td><span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{o.customer_phone}</span></td>
                      <td><span className="font-semibold text-sm" style={{ color: 'var(--gold-light)' }}>{format(o.total_amount)}</span></td>
                      <td>
                        <div className="relative">
                          <select
                            value={o.status}
                            onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                            disabled={updating === o.id}
                            className={`status-${o.status} badge text-[10px] pr-6 cursor-pointer appearance-none border-0 bg-transparent font-bold`}
                            style={{ paddingLeft: '0.55rem', paddingRight: '1.4rem' }}
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s} value={s} style={{ background: 'var(--bg-surface)', color: 'var(--text)' }}>
                                {statusLabel[s]}
                              </option>
                            ))}
                          </select>
                          {updating === o.id && (
                            <span className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                          )}
                        </div>
                      </td>
                      <td><span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(o.created_at)}</span></td>
                      <td>
                        <Link href={`/admin/orders/${o.id}`} className="ghost-btn p-2 text-xs">
                          <Eye size={13} />
                        </Link>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {!loading && orders.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>{t.admin.noOrders}</div>
        )}
      </div>

      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}
