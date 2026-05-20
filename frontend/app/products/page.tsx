'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api, isAbortError } from '@/lib/api';
import { Product, Category, Brand } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { useLang } from '@/context/LanguageContext';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, ChevronDown, X, SlidersHorizontal } from 'lucide-react';

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--gold)' }} />
      </div>
    }>
      <ProductsPageInner />
    </Suspense>
  );
}

const splitCsv = (v: string | null) =>
  (v || '').split(',').map((s) => s.trim()).filter(Boolean);

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLang();

  const SORT_OPTIONS = [
    { value: 'created_at-DESC', label: t.products.sortNewest },
    { value: 'price-ASC',       label: t.products.sortPriceAsc },
    { value: 'price-DESC',      label: t.products.sortPriceDesc },
    { value: 'name-ASC',        label: t.products.sortNameAsc },
  ];

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(splitCsv(searchParams.get('category')));
  const [selectedBrands, setSelectedBrands] = useState<string[]>(splitCsv(searchParams.get('brand')));
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('created_at-DESC');
  const [page, setPage] = useState(1);
  const [featured, setFeatured] = useState(searchParams.get('featured') === 'true');

  // Foydalanuvchi yozayotgan input qiymatlarini kechiktiramiz —
  // har bir tugma bosilganda backend'ga so'rov ketmaydi.
  const debouncedSearch = useDebounce(search, 400);
  const debouncedMinPrice = useDebounce(minPrice, 500);
  const debouncedMaxPrice = useDebounce(maxPrice, 500);

  const fetchProducts = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    try {
      const [sortCol, sortDir] = sort.split('-');
      const params: Record<string, string | number | boolean> = { sort: sortCol, order: sortDir, page, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategories.length) params.category = selectedCategories.join(',');
      if (selectedBrands.length) params.brand = selectedBrands.join(',');
      if (debouncedMinPrice) params.min_price = debouncedMinPrice;
      if (debouncedMaxPrice) params.max_price = debouncedMaxPrice;
      if (featured) params.featured = true;
      const data = await api.getProducts(params, { signal });
      if (signal.aborted) return;
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      if (isAbortError(err)) return; // foydali emas — bekor qilingan
      console.error(err);
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [debouncedSearch, selectedCategories, selectedBrands, debouncedMinPrice, debouncedMaxPrice, sort, page, featured]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchProducts(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchProducts]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.getCategories(), api.getBrands()])
      .then(([c, b]) => { if (!cancelled) { setCategories(c); setBrands(b); } })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setSelectedCategories(splitCsv(searchParams.get('category')));
    setSelectedBrands(splitCsv(searchParams.get('brand')));
    setFeatured(searchParams.get('featured') === 'true');
    setPage(1);
  }, [searchParams]);

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
    setPage(1);
  };
  const toggleBrand = (slug: string) => {
    setSelectedBrands((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSearch(''); setSelectedCategories([]); setSelectedBrands([]);
    setMinPrice(''); setMaxPrice(''); setFeatured(false); setPage(1);
    router.push('/products');
  };

  const activeCount =
    selectedCategories.length +
    selectedBrands.length +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (featured ? 1 : 0);

  const FiltersPanel = (
    <div className="space-y-7">
      {/* Categories */}
      <section>
        <h3 className="text-text font-heading font-semibold text-base mb-3">
          {t.admin.category}
        </h3>
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {categories.map((c) => {
            const checked = selectedCategories.includes(c.slug);
            return (
              <label key={c.id} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCategory(c.slug)}
                  className="checkbox-luxury"
                />
                <span className={`text-sm transition-colors ${checked ? 'text-text font-semibold' : 'text-text-muted'} group-hover:text-text`}>
                  {c.name_uz}
                </span>
              </label>
            );
          })}
          {categories.length === 0 && (
            <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>—</p>
          )}
        </div>
      </section>

      <div className="gold-divider" />

      {/* Brands */}
      <section>
        <h3 className="text-text font-heading font-semibold text-base mb-3">
          {t.admin.brand}
        </h3>
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {brands.map((b) => {
            const checked = selectedBrands.includes(b.slug);
            return (
              <label key={b.id} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleBrand(b.slug)}
                  className="checkbox-luxury"
                />
                <span className={`text-sm transition-colors ${checked ? 'text-text font-semibold' : 'text-text-muted'} group-hover:text-text`}>
                  {b.name_uz}
                </span>
              </label>
            );
          })}
          {brands.length === 0 && (
            <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>—</p>
          )}
        </div>
      </section>

      <div className="gold-divider" />

      {/* Price */}
      <section>
        <h3 className="text-text font-heading font-semibold text-base mb-3">
          Narx (so&apos;m)
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
            placeholder={t.products.minPrice}
            className="input-luxury text-sm"
            min="0"
          />
          <span style={{ color: 'var(--text-subtle)' }}>—</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
            placeholder={t.products.maxPrice}
            className="input-luxury text-sm"
            min="0"
          />
        </div>
      </section>

      <div className="gold-divider" />

      {/* Featured */}
      <section>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => { setFeatured(!featured); setPage(1); }}
            className="w-10 h-5 rounded-full relative transition-all duration-200"
            style={{ background: featured ? 'linear-gradient(135deg, var(--gold), var(--gold-bright))' : 'var(--bg-surface2)', border: '1px solid var(--border)' }}
          >
            <div
              className="absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-200"
              style={{ background: 'var(--text)', transform: featured ? 'translateX(20px)' : 'translateX(2px)' }}
            />
          </div>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.products.featuredOnly}</span>
        </label>
      </section>

      {activeCount > 0 && (
        <button onClick={clearFilters} className="outline-btn w-full justify-center text-xs">
          <X size={13} /> {t.products.clearFilters} ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pt-24">
      {/* Page header */}
      <div className="bg-bg-surface border-b border-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gold text-xs font-bold uppercase tracking-[0.2em] mb-2">{t.products.pageEyebrow}</p>
          <h1 className="section-title text-text mb-1">{t.products.pageTitle}</h1>
          <p className="text-text-muted text-sm">{total} {t.products.available}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top: search + sort + mobile filter btn */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
            <input
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={t.products.searchPlaceholder}
              className="input-luxury pl-9"
            />
          </div>

          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="outline-btn lg:hidden relative"
          >
            <SlidersHorizontal size={15} />
            {t.products.filters}
            {activeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gold-gradient rounded-full text-bg text-[9px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="input-luxury appearance-none pr-8 cursor-pointer w-full sm:w-auto"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
          </div>
        </div>

        {/* Main grid: sidebar + products */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 glass-card p-5">
              {FiltersPanel}
            </div>
          </aside>

          {/* Products grid */}
          <div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="glass-card overflow-hidden animate-pulse">
                    <div className="aspect-square bg-bg-surface2" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-bg-surface2 rounded w-1/2" />
                      <div className="h-4 bg-bg-surface2 rounded w-3/4" />
                      <div className="h-3 bg-bg-surface2 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-text-muted text-lg mb-2">{t.products.noResults}</p>
                <p className="text-text-subtle text-sm mb-6">{t.products.noResultsHint}</p>
                <button onClick={clearFilters} className="gold-btn">{t.products.clearFilters}</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 animate-fade-in">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}

            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="outline-btn px-4 py-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t.products.prev}
                </button>
                {Array.from({ length: Math.min(pages, 5) }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${page === p ? 'gold-btn px-0' : 'outline-btn px-0'}`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  disabled={page === pages}
                  onClick={() => setPage(page + 1)}
                  className="outline-btn px-4 py-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t.products.next}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters drawer */}
      {mobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70" onClick={() => setMobileFiltersOpen(false)} />
          <aside
            className="relative ml-auto w-80 max-w-full h-full overflow-y-auto p-5"
            style={{ background: 'var(--bg-surface)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-lg font-bold" style={{ color: 'var(--text)' }}>
                {t.products.filters}
              </h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="ghost-btn p-2">
                <X size={16} />
              </button>
            </div>
            {FiltersPanel}
          </aside>
        </div>
      )}
    </div>
  );
}
