'use client';
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { CartItem, Product } from '@/lib/types';
import * as cartLib from '@/lib/cart';

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  add: (product: Product, qty?: number) => void;
  remove: (productId: number) => void;
  update: (productId: number, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(cartLib.getCart());
  }, []);

  const add = useCallback((product: Product, qty = 1) => {
    setItems(cartLib.addToCart(product, qty));
  }, []);

  const remove = useCallback((productId: number) => {
    setItems(cartLib.removeFromCart(productId));
  }, []);

  const update = useCallback((productId: number, qty: number) => {
    setItems(cartLib.updateQuantity(productId, qty));
  }, []);

  const clear = useCallback(() => {
    cartLib.clearCart();
    setItems([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        count: cartLib.cartCount(items),
        total: cartLib.cartTotal(items),
        add,
        remove,
        update,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
