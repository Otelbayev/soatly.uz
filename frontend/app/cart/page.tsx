'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useLang } from '@/context/LanguageContext';
import { pick } from '@/lib/types';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { items, total, count, remove, update } = useCart();
  const { format } = useCurrency();
  const { t, locale } = useLang();

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-20 h-20 rounded-full bg-bg-surface border border-border flex items-center justify-center">
          <ShoppingBag size={32} className="text-gold" />
        </div>
        <div className="text-center">
          <h1 className="font-heading text-3xl text-text font-bold mb-2">{t.cart.empty}</h1>
          <p className="text-text-muted mb-8">{t.cart.emptyHint}</p>
          <Link href="/products" className="gold-btn">{t.cart.browse}</Link>
        </div>
      </div>
    );
  }

  const grandTotal = total;

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <h1 className="font-heading text-2xl sm:text-3xl text-text font-bold mb-1.5">{t.cart.title}</h1>
        <p className="text-text-muted text-sm mb-6 sm:mb-10">{count} {t.cart.items}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => {
              const name = pick(product, 'name', locale);
              const categoryName = product.categories?.[0]
                ? pick(product.categories[0], 'name', locale)
                : '';
              return (
              <div key={product.id} className="glass-card p-3 sm:p-5 flex gap-3 sm:gap-5">
                {/* Image */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-bg-surface2 shrink-0">
                  {product.images?.[0] ? (
                    <Image src={product.images[0]} alt={name} fill className="object-cover" sizes="96px" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-text-subtle text-xs">?</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${product.id}`}
                    className="text-text font-heading font-semibold text-base hover:gold-text transition-all line-clamp-1"
                  >
                    {name}
                  </Link>
                  <p className="text-text-muted text-xs mt-0.5 mb-3">{categoryName}</p>

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    {/* Qty */}
                    <div className="flex items-center gap-2 bg-bg-surface2 rounded-lg px-3 py-1.5">
                      <button
                        onClick={() => update(product.id, quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-gold transition-colors"
                        aria-label="Decrease"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-text text-sm font-semibold w-4 text-center">{quantity}</span>
                      <button
                        onClick={() => update(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-gold transition-colors disabled:opacity-40"
                        aria-label="Increase"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-heading text-gold-light font-bold">
                        {format(Number(product.price) * quantity)}
                      </span>
                      <button
                        onClick={() => remove(product.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-text-subtle hover:text-red-400 hover:bg-red-400/10 transition-all"
                        aria-label="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card p-5 sm:p-6 lg:sticky lg:top-28">
              <h2 className="font-heading text-text font-semibold text-xl mb-6">{t.cart.orderSummary}</h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">{t.cart.subtotal}</span>
                  <span className="text-text">{format(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">{t.cart.shipping}</span>
                  <span className="text-green-400 font-medium">{t.cart.free}</span>
                </div>
              </div>

              <div className="gold-divider my-5" />

              <div className="flex justify-between items-end mb-6">
                <span className="text-text font-semibold">{t.cart.total}</span>
                <p className="font-heading text-gold-light text-2xl font-bold">
                  {format(grandTotal)}
                </p>
              </div>

              <Link href="/checkout" className="gold-btn w-full justify-center text-sm">
                {t.cart.checkout} <ArrowRight size={15} />
              </Link>

              <Link href="/products" className="outline-btn w-full justify-center mt-3 text-sm">
                {t.cart.continueShopping}
              </Link>

              {/* Secure badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-text-subtle text-xs">
                <span>🔒</span>
                <span>{t.cart.secure}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
