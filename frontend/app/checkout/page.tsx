'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useLang } from '@/context/LanguageContext';
import { pick } from '@/lib/types';
import { api } from '@/lib/api';
import { Check, Phone, User, MapPin, Send, MessageSquare } from 'lucide-react';

interface CheckoutForm {
  name: string;
  phone: string;
  address: string;
  telegram: string;
  notes: string;
}

const EMPTY_FORM: CheckoutForm = {
  name: '', phone: '+998 ', address: '', telegram: '', notes: '',
};

const normalizePhoneInput = (raw: string): string => {
  // Faqat raqamlar + boshidagi +
  const hasPlus = raw.startsWith('+');
  const digits = raw.replace(/\D/g, '');
  if (!digits) return hasPlus ? '+' : '';
  // O'zbek raqamlari uchun chiroyli formatlash: +998 90 123 45 67
  if (digits.startsWith('998') && digits.length <= 12) {
    const rest = digits.slice(3);
    const parts = [
      rest.slice(0, 2),
      rest.slice(2, 5),
      rest.slice(5, 7),
      rest.slice(7, 9),
    ].filter(Boolean);
    return '+998' + (parts.length ? ' ' + parts.join(' ') : '');
  }
  return (hasPlus ? '+' : '') + digits;
};

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const { format } = useCurrency();
  const { locale, t } = useLang();
  const [form, setForm] = useState<CheckoutForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});
  const [orderId, setOrderId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const validate = (): boolean => {
    const errs: Partial<CheckoutForm> = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = t.checkout.errors.name;
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 9) errs.phone = t.checkout.errors.phone;
    if (!form.address.trim()) errs.address = t.checkout.errors.line1;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await api.createOrder({
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim(),
        customer_address: form.address.trim(),
        customer_telegram: form.telegram.trim().replace(/^@/, '') || undefined,
        notes: form.notes.trim() || undefined,
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      });
      setOrderId(result.id);
      clear();
      setConfirmed(true);
    } catch (err) {
      setServerError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed) {
    return (
      <div className="min-h-screen pt-24">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="glass-card p-10 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
              <Check size={28} className="text-green-400" />
            </div>
            <h2 className="font-heading text-3xl text-text font-bold mb-3">{t.checkout.orderConfirmed}</h2>
            <p className="text-text-muted mb-2">{t.checkout.orderNumber} #{orderId}</p>
            <p className="text-text-muted text-sm mb-8">
              Tez orada siz bilan bog&apos;lanamiz. Tashrifingiz uchun rahmat!
            </p>
            <Link href="/products" className="gold-btn inline-flex">
              {t.checkout.continueShop}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center gap-4">
        <p className="text-text-muted text-xl">{t.checkout.emptyCart}</p>
        <Link href="/products" className="gold-btn">{t.checkout.browseCta}</Link>
      </div>
    );
  }

  const field = (
    key: keyof CheckoutForm,
    label: string,
    icon: React.ReactNode,
    placeholder = '',
    onChange?: (v: string) => string,
  ) => (
    <div>
      <label className="block text-text-muted text-xs uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-subtle)' }}>{icon}</span>
        <input
          type="text"
          value={form[key]}
          onChange={(e) => {
            const v = onChange ? onChange(e.target.value) : e.target.value;
            setForm({ ...form, [key]: v });
          }}
          placeholder={placeholder}
          className={`input-luxury pl-9 ${errors[key] ? 'border-red-500/60 focus:border-red-500' : ''}`}
        />
      </div>
      {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-heading text-3xl font-bold mb-8" style={{ color: 'var(--text)' }}>
          {t.checkout.title}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="glass-card p-7 space-y-5 animate-fade-in" noValidate>
              <h2 className="font-heading text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
                {t.checkout.orderSummary}
              </h2>

              {field('name', t.checkout.fullName, <User size={14} />, 'Ali Valiyev')}
              {field('phone', t.checkout.phone, <Phone size={14} />, t.checkout.phonePlaceholder,
                (v) => normalizePhoneInput(v))}
              {field('address', t.checkout.address, <MapPin size={14} />, t.checkout.addressPlaceholder)}
              {field('telegram', t.checkout.telegram, <Send size={14} />, 'username')}

              <div>
                <label className="block text-text-muted text-xs uppercase tracking-wider mb-1.5">{t.checkout.notes}</label>
                <div className="relative">
                  <MessageSquare size={14} className="absolute left-3 top-3 pointer-events-none" style={{ color: 'var(--text-subtle)' }} />
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className="input-luxury pl-9 resize-none"
                    placeholder="..."
                  />
                </div>
              </div>

              {serverError && (
                <p className="text-red-400 text-sm">{serverError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="gold-btn w-full justify-center mt-2"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ...
                  </span>
                ) : (
                  <>{t.checkout.submit} · {format(total)}</>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-28">
              <h3 className="font-heading text-text font-semibold text-lg mb-5">{t.cart.orderSummary}</h3>
              <div className="space-y-4 mb-5">
                {items.map(({ product, quantity }) => {
                  const name = pick(product, 'name', locale);
                  const cat = product.categories?.[0]
                    ? pick(product.categories[0], 'name', locale)
                    : '';
                  return (
                    <div key={product.id} className="flex gap-3">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-bg-surface2 shrink-0">
                        {product.images?.[0] && (
                          <Image src={product.images[0]} alt={name} fill className="object-cover" sizes="56px" />
                        )}
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold-gradient rounded-full text-bg text-[9px] font-bold flex items-center justify-center">
                          {quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-text text-xs font-medium line-clamp-1">{name}</p>
                        <p className="text-text-muted text-[10px]">{cat}</p>
                        <p className="text-gold-light text-xs font-semibold mt-0.5">
                          {format(Number(product.price) * quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="gold-divider mb-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-text-muted">{t.cart.subtotal}</span><span className="text-text">{format(total)}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">{t.cart.shipping}</span><span className="text-green-400">{t.cart.free}</span></div>
              </div>
              <div className="gold-divider my-4" />
              <div className="flex justify-between items-center">
                <span className="text-text font-semibold">{t.cart.total}</span>
                <span className="font-heading text-gold-light text-xl font-bold">
                  {format(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
