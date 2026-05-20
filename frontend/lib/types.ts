import { Locale } from './i18n';

export interface BilingualEntity {
  id: number;
  slug: string;
  name_uz: string;
  name_ru: string;
  description_uz: string;
  description_ru: string;
  icon: string;
}

export type Category = BilingualEntity;
export type Brand    = BilingualEntity;

export interface ProductCategoryRef {
  id: number;
  slug: string;
  name_uz: string;
  name_ru: string;
}

export interface SpecItem {
  key_uz: string;
  key_ru: string;
  value_uz: string;
  value_ru: string;
}

export function normalizeSpecs(raw: SpecItem[] | Record<string, string> | undefined | null): SpecItem[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .filter((r) => r && (r.key_uz || r.key_ru))
      .map((r) => ({
        key_uz: r.key_uz || r.key_ru || '',
        key_ru: r.key_ru || r.key_uz || '',
        value_uz: r.value_uz || r.value_ru || '',
        value_ru: r.value_ru || r.value_uz || '',
      }));
  }
  return Object.entries(raw).map(([k, v]) => ({
    key_uz: k,
    key_ru: k,
    value_uz: String(v),
    value_ru: String(v),
  }));
}

export interface Product {
  id: number;
  name_uz: string;
  name_ru: string;
  description_uz: string;
  description_ru: string;
  /** UZS so'm */
  price: number;
  /** Eski narx (UZS so'm), null bo'lishi mumkin */
  original_price: number | null;
  specifications: SpecItem[] | Record<string, string>;
  images: string[];
  /** Mahsulot bir nechta kategoriyaga tegishli bo'lishi mumkin */
  categories: ProductCategoryRef[];
  brand_id: number | null;
  brand_slug: string | null;
  brand_name_uz: string | null;
  brand_name_ru: string | null;
  stock: number;
  featured: boolean;
  badge: string | null;
  created_at: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'sold' | 'cancelled';

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  customer_telegram: string | null;
  notes: string | null;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface OrderPayload {
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  customer_telegram?: string;
  notes?: string;
  items: { product_id: number; quantity: number }[];
}

export interface OrderStats {
  pending: number;
  sold: number;
  cancelled: number;
  total: number;
  revenue: number;
}

export interface ProductInput {
  name_uz: string;
  name_ru?: string;
  description_uz?: string;
  description_ru?: string;
  price: number;
  original_price?: number | null;
  /** Bitta mahsulot bir nechta kategoriyaga tegishli bo'lishi mumkin */
  category_ids: number[];
  /** Bitta mahsulot faqat bitta brendga tegishli */
  brand_id: number;
  stock?: number;
  featured?: boolean;
  badge?: string | null;
  specifications?: SpecItem[] | Record<string, string>;
  imageFiles?: File[];
  oldImages?: string[];
}

export interface CategoryInput {
  slug: string;
  name_uz: string;
  name_ru?: string;
  description_uz?: string;
  description_ru?: string;
  /** Yangi yuklanadigan icon */
  iconFile?: File | null;
}

export interface BrandInput {
  slug: string;
  name_uz: string;
  name_ru?: string;
  iconFile?: File | null;
}

// Localized field picker — har qanday obyektdan {base}_{locale} maydonini tanlaydi
export function pick(
  item: object | null | undefined,
  base: string,
  locale: Locale,
  fallback = ''
): string {
  if (!item) return fallback;
  const obj = item as Record<string, unknown>;
  const primary   = obj[`${base}_${locale}`];
  const secondary = obj[`${base}_${locale === 'uz' ? 'ru' : 'uz'}`];
  return (typeof primary === 'string' && primary) ? primary
       : (typeof secondary === 'string' && secondary) ? secondary
       : fallback;
}
