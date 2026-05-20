import {
  Product,
  ProductsResponse,
  Category,
  Brand,
  OrderPayload,
  Order,
  OrdersResponse,
  OrderStats,
  OrderStatus,
  ProductInput,
  CategoryInput,
  BrandInput,
} from './types';
import { resolveImageUrl } from './image';
import { authFetch, apiJson, tokenStore, AuthUser, isAbortError } from './auth';

// ── In-memory GET cache ─────────────────────────────────
// Kategoriya va brendlar deyarli o'zgarmaydi — har sahifa kirganda qayta yuklash shart emas.
// Admin mutatsiyalardan keyin tegishli kalitlarni invalidate qilamiz.
type CacheEntry<T> = { value: T; expiresAt: number };
const cacheTTLMs = 60_000; // 60s
const cacheStore = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

const getCached = <T>(key: string): T | undefined => {
  const hit = cacheStore.get(key);
  if (!hit) return undefined;
  if (hit.expiresAt < Date.now()) { cacheStore.delete(key); return undefined; }
  return hit.value as T;
};

const setCached = <T>(key: string, value: T) => {
  cacheStore.set(key, { value, expiresAt: Date.now() + cacheTTLMs });
};

const cachedFetch = async <T>(key: string, loader: () => Promise<T>): Promise<T> => {
  const hit = getCached<T>(key);
  if (hit !== undefined) return hit;
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;
  const p = loader()
    .then((v) => { setCached(key, v); return v; })
    .finally(() => { inflight.delete(key); });
  inflight.set(key, p);
  return p;
};

const invalidateCache = (prefix?: string) => {
  if (!prefix) { cacheStore.clear(); return; }
  for (const k of cacheStore.keys()) if (k.startsWith(prefix)) cacheStore.delete(k);
};

// Backend rasmlarni `/uploads/...` shaklida qaytaradi — to'liq URL ga aylantiramiz
const normalizeProduct = (p: Product): Product => ({
  ...p,
  price: Number(p.price) || 0,
  original_price: p.original_price == null ? null : Number(p.original_price),
  images: Array.isArray(p.images) ? p.images.map(resolveImageUrl) : [],
  specifications: p.specifications || {},
});

const normalizeBilingual = <T extends { icon: string }>(x: T): T => ({
  ...x,
  icon: resolveImageUrl(x.icon),
});

const normalizeOrder = (o: Order): Order => ({
  ...o,
  total_amount: Number(o.total_amount) || 0,
  items: o.items?.map((it) => ({
    ...it,
    unit_price: Number(it.unit_price) || 0,
    subtotal: Number(it.subtotal) || 0,
  })),
});

const buildQuery = (params: Record<string, unknown>) =>
  new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '' && v !== null)
      .map(([k, v]) => [k, String(v)]),
  ).toString();

// ── Public API ──────────────────────────────────────────
export const api = {
  getProducts: async (
    params: Record<string, string | number | boolean> = {},
    opts: { signal?: AbortSignal } = {},
  ) => {
    const qs = buildQuery(params);
    const data = await apiJson<ProductsResponse>(`/products${qs ? `?${qs}` : ''}`, { signal: opts.signal });
    return { ...data, products: data.products.map(normalizeProduct) };
  },
  getProduct: async (id: number | string, opts: { signal?: AbortSignal } = {}) => {
    const p = await apiJson<Product>(`/products/${id}`, { signal: opts.signal });
    return normalizeProduct(p);
  },
  getCategories: () =>
    cachedFetch('categories', async () => {
      const data = await apiJson<Category[]>('/categories');
      return data.map(normalizeBilingual);
    }),
  getCategoryBySlug: (slug: string) =>
    cachedFetch(`category:${slug}`, async () => {
      const c = await apiJson<Category>(`/categories/${slug}`);
      return normalizeBilingual(c);
    }),
  getBrands: () =>
    cachedFetch('brands', async () => {
      const data = await apiJson<Brand[]>('/brands');
      return data.map(normalizeBilingual);
    }),
  getBrandBySlug: (slug: string) =>
    cachedFetch(`brand:${slug}`, async () => {
      const b = await apiJson<Brand>(`/brands/${slug}`);
      return normalizeBilingual(b);
    }),
  createOrder: (payload: OrderPayload) =>
    apiJson<Order & { items: Order['items'] }>('/orders', { method: 'POST', json: payload }),
};

