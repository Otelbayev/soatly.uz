'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { adminApi, isAbortError } from '@/lib/api';
import { Product } from '@/lib/types';
import { useLang } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useDebounce } from '@/hooks/useDebounce';
import Pagination from '@/components/admin/Pagination';
import TableSkeleton from '@/components/admin/TableSkeleton';
import { Plus, Edit2, Trash2, Search, RefreshCw } from 'lucide-react';

export default function AdminProductsPage() {
  const { t } = useLang();
  const { format } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await adminApi.getProducts({ search: debouncedSearch, page, limit: 15 }, { signal });
      if (signal?.aborted) return;
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      if (isAbortError(err)) return;
      throw err;
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`${t.admin.confirmDelete}\n"${name}"`)) return;
    setDeleting(id);
    try {
      await adminApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setTotal((prev) => prev - 1);
    } catch (err) {
      alert((err as Error).message);
    } finally { setDeleting(null); }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text)' }}>{t.admin.products}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{total} ta mahsulot</p>
        </div>
        <Link href="/admin/products/new" className="gold-btn">
          <Plus size={15} /> {t.admin.newProduct}
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t.products.searchPlaceholder}
            className="input-luxury pl-8 text-sm"
          />
        </div>
        <button onClick={() => load()} className="outline-btn px-3">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 56 }}>Rasm</th>
                <th>{t.admin.nameUz}</th>
                <th>{t.admin.brand}</th>
                <th>{t.admin.category}</th>
                <th>{t.admin.price}</th>
                <th>{t.admin.stock}</th>
                <th>{t.admin.featured}</th>
                <th>{t.admin.actions}</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <TableSkeleton rows={6} cols={8} />
                : products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden" style={{ background: 'var(--bg-surface2)' }}>
                          {p.images?.[0] && (
                            <Image src={p.images[0]} alt={p.name_uz} fill className="object-cover" sizes="40px" />
                          )}
                        </div>
                      </td>
                      <td>
                        <p className="font-medium text-sm line-clamp-1" style={{ color: 'var(--text)' }}>{p.name_uz}</p>
                      </td>
                      <td>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.brand_name_uz || '—'}</span>
                      </td>
                      <td>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {p.categories?.length
                            ? p.categories.map((c) => c.name_uz).join(', ')
                            : '—'}
                        </span>
                      </td>
                      <td>
                        <p className="font-semibold text-sm" style={{ color: 'var(--gold-light)' }}>{format(p.price)}</p>
                        {p.original_price && (
                          <p className="text-xs line-through" style={{ color: 'var(--text-subtle)' }}>{format(p.original_price)}</p>
                        )}
                      </td>
                      <td>
                        <span className={`text-sm font-medium ${p.stock <= 3 ? 'text-red-400' : ''}`} style={p.stock > 3 ? { color: 'var(--text)' } : undefined}>
                          {p.stock}
                        </span>
                      </td>
                      <td>
                        {p.featured
                          ? <span className="badge badge-gold">★</span>
                          : <span style={{ color: 'var(--text-subtle)' }}>—</span>}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/products/${p.id}`} className="ghost-btn p-2 text-xs">
                            <Edit2 size={13} />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.name_uz)}
                            disabled={deleting === p.id}
                            className="ghost-btn p-2 text-xs"
                            style={{ color: '#FCA5A5' }}
                          >
                            {deleting === p.id
                              ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                              : <Trash2 size={13} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {!loading && products.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            {t.products.noResults}
          </div>
        )}
      </div>

      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}
