'use client';
import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { Product, Category, Brand, SpecItem, normalizeSpecs } from '@/lib/types';
import { useLang } from '@/context/LanguageContext';
import { Plus, Trash2, Save, ArrowLeft, Upload, X, Zap } from 'lucide-react';

interface Props { initial?: Product }
type SpecRow = { key_uz: string; key_ru: string; value_uz: string; value_ru: string };

type SuggestionPair = { uz: string; ru: string };
type Preset = { key_uz: string; key_ru: string; suggestions?: SuggestionPair[] };

const SPEC_PRESETS: Preset[] = [
  { key_uz: 'Mexanizm', key_ru: 'Механизм', suggestions: [
    { uz: 'Avtomat', ru: 'Автоматический' },
    { uz: 'Kvarts', ru: 'Кварцевый' },
    { uz: 'Mexanik', ru: 'Механический' },
    { uz: 'Solar', ru: 'Солнечный' },
    { uz: 'Smart', ru: 'Смарт' },
  ]},
  { key_uz: 'Korpus materiali', key_ru: 'Материал корпуса', suggestions: [
    { uz: 'Po\'lat', ru: 'Сталь' },
    { uz: 'Titan', ru: 'Титан' },
    { uz: 'Oltin', ru: 'Золото' },
    { uz: 'Kumush', ru: 'Серебро' },
    { uz: 'Keramika', ru: 'Керамика' },
    { uz: 'Bronza', ru: 'Бронза' },
    { uz: 'Plastmassa', ru: 'Пластик' },
  ]},
  { key_uz: 'Qayish materiali', key_ru: 'Материал ремешка', suggestions: [
    { uz: 'Charm', ru: 'Кожа' },
    { uz: 'Po\'lat', ru: 'Сталь' },
    { uz: 'Rezina', ru: 'Резина' },
    { uz: 'Silikon', ru: 'Силикон' },
    { uz: 'Nato', ru: 'НАТО' },
    { uz: 'Mato', ru: 'Ткань' },
    { uz: 'Titan', ru: 'Титан' },
  ]},
  { key_uz: 'Korpus diametri', key_ru: 'Диаметр корпуса', suggestions: [
    { uz: '38 mm', ru: '38 мм' },
    { uz: '40 mm', ru: '40 мм' },
    { uz: '42 mm', ru: '42 мм' },
    { uz: '44 mm', ru: '44 мм' },
    { uz: '46 mm', ru: '46 мм' },
  ]},
  { key_uz: 'Qalinlik', key_ru: 'Толщина', suggestions: [
    { uz: '8 mm', ru: '8 мм' },
    { uz: '10 mm', ru: '10 мм' },
    { uz: '12 mm', ru: '12 мм' },
    { uz: '14 mm', ru: '14 мм' },
  ]},
  { key_uz: 'Suv himoyasi', key_ru: 'Водозащита', suggestions: [
    { uz: '3 ATM (30m)', ru: '3 ATM (30м)' },
    { uz: '5 ATM (50m)', ru: '5 ATM (50м)' },
    { uz: '10 ATM (100m)', ru: '10 ATM (100м)' },
    { uz: '20 ATM (200m)', ru: '20 ATM (200м)' },
    { uz: '30 ATM (300m)', ru: '30 ATM (300м)' },
  ]},
  { key_uz: 'Shisha', key_ru: 'Стекло', suggestions: [
    { uz: 'Sapfir', ru: 'Сапфировое' },
    { uz: 'Mineral', ru: 'Минеральное' },
    { uz: 'Akril', ru: 'Акриловое' },
    { uz: 'Hardlex', ru: 'Hardlex' },
  ]},
  { key_uz: 'Rang', key_ru: 'Цвет', suggestions: [
    { uz: 'Qora', ru: 'Чёрный' },
    { uz: 'Oq', ru: 'Белый' },
    { uz: 'Kumush', ru: 'Серебристый' },
    { uz: 'Oltin', ru: 'Золотой' },
    { uz: 'Ko\'k', ru: 'Синий' },
    { uz: 'Yashil', ru: 'Зелёный' },
    { uz: 'Jigarrang', ru: 'Коричневый' },
  ]},
  { key_uz: 'Vazn', key_ru: 'Вес', suggestions: [
    { uz: '80 g', ru: '80 г' },
    { uz: '100 g', ru: '100 г' },
    { uz: '120 g', ru: '120 г' },
    { uz: '150 g', ru: '150 г' },
    { uz: '180 g', ru: '180 г' },
  ]},
  { key_uz: 'Jins', key_ru: 'Пол', suggestions: [
    { uz: 'Erkak', ru: 'Мужской' },
    { uz: 'Ayol', ru: 'Женский' },
    { uz: 'Unisex', ru: 'Унисекс' },
  ]},
  { key_uz: 'Garantiya', key_ru: 'Гарантия', suggestions: [
    { uz: '1 yil', ru: '1 год' },
    { uz: '2 yil', ru: '2 года' },
    { uz: '3 yil', ru: '3 года' },
    { uz: '5 yil', ru: '5 лет' },
  ]},
  { key_uz: 'Ishlab chiqaruvchi davlat', key_ru: 'Страна производитель', suggestions: [
    { uz: 'Shveytsariya', ru: 'Швейцария' },
    { uz: 'Yaponiya', ru: 'Япония' },
    { uz: 'Germaniya', ru: 'Германия' },
    { uz: 'Italiya', ru: 'Италия' },
    { uz: 'Xitoy', ru: 'Китай' },
  ]},
];

