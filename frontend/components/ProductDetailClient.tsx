"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { api, isAbortError } from "@/lib/api";
import { Product, pick, normalizeSpecs } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useLang } from "@/context/LanguageContext";
import Badge from "@/components/ui/Badge";
import {
  ShoppingCart,
  ArrowLeft,
  Shield,
  Truck,
  Award,
  ChevronRight,
  ChevronLeft,
  Minus,
  Plus,
  Check,
  X,
  ZoomIn,
} from "lucide-react";

interface Props {
  id: string;
}

export default function ProductDetailClient({ id }: Props) {
  const router = useRouter();
  const { add } = useCart();
  const { format } = useCurrency();
  const { t, locale } = useLang();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    api
      .getProduct(id, { signal: ctrl.signal })
      .then((p) => {
        if (ctrl.signal.aborted) return;
        setProduct(p);
        setLoading(false);
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        setLoading(false);
      });
    return () => ctrl.abort();
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const images = product?.images || [];
  const openLightbox = (i: number) => {
    setLightboxIdx(i);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const prevImg = () =>
    setLightboxIdx((i) => (i - 1 + images.length) % images.length);
  const nextImg = () =>
    setLightboxIdx((i) => (i + 1) % images.length);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") prevImg();
      else if (e.key === "ArrowRight") nextImg();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, images.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    const threshold = 50;
    if (touchDeltaX.current > threshold) prevImg();
    else if (touchDeltaX.current < -threshold) nextImg();
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <div
          className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center gap-4">
        <p className="text-xl" style={{ color: "var(--text-muted)" }}>
          Watch not found
        </p>
        <Link href="/products" className="gold-btn">
          {t.cart.browse}
        </Link>
      </div>
    );
  }

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null;

  const name        = pick(product, 'name', locale);
  const description = pick(product, 'description', locale);
  const brandName    = pick(product, 'brand_name', locale);
  const productCategories = product.categories || [];
  const specs = normalizeSpecs(product.specifications);

  return (
    <div className="min-h-screen pt-24">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav
          className="flex items-center gap-2 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <Link href="/" className="hover:text-gold-light transition-colors" style={{ color: "inherit" }}>
            {t.nav.home}
          </Link>
          <ChevronRight size={12} style={{ color: "var(--border)" }} />
          <Link href="/products" className="hover:text-gold-light transition-colors" style={{ color: "inherit" }}>
            {t.nav.collection}
          </Link>
          <ChevronRight size={12} style={{ color: "var(--border)" }} />
          <span style={{ color: "var(--text)" }}>{name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">
          {/* Images */}
          <div className="space-y-4">
            <div
              className="group relative aspect-square glass-card overflow-hidden rounded-2xl cursor-zoom-in"
              onClick={() => images[activeImg] && openLightbox(activeImg)}
              role={images[activeImg] ? "button" : undefined}
              aria-label={images[activeImg] ? "Rasmni kattalashtirish" : undefined}
            >
              {product.images?.[activeImg] ? (
                <Image
                  src={product.images[activeImg]}
                  alt={name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: "var(--bg-surface2)" }}>
                  <span style={{ color: "var(--text-subtle)" }}>No image</span>
                </div>
              )}
              {product.images?.[activeImg] && (
                <div
                  className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur"
                  style={{ background: "rgba(0,0,0,0.5)", color: "var(--gold)" }}
                  aria-hidden
                >
                  <ZoomIn size={16} />
                </div>
              )}
              {product.badge && (
                <div className="absolute top-4 left-4">
                  <Badge label={product.badge} />
                </div>
              )}
            </div>

            {product.images?.length > 1 && (
              <div className="flex gap-3 flex-wrap">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className="relative w-20 h-20 rounded-xl overflow-hidden transition-all duration-200"
                    style={{
                      border: `2px solid ${i === activeImg ? "var(--gold)" : "var(--border)"}`,
                      boxShadow: i === activeImg ? "var(--shadow-gold)" : undefined,
                    }}
                  >
                    <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                {brandName && (
                  <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--gold)" }}>
                    {brandName}
                  </p>
                )}
                {productCategories.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {productCategories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/categories/${c.slug}`}
                        className="text-xs px-2 py-0.5 rounded-full transition-colors hover:opacity-80"
                        style={{
                          color: 'var(--text-muted)',
                          background: 'var(--bg-surface2)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {pick(c, 'name', locale)}
                      </Link>
                    ))}
                  </div>
                )}
                {product.badge && <Badge label={product.badge} />}
              </div>
              <h1 className="font-heading text-3xl lg:text-4xl font-bold mb-4 leading-tight" style={{ color: "var(--text)" }}>
                {name}
              </h1>
              <p className="leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {description}
              </p>
            </div>

            {/* Price */}
            <div className="glass-card p-5">
              <div className="flex items-end gap-4 mb-1 flex-wrap">
                <span className="font-heading text-3xl font-bold gold-text">
                  {format(product.price)}
                </span>
                {product.original_price && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg line-through" style={{ color: "var(--text-subtle)" }}>
                      {format(product.original_price)}
                    </span>
                    <span className="badge badge-sale">-{discount}%</span>
                  </div>
                )}
              </div>
            </div>

            {product.stock <= 5 && product.stock > 0 && (
              <div className="flex items-center gap-2 text-sm" style={{ color: "#FCD34D" }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#FCD34D" }} />
                Only {product.stock} left in stock
              </div>
            )}
            {product.stock === 0 && (
              <p className="text-sm font-medium" style={{ color: "#FCA5A5" }}>{t.products.outOfStock}</p>
            )}

            {product.stock > 0 && (
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-3 glass-card px-4 py-2.5">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-semibold w-6 text-center" style={{ color: "var(--text)" }}>
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  className="gold-btn flex-1 justify-center"
                  style={added ? { background: "#16a34a" } : undefined}
                >
                  {added ? (
                    <>
                      <Check size={16} /> {t.products.addedToCart}
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} /> {t.products.addToCart}
                    </>
                  )}
                </button>
              </div>
            )}

            <Link
              href="/cart"
              className={`outline-btn w-full justify-center ${product.stock === 0 ? "opacity-50 pointer-events-none" : ""}`}
            >
              {t.products.viewCart}
            </Link>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Shield, label: "Sertifikatlangan" },
                { icon: Award, label: "Kafolat" },
                { icon: Truck, label: "Bepul yetkazib berish" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="glass-card p-3 text-center">
                  <Icon size={18} className="mx-auto mb-1.5" style={{ color: "var(--gold)" }} />
                  <p className="text-[10px] leading-tight" style={{ color: "var(--text-muted)" }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {specs.length > 0 && (
              <div>
                <h3 className="font-heading font-semibold text-lg mb-4" style={{ color: "var(--text)" }}>
                  {t.products.specifications}
                </h3>
                <div className="glass-card p-4 divide-y" style={{ borderColor: "var(--border)" }}>
                  {specs.map((s, idx) => {
                    const k = locale === 'ru' ? (s.key_ru || s.key_uz) : (s.key_uz || s.key_ru);
                    const v = locale === 'ru' ? (s.value_ru || s.value_uz) : (s.value_uz || s.value_ru);
                    return (
                      <div key={idx} className="flex justify-between py-3 first:pt-0 last:pb-0">
                        <span className="text-sm capitalize" style={{ color: "var(--text-muted)" }}>
                          {k.replace(/_/g, " ")}
                        </span>
                        <span className="text-sm font-medium text-right max-w-xs" style={{ color: "var(--text)" }}>
                          {v}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16">
          <button onClick={() => router.back()} className="outline-btn">
            <ArrowLeft size={15} /> {t.admin.back}
          </button>
        </div>
      </div>

      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full flex items-center justify-center transition-colors z-10"
            style={{ background: "rgba(255,255,255,0.08)", color: "var(--text)", border: "1px solid var(--border)" }}
            aria-label="Yopish"
          >
            <X size={20} />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImg(); }}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors z-10"
                style={{ background: "rgba(255,255,255,0.08)", color: "var(--text)", border: "1px solid var(--border)" }}
                aria-label="Oldingi rasm"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImg(); }}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors z-10"
                style={{ background: "rgba(255,255,255,0.08)", color: "var(--text)", border: "1px solid var(--border)" }}
                aria-label="Keyingi rasm"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          <div
            className="relative w-full h-full flex items-center justify-center px-4 py-16 sm:py-20"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="relative w-full max-w-5xl h-full">
              <Image
                key={lightboxIdx}
                src={images[lightboxIdx]}
                alt={`${name} — ${lightboxIdx + 1}`}
                fill
                sizes="100vw"
                className="object-contain select-none animate-[fadeIn_0.2s_ease-out]"
                priority
                draggable={false}
              />
            </div>
          </div>

          {images.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-full"
              style={{ background: "rgba(0,0,0,0.5)", border: "1px solid var(--border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIdx(i)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    background: i === lightboxIdx ? "var(--gold)" : "var(--border)",
                    transform: i === lightboxIdx ? "scale(1.4)" : undefined,
                  }}
                  aria-label={`Rasm ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
