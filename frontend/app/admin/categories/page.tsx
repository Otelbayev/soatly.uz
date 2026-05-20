'use client';
import { useEffect, useState, useRef, FormEvent } from 'react';
import Image from 'next/image';
import { adminApi } from '@/lib/api';
import { Category } from '@/lib/types';
import { useLang } from '@/context/LanguageContext';
import { Plus, Trash2, Save, X, Edit2, Upload } from 'lucide-react';

type FormState = {
  slug: string;
  name_uz: string; name_ru: string;
  description_uz: string; description_ru: string;
};
const EMPTY: FormState = { slug: '', name_uz: '', name_ru: '', description_uz: '', description_ru: '' };

const slugify = (v: string) => v.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

export default function AdminCategoriesPage() {
  const { t } = useLang();
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    adminApi.getCategories().then(setItems).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    return () => { if (iconPreview && iconPreview.startsWith('blob:')) URL.revokeObjectURL(iconPreview); };
  }, [iconPreview]);

  const openNew = () => {
    setEditing(null); setForm(EMPTY); setIconFile(null); setIconPreview('');
    setShowForm(true); setError('');
  };
  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({
      slug: c.slug,
      name_uz: c.name_uz, name_ru: c.name_ru || '',
      description_uz: c.description_uz || '', description_ru: c.description_ru || '',
    });
    setIconFile(null); setIconPreview(c.icon || '');
    setShowForm(true); setError('');
  };
  const close = () => { setShowForm(false); setEditing(null); setIconFile(null); setIconPreview(''); setError(''); };

  const handleIconSelect = (files: FileList | null) => {
    if (!files?.length) return;
    const f = files[0];
    if (iconPreview.startsWith('blob:')) URL.revokeObjectURL(iconPreview);
    setIconFile(f);
    setIconPreview(URL.createObjectURL(f));
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.slug || !form.name_uz) { setError('Slug va Nomi (UZ) majburiy'); return; }
    setSaving(true);
    try {
      const payload = {
        slug: form.slug,
        name_uz: form.name_uz,
        name_ru: form.name_ru || form.name_uz,
        description_uz: form.description_uz,
        description_ru: form.description_ru,
        iconFile,
      };
      if (editing) {
        const updated = await adminApi.updateCategory(editing.id, payload);
        setItems((prev) => prev.map((c) => c.id === editing.id ? updated : c));
      } else {
        const created = await adminApi.createCategory(payload);
        setItems((prev) => [...prev, created]);
      }
      close();
    } catch (err) { setError((err as Error).message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (c: Category) => {
    if (!confirm(`${t.admin.confirmDelete}\n"${c.name_uz}"`)) return;
    setDeleting(c.id);
    try {
      await adminApi.deleteCategory(c.id);
      setItems((prev) => prev.filter((cat) => cat.id !== c.id));
    } catch (err) { alert((err as Error).message); }
    finally { setDeleting(null); }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text)' }}>{t.admin.categories}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{items.length} ta kategoriya</p>
        </div>
        <button onClick={openNew} className="gold-btn"><Plus size={14} /> {t.admin.newCategory}</button>
      </div>

      {showForm && (
        <div className="glass-card p-6 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-semibold" style={{ color: 'var(--text)' }}>
              {editing ? `${t.admin.edit}: ${editing.name_uz}` : t.admin.newCategory}
            </h2>
            <button onClick={close} className="ghost-btn p-1.5"><X size={15} /></button>
          </div>

          {error && <p className="text-sm mb-4" style={{ color: '#FCA5A5' }}>{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider mb-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>{t.admin.nameUz} *</label>
                <input
                  value={form.name_uz}
                  onChange={(e) => setForm({ ...form, name_uz: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })}
                  className="input-luxury" required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider mb-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>{t.admin.nameRu}</label>
                <input value={form.name_ru} onChange={(e) => setForm({ ...form, name_ru: e.target.value })} className="input-luxury" />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider mb-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>{t.admin.slug} *</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} className="input-luxury font-mono text-sm" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider mb-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>{t.admin.descriptionUz}</label>
                <input value={form.description_uz} onChange={(e) => setForm({ ...form, description_uz: e.target.value })} className="input-luxury" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider mb-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>{t.admin.descriptionRu}</label>
                <input value={form.description_ru} onChange={(e) => setForm({ ...form, description_ru: e.target.value })} className="input-luxury" />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: 'var(--text-muted)' }}>
                Kategoriya rasmi
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                  style={{ background: 'var(--bg-surface2)', border: '1px solid var(--border)' }}>
                  {iconPreview
                    ? (iconPreview.startsWith('blob:')
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={iconPreview} alt="preview" className="w-full h-full object-cover" />
                        : <Image src={iconPreview} alt="icon" width={64} height={64} className="w-full h-full object-cover" />)
                    : <span className="text-2xl">📁</span>}
                </div>
                <div className="flex-1 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200"
                  style={{ borderColor: 'var(--border)' }}
                  onClick={() => fileRef.current?.click()}>
                  <Upload size={18} className="mx-auto mb-1" style={{ color: 'var(--text-subtle)' }} />
                  <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    {iconFile ? iconFile.name : 'Rasm tanlash'}
                  </p>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                    onChange={(e) => handleIconSelect(e.target.files)} />
                </div>
                {(iconFile || (iconPreview && !iconPreview.startsWith('blob:'))) && (
                  <button type="button" onClick={() => {
                    if (iconPreview.startsWith('blob:')) URL.revokeObjectURL(iconPreview);
                    setIconFile(null); setIconPreview('');
                  }}
                    className="ghost-btn p-2" style={{ color: '#FCA5A5' }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={saving} className="gold-btn">
                {saving ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Save size={14} />}
                {t.admin.save}
              </button>
              <button type="button" onClick={close} className="outline-btn">{t.admin.cancel}</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 56 }}>Rasm</th>
              <th>{t.admin.nameUz}</th>
              <th>{t.admin.nameRu}</th>
              <th>{t.admin.slug}</th>
              <th>{t.admin.actions}</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j}><div className="h-4 rounded animate-pulse" style={{ background: 'var(--bg-surface2)' }} /></td>
                    ))}
                  </tr>
                ))
              : items.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center" style={{ background: 'var(--bg-surface2)' }}>
                        {c.icon
                          ? <Image src={c.icon} alt={c.name_uz} width={40} height={40} className="w-full h-full object-cover" />
                          : <span className="text-lg">📁</span>}
                      </div>
                    </td>
                    <td><span className="font-medium" style={{ color: 'var(--text)' }}>{c.name_uz}</span></td>
                    <td><span style={{ color: 'var(--text-muted)' }}>{c.name_ru || '—'}</span></td>
                    <td><code className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-surface2)', color: 'var(--gold)' }}>{c.slug}</code></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(c)} className="ghost-btn p-2 text-xs"><Edit2 size={13} /></button>
                        <button onClick={() => handleDelete(c)} disabled={deleting === c.id}
                          className="ghost-btn p-2 text-xs" style={{ color: '#FCA5A5' }}>
                          {deleting === c.id
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

        {!loading && items.length === 0 && (
          <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Kategoriyalar yo&apos;q</div>
        )}
      </div>
    </div>
  );
}