// ── Auth API ────────────────────────────────────────────
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export const authApi = {
  login: async (username: string, password: string) => {
    const data = await apiJson<LoginResponse>('/auth/login', {
      method: 'POST',
      json: { username, password },
    });
    tokenStore.set(data.accessToken, data.refreshToken, data.user);
    return data;
  },
  logout: async () => {
    const refreshToken = tokenStore.getRefresh();
    if (refreshToken) {
      try {
        await apiJson('/auth/logout', { method: 'POST', json: { refreshToken } });
      } catch { /* ignore */ }
    }
    tokenStore.clear();
  },
  me: () => apiJson<AuthUser & { is_active: boolean; created_at: string }>('/auth/me', { auth: true }),
  changePassword: (oldPassword: string, newPassword: string) =>
    apiJson('/auth/change-password', {
      method: 'POST',
      auth: true,
      json: { oldPassword, newPassword },
    }),
};

// ── Admin: Product upload helpers ──────────────────────
const buildProductFormData = (data: ProductInput): FormData => {
  const fd = new FormData();
  if (data.name_uz != null) fd.append('name_uz', data.name_uz);
  if (data.name_ru != null) fd.append('name_ru', data.name_ru);
  if (data.description_uz != null) fd.append('description_uz', data.description_uz);
  if (data.description_ru != null) fd.append('description_ru', data.description_ru);
  if (data.price != null) fd.append('price', String(data.price));
  if (data.original_price !== undefined) {
    fd.append('original_price', data.original_price == null ? '' : String(data.original_price));
  }
  if (data.category_ids) fd.append('category_ids', JSON.stringify(data.category_ids));
  if (data.brand_id != null) fd.append('brand_id', String(data.brand_id));
  if (data.stock != null) fd.append('stock', String(data.stock));
  if (data.featured != null) fd.append('featured', String(data.featured));
  if (data.badge !== undefined) fd.append('badge', data.badge ?? '');
  if (data.specifications) fd.append('specifications', JSON.stringify(data.specifications));
  if (data.oldImages) fd.append('old_images', JSON.stringify(data.oldImages));
  data.imageFiles?.forEach((f) => fd.append('images', f));
  return fd;
};

const buildCategoryFormData = (data: CategoryInput): FormData => {
  const fd = new FormData();
  fd.append('slug', data.slug);
  fd.append('name_uz', data.name_uz);
  fd.append('name_ru', data.name_ru ?? '');
  fd.append('description_uz', data.description_uz ?? '');
  fd.append('description_ru', data.description_ru ?? '');
  if (data.iconFile) fd.append('icon', data.iconFile);
  return fd;
};

const buildBrandFormData = (data: BrandInput): FormData => {
  const fd = new FormData();
  fd.append('slug', data.slug);
  fd.append('name_uz', data.name_uz);
  fd.append('name_ru', data.name_ru ?? '');
  if (data.iconFile) fd.append('icon', data.iconFile);
  return fd;
};