const emptyRow = (): SpecRow => ({ key_uz: '', key_ru: '', value_uz: '', value_ru: '' });
const isEmptyRow = (r: SpecRow) => !r.key_uz.trim() && !r.key_ru.trim() && !r.value_uz.trim() && !r.value_ru.trim();

// Mavjud rasm (URL) yoki yangi yuklangan fayl preview'i bilan
type ImageEntry =
  | { kind: 'existing'; url: string }
  | { kind: 'new'; file: File; preview: string };

export default function ProductForm({ initial }: Props) {
  const { t } = useLang();
  const router = useRouter();
  const isEdit = !!initial;
  const fileRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [nameUz, setNameUz] = useState(initial?.name_uz || '');
  const [nameRu, setNameRu] = useState(initial?.name_ru || '');
  const [descriptionUz, setDescriptionUz] = useState(initial?.description_uz || '');
  const [descriptionRu, setDescriptionRu] = useState(initial?.description_ru || '');
  const [price, setPrice] = useState(initial?.price?.toString() || '');
  const [originalPrice, setOriginalPrice] = useState(initial?.original_price?.toString() || '');
  const [categoryIds, setCategoryIds] = useState<number[]>(
    (initial?.categories || []).map((c) => c.id),
  );
  const [brandId, setBrandId] = useState(initial?.brand_id?.toString() || '');
  const [stock, setStock] = useState(initial?.stock?.toString() || '10');
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [badge, setBadge] = useState(initial?.badge || '');
  const [images, setImages] = useState<ImageEntry[]>(
    (initial?.images || []).map((url) => ({ kind: 'existing' as const, url })),
  );
  const [specs, setSpecs] = useState<SpecRow[]>(() => {
    const normalized = normalizeSpecs(initial?.specifications);
    const rows: SpecRow[] = normalized.map((n) => ({
      key_uz: n.key_uz, key_ru: n.key_ru, value_uz: n.value_uz, value_ru: n.value_ru,
    }));
    return rows.length === 0 ? [emptyRow()] : [...rows, emptyRow()];
  });

  useEffect(() => {
    Promise.all([adminApi.getCategories(), adminApi.getBrands()])
      .then(([c, b]) => { setCategories(c); setBrands(b); })
      .catch(() => {});
  }, []);

  // Object URL'larni unmount paytida tozalash
  useEffect(() => {
    return () => {
      images.forEach((i) => { if (i.kind === 'new') URL.revokeObjectURL(i.preview); });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addSpec = () => setSpecs((s) => [...s, emptyRow()]);
  const updateSpec = (i: number, field: keyof SpecRow, val: string) =>
    setSpecs((s) => {
      const next = s.map((r, idx) => idx === i ? { ...r, [field]: val } : r);
      const last = next[next.length - 1];
      if (last && !isEmptyRow(last)) next.push(emptyRow());
      return next;
    });
  const updateSpecValuePair = (i: number, pair: SuggestionPair) =>
    setSpecs((s) => {
      const next = s.map((r, idx) => idx === i ? { ...r, value_uz: pair.uz, value_ru: pair.ru } : r);
      const last = next[next.length - 1];
      if (last && !isEmptyRow(last)) next.push(emptyRow());
      return next;
    });
  const removeSpec = (i: number) => setSpecs((s) => {
    const next = s.filter((_, idx) => idx !== i);
    return next.length === 0 ? [emptyRow()] : next;
  });
  const addPresetSpec = (preset: Preset) => {
    setSpecs((s) => {
      const exists = s.some((r) => r.key_uz.trim().toLowerCase() === preset.key_uz.toLowerCase());
      if (exists) return s;
      const cleaned = s.filter((r) => !isEmptyRow(r));
      return [
        ...cleaned,
        { key_uz: preset.key_uz, key_ru: preset.key_ru, value_uz: '', value_ru: '' },
        emptyRow(),
      ];
    });
    setTimeout(() => {
      const el = document.querySelector<HTMLInputElement>(`input[data-spec-value-uz="${preset.key_uz}"]`);
      el?.focus();
    }, 30);
  };
  const usedKeys = new Set(specs.map((s) => s.key_uz.trim().toLowerCase()).filter(Boolean));

  const removeImage = (i: number) => {
    setImages((prev) => {
      const next = [...prev];
      const removed = next.splice(i, 1)[0];
      if (removed?.kind === 'new') URL.revokeObjectURL(removed.preview);
      return next;
    });
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files?.length) return;
    const newEntries: ImageEntry[] = Array.from(files).map((file) => ({
      kind: 'new' as const,
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newEntries]);
    if (fileRef.current) fileRef.current.value = '';
  };

  // Backend prefiksini ko'rsatadi (full URL), lekin DB'ga nisbiy URL kerak.
  // Backend rasm yo'llari to'liq URL'ga aylantirilgan, biz aslini old_images uchun
  // qaytaramiz. Buning uchun original prefiksini olib tashlash kerak.
  const toRelativeUrl = (url: string) => {
    try {
      const u = new URL(url);
      return u.pathname;
    } catch {
      return url;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nameUz.trim()) { setError('Nomi (UZ) majburiy'); return; }
    if (!price || isNaN(Number(price))) { setError("Narx (so'm) majburiy"); return; }
    if (categoryIds.length === 0) { setError("Kamida 1 ta kategoriya tanlash kerak"); return; }
    if (!brandId) { setError('Brend tanlanmagan'); return; }
    if (images.length === 0) { setError('Kamida bitta rasm kerak'); return; }

    setSaving(true);
    try {
      const specifications: SpecItem[] = specs
        .filter((s) => (s.key_uz.trim() || s.key_ru.trim()) && (s.value_uz.trim() || s.value_ru.trim()))
        .map((s) => ({
          key_uz: s.key_uz.trim() || s.key_ru.trim(),
          key_ru: s.key_ru.trim() || s.key_uz.trim(),
          value_uz: s.value_uz.trim() || s.value_ru.trim(),
          value_ru: s.value_ru.trim() || s.value_uz.trim(),
        }));
      const oldImages = images
        .filter((i) => i.kind === 'existing')
        .map((i) => toRelativeUrl((i as { kind: 'existing'; url: string }).url));
      const imageFiles = images
        .filter((i): i is { kind: 'new'; file: File; preview: string } => i.kind === 'new')
        .map((i) => i.file);

      const payload = {
        name_uz: nameUz,
        name_ru: nameRu || nameUz,
        description_uz: descriptionUz,
        description_ru: descriptionRu || descriptionUz,
        price: parseFloat(price),
        original_price: originalPrice ? parseFloat(originalPrice) : null,
        category_ids: categoryIds,
        brand_id: parseInt(brandId),
        stock: parseInt(stock) || 0,
        featured,
        badge: badge || null,
        specifications,
        imageFiles,
        oldImages: isEdit ? oldImages : undefined,
      };

      if (isEdit && initial) {
        await adminApi.updateProduct(initial.id, payload);
      } else {
        await adminApi.createProduct(payload);
      }
      router.push('/admin/products');
    } catch (err) {
      setError((err as Error).message);
    } finally { setSaving(false); }
  };

  const BADGES = ['', 'Bestseller', 'Iconic', 'Limited', 'Exclusive', 'Rare', 'Sale', 'New'];

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-2">
        <button type="button" onClick={() => router.back()} className="ghost-btn p-2">
          <ArrowLeft size={16} />
        </button>
        <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text)' }}>
          {isEdit ? `${t.admin.edit}: ${initial?.name_uz}` : t.admin.newProduct}
        </h1>
      </div>

      {error && (
        <div className="glass-card p-3 text-sm" style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#FCA5A5' }}>{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Asosiy ma&apos;lumotlar
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider mb-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>{t.admin.nameUz} *</label>
                <input value={nameUz} onChange={(e) => setNameUz(e.target.value)} className="input-luxury" required />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider mb-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>{t.admin.nameRu}</label>
                <input value={nameRu} onChange={(e) => setNameRu(e.target.value)} className="input-luxury" />
              </div>

              <div className="col-span-2">
                <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {t.admin.category} * <span className="opacity-60 normal-case font-normal">({categoryIds.length} ta tanlandi)</span>
                </label>
                <div className="flex flex-wrap gap-2 p-3 rounded-xl" style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)' }}>
                  {categories.length === 0 && (
                    <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>Kategoriyalar yo&apos;q — avval kategoriya yarating</p>
                  )}
                  {categories.map((c) => {
                    const active = categoryIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategoryIds((prev) =>
                          active ? prev.filter((id) => id !== c.id) : [...prev, c.id],
                        )}
                        className="badge text-xs cursor-pointer transition-all"
                        style={{
                          background: active ? 'linear-gradient(135deg, var(--gold), var(--gold-bright))' : 'var(--bg-surface)',
                          color: active ? '#0A0A0A' : 'var(--text-muted)',
                          border: `1px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
                          padding: '0.4rem 0.7rem',
                          fontWeight: active ? 700 : 500,
                        }}
                      >
                        {c.name_uz}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-xs uppercase tracking-wider mb-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>{t.admin.brand} *</label>
                <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className="input-luxury" required>
                  <option value="">{t.admin.noneSelected}</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name_uz}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider mb-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {t.admin.price} *
                </label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: 'var(--gold)' }}>so&apos;m</span>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                    className="input-luxury pr-12" step="1000" min="0" required placeholder="1500000" />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider mb-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>{t.admin.originalPrice}</label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: 'var(--text-subtle)' }}>so&apos;m</span>
                  <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)}
                    className="input-luxury pr-12" step="1000" min="0" />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider mb-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>{t.admin.stock}</label>
                <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="input-luxury" min="0" />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider mb-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>{t.admin.badge}</label>
                <select value={badge} onChange={(e) => setBadge(e.target.value)} className="input-luxury">
                  {BADGES.map((b) => <option key={b} value={b}>{b || t.admin.noneSelected}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider mb-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>{t.admin.descriptionUz}</label>
                <textarea value={descriptionUz} onChange={(e) => setDescriptionUz(e.target.value)} className="input-luxury resize-none" rows={4} />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider mb-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>{t.admin.descriptionRu}</label>
                <textarea value={descriptionRu} onChange={(e) => setDescriptionRu(e.target.value)} className="input-luxury resize-none" rows={4} />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setFeatured(!featured)}
                className="w-10 h-5 rounded-full relative transition-all duration-200"
                style={{ background: featured ? 'linear-gradient(135deg, var(--gold), var(--gold-bright))' : 'var(--bg-surface3)', border: '1px solid var(--border)' }}>
                <div className="absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-200"
                  style={{ background: 'var(--text)', transform: featured ? 'translateX(20px)' : 'translateX(2px)' }} />
              </div>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.admin.featured}</span>
            </label>
          </div>

          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold text-sm uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {t.admin.specifications}
              </h3>
              <span className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>
                {specs.filter((s) => !isEmptyRow(s)).length} ta to&apos;ldirilgan
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Zap size={12} style={{ color: 'var(--gold)' }} />
                <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Tez qo&apos;shish — bosing va qiymatini tanlang (UZ + RU avtomatik)
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SPEC_PRESETS.map((p) => {
                  const used = usedKeys.has(p.key_uz.toLowerCase());
                  return (
                    <button
                      key={p.key_uz}
                      type="button"
                      disabled={used}
                      onClick={() => addPresetSpec(p)}
                      title={`${p.key_uz} / ${p.key_ru}`}
                      className="badge text-xs transition-all"
                      style={{
                        background: used ? 'var(--bg-surface3)' : 'var(--bg-surface)',
                        color: used ? 'var(--text-subtle)' : 'var(--text-muted)',
                        border: `1px solid ${used ? 'var(--border)' : 'var(--gold)'}`,
                        padding: '0.35rem 0.65rem',
                        opacity: used ? 0.5 : 1,
                        cursor: used ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {used ? '✓ ' : '+ '}{p.key_uz}
                    </button>
                  );
                })}
              </div>
            </div>

            <datalist id="spec-keys-uz-datalist">
              {SPEC_PRESETS.map((p) => <option key={p.key_uz} value={p.key_uz} />)}
            </datalist>
            <datalist id="spec-keys-ru-datalist">
              {SPEC_PRESETS.map((p) => <option key={p.key_ru} value={p.key_ru} />)}
            </datalist>

            <div className="space-y-3 pt-1">
              {specs.map((row, i) => {
                const preset = SPEC_PRESETS.find(
                  (p) => p.key_uz.toLowerCase() === row.key_uz.trim().toLowerCase()
                    || p.key_ru.toLowerCase() === row.key_ru.trim().toLowerCase(),
                );
                const isFilled = !isEmptyRow(row);
                return (
                  <div
                    key={i}
                    className="p-3 rounded-lg space-y-2"
                    style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)' }}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider mb-1 font-semibold" style={{ color: 'var(--text-subtle)' }}>
                          Kalit (UZ)
                        </label>
                        <input
                          value={row.key_uz}
                          onChange={(e) => updateSpec(i, 'key_uz', e.target.value)}
                          placeholder="masalan: Mexanizm"
                          list="spec-keys-uz-datalist"
                          className="input-luxury text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider mb-1 font-semibold" style={{ color: 'var(--text-subtle)' }}>
                          Ключ (RU)
                        </label>
                        <input
                          value={row.key_ru}
                          onChange={(e) => updateSpec(i, 'key_ru', e.target.value)}
                          placeholder="например: Механизм"
                          list="spec-keys-ru-datalist"
                          className="input-luxury text-sm"
                        />
                      </div>
                    </div>

                    {preset?.suggestions && (
                      <div className="flex flex-wrap gap-1">
                        {preset.suggestions.map((sg) => {
                          const active = row.value_uz.trim().toLowerCase() === sg.uz.toLowerCase();
                          return (
                            <button
                              key={sg.uz}
                              type="button"
                              onClick={() => updateSpecValuePair(i, sg)}
                              className="text-[11px] px-2 py-0.5 rounded-full transition-all"
                              style={{
                                background: active ? 'linear-gradient(135deg, var(--gold), var(--gold-bright))' : 'var(--bg-surface)',
                                color: active ? '#0A0A0A' : 'var(--text-muted)',
                                border: `1px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
                                fontWeight: active ? 700 : 500,
                              }}
                            >
                              {sg.uz}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider mb-1 font-semibold" style={{ color: 'var(--text-subtle)' }}>
                          Qiymat (UZ)
                        </label>
                        <input
                          value={row.value_uz}
                          onChange={(e) => updateSpec(i, 'value_uz', e.target.value)}
                          placeholder={preset?.suggestions ? `masalan: ${preset.suggestions[0].uz}` : 'qiymat'}
                          data-spec-value-uz={row.key_uz}
                          className="input-luxury text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider mb-1 font-semibold" style={{ color: 'var(--text-subtle)' }}>
                          Значение (RU)
                        </label>
                        <input
                          value={row.value_ru}
                          onChange={(e) => updateSpec(i, 'value_ru', e.target.value)}
                          placeholder={preset?.suggestions ? `например: ${preset.suggestions[0].ru}` : 'значение'}
                          className="input-luxury text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSpec(i)}
                        className="ghost-btn p-2"
                        style={{ color: '#FCA5A5', visibility: isFilled ? 'visible' : 'hidden' }}
                        aria-label="O'chirish"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={addSpec}
                className="ghost-btn text-xs py-1.5 px-3 w-full justify-center"
                style={{ borderStyle: 'dashed' }}
              >
                <Plus size={12} /> Qo&apos;lda yangi qator
              </button>
              <p className="text-[10px] text-center" style={{ color: 'var(--text-subtle)' }}>
                Maslahat: RU bo&apos;sh qoldirilsa, UZ qiymati avtomatik nusxa qilinadi
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass-card p-5">
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
              {t.admin.images} *
            </h3>

            <div
              className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 mb-4"
              style={{ borderColor: 'var(--border)' }}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFileSelect(e.dataTransfer.files); }}
            >
              <Upload size={22} className="mx-auto mb-2" style={{ color: 'var(--text-subtle)' }} />
              <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>
                Fayl yuklash yoki tortib qo&apos;ying
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>JPG, PNG, WebP · max 5MB · 10 ta gacha</p>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)} />
            </div>

            <div className="space-y-2">
              {images.map((img, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--bg-surface2)' }}>
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0" style={{ background: 'var(--bg-surface3)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.kind === 'existing' ? img.url : img.preview} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {img.kind === 'new' ? img.file.name : (img.url.split('/').pop() || img.url)}
                    </p>
                    <p className="text-[10px]" style={{ color: img.kind === 'new' ? 'var(--gold)' : 'var(--text-subtle)' }}>
                      {img.kind === 'new' ? 'Yangi' : 'Mavjud'}
                    </p>
                  </div>
                  <button type="button" onClick={() => removeImage(i)} className="ghost-btn p-1.5" style={{ color: '#FCA5A5' }}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            {images.length === 0 && (
              <p className="text-xs text-center py-3" style={{ color: 'var(--text-subtle)' }}>Rasmlar yo&apos;q</p>
            )}
          </div>

          <button type="submit" disabled={saving} className="gold-btn w-full justify-center">
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {t.admin.save}...
              </span>
            ) : <><Save size={15} /> {t.admin.save}</>}
          </button>

          <button type="button" onClick={() => router.back()} className="outline-btn w-full justify-center">
            {t.admin.cancel}
          </button>
        </div>
      </div>
    </form>
  );
}
