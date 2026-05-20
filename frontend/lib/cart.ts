import { CartItem, Product } from './types';

const CART_KEY = 'watch_store_cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(product: Product, quantity = 1): CartItem[] {
  const cart = getCart();
  const idx = cart.findIndex((i) => i.product.id === product.id);
  if (idx >= 0) {
    cart[idx].quantity = Math.min(cart[idx].quantity + quantity, product.stock);
  } else {
    cart.push({ product, quantity });
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(productId: number): CartItem[] {
  const cart = getCart().filter((i) => i.product.id !== productId);
  saveCart(cart);
  return cart;
}

export function updateQuantity(productId: number, quantity: number): CartItem[] {
  const cart = getCart();
  const idx = cart.findIndex((i) => i.product.id === productId);
  if (idx >= 0) {
    if (quantity <= 0) return removeFromCart(productId);
    cart[idx].quantity = quantity;
    saveCart(cart);
  }
  return cart;
}

export function clearCart(): void {
  saveCart([]);
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