// ── Admin API ────────────────────────────────────────────
export const adminApi = {
  // Products
  getProducts: async (
    params: Record<string, string | number | boolean> = {},
    opts: { signal?: AbortSignal } = {},
  ) => {
    const qs = buildQuery(params);
    const data = await apiJson<ProductsResponse>(`/products${qs ? `?${qs}` : ''}`, { signal: opts.signal });
    return { ...data, products: data.products.map(normalizeProduct) };
  },
  getProduct: async (id: number | string, opts: { signal?: AbortSignal } = {}) => {
    const p = await apiJson<Product>(`/products/${id}`, { signal: opts.signal });
    return normalizeProduct(p);
  },
  createProduct: async (data: ProductInput) => {
    const p = await apiJson<Product>('/products', {
      method: 'POST',
      auth: true,
      body: buildProductFormData(data),
    });
    return normalizeProduct(p);
  },
  updateProduct: async (id: number | string, data: ProductInput) => {
    const p = await apiJson<Product>(`/products/${id}`, {
      method: 'PUT',
      auth: true,
      body: buildProductFormData(data),
    });
    return normalizeProduct(p);
  },
  deleteProduct: (id: number | string) =>
    apiJson<{ success: boolean }>(`/products/${id}`, { method: 'DELETE', auth: true }),

  // Categories — cache'lab, mutatsiyalarda invalidatsiya
  getCategories: () =>
    cachedFetch('categories', async () => {
      const data = await apiJson<Category[]>('/categories');
      return data.map(normalizeBilingual);
    }),
  createCategory: async (data: CategoryInput) => {
    const c = await apiJson<Category>('/categories', {
      method: 'POST',
      auth: true,
      body: buildCategoryFormData(data),
    });
    invalidateCache('categor');
    return normalizeBilingual(c);
  },
  updateCategory: async (id: number | string, data: CategoryInput) => {
    const c = await apiJson<Category>(`/categories/${id}`, {
      method: 'PUT',
      auth: true,
      body: buildCategoryFormData(data),
    });
    invalidateCache('categor');
    return normalizeBilingual(c);
  },
  deleteCategory: async (id: number | string) => {
    const r = await apiJson<{ success: boolean }>(`/categories/${id}`, { method: 'DELETE', auth: true });
    invalidateCache('categor');
    return r;
  },

  // Brands — cache'lab, mutatsiyalarda invalidatsiya
  getBrands: () =>
    cachedFetch('brands', async () => {
      const data = await apiJson<Brand[]>('/brands');
      return data.map(normalizeBilingual);
    }),
  createBrand: async (data: BrandInput) => {
    const b = await apiJson<Brand>('/brands', {
      method: 'POST',
      auth: true,
      body: buildBrandFormData(data),
    });
    invalidateCache('brand');
    return normalizeBilingual(b);
  },
  updateBrand: async (id: number | string, data: BrandInput) => {
    const b = await apiJson<Brand>(`/brands/${id}`, {
      method: 'PUT',
      auth: true,
      body: buildBrandFormData(data),
    });
    invalidateCache('brand');
    return normalizeBilingual(b);
  },
  deleteBrand: async (id: number | string) => {
    const r = await apiJson<{ success: boolean }>(`/brands/${id}`, { method: 'DELETE', auth: true });
    invalidateCache('brand');
    return r;
  },

  // Orders
  getOrders: async (
    params: Record<string, string | number> = {},
    opts: { signal?: AbortSignal } = {},
  ) => {
    const qs = buildQuery(params);
    const data = await apiJson<OrdersResponse>(`/orders${qs ? `?${qs}` : ''}`, { auth: true, signal: opts.signal });
    return { ...data, orders: data.orders.map(normalizeOrder) };
  },
  getOrder: async (id: number | string) => {
    const o = await apiJson<Order>(`/orders/${id}`, { auth: true });
    return normalizeOrder(o);
  },
  updateOrderStatus: async (id: number | string, status: OrderStatus) => {
    const o = await apiJson<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      auth: true,
      json: { status },
    });
    return normalizeOrder(o);
  },
  deleteOrder: (id: number | string) =>
    apiJson<{ success: boolean }>(`/orders/${id}`, { method: 'DELETE', auth: true }),

  getStats: () => apiJson<OrderStats>('/orders/stats', { auth: true }),
};

// Re-export uchun qulaylik
export { authFetch, apiJson, tokenStore, isAbortError };
export type { AuthUser };
