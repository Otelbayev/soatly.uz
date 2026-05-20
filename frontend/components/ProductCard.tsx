'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import { Product, pick } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useLang } from '@/context/LanguageContext';
import Badge from './ui/Badge';
import { useState } from 'react';

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { format } = useCurrency();
  const { t, locale } = useLang();
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const name = pick(product, 'name', locale);
  const categoryName = product.categories?.[0]
    ? pick(product.categories[0], 'name', locale)
    : '';
  const brandName    = pick(product, 'brand_name', locale);

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    add(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="glass-card overflow-hidden">
        <div className="relative aspect-square product-image-wrap rounded-t-none rounded-b-none overflow-hidden bg-bg-surface2">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-107"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-text-subtle text-sm">No image</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.badge && <Badge label={product.badge} />}
            {discount && <span className="badge badge-sale">-{discount}%</span>}
          </div>

          <button
            onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted); }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-bg/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-bg"
            aria-label="wishlist"
          >
            <Heart size={14} className={wishlisted ? 'fill-red-400 text-red-400' : 'text-text-muted'} />
          </button>

          <button
            onClick={handleAdd}
            className={`absolute bottom-3 left-3 right-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 opacity-0 group-hover:opacity-100 ${
              added ? 'bg-green-600/90 text-white' : 'bg-gold-gradient text-bg hover:shadow-gold'
            }`}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? t.products.outOfStock : added ? t.products.addedToCart : t.products.quickAdd}
          </button>
        </div>

        <div className="p-4 pt-4">
          {brandName && (
            <p className="text-gold text-[10px] font-bold uppercase tracking-[0.15em] mb-1">{brandName}</p>
          )}
          <h3 className="font-heading text-text font-semibold text-base leading-snug mb-2 group-hover:gold-text transition-all duration-200 line-clamp-1">
            {name}
          </h3>
          <p className="text-text-muted text-xs line-clamp-1 mb-3">
            {categoryName} {(() => {
              const s = product.specifications;
              if (!s) return '';
              if (Array.isArray(s)) {
                const d = s.find((r) => /diamet|диамет/i.test(r.key_uz) || /diamet|диамет/i.test(r.key_ru));
                return d ? `• ${d.value_uz || d.value_ru}` : '';
              }
              const k = Object.keys(s).find((kk) => /diamet|диамет|case_diameter/i.test(kk));
              return k ? `• ${s[k]}` : '';
            })()}
          </p>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-heading text-gold-light text-lg font-bold">{format(product.price)}</span>
              {product.original_price && (
                <span className="text-text-subtle text-xs line-through ml-2">{format(product.original_price)}</span>
              )}
            </div>
            <button onClick={handleAdd}
              className="w-9 h-9 rounded-full border border-gold/40 flex items-center justify-center text-gold hover:bg-gold hover:text-bg transition-all duration-200"
              aria-label="cart">
              <ShoppingCart size={15} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
