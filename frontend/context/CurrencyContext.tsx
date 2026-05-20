'use client';
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

export type Currency = 'UZS' | 'USD';

const STORAGE_KEY = 'soatly_currency';

// Konvertatsiya kursi (1 USD = X UZS). Keyinroq backend'dan kelishi mumkin.
export const USD_TO_UZS_RATE = 12500;

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggle: () => void;
  /** UZS bo'yicha saqlangan summani joriy valyutada raqamga o'giradi */
  convert: (uzsAmount: number | null | undefined) => number;
  /** UZS bo'yicha saqlangan summani joriy valyutada formatlangan matn (masalan "1 250 000 so‘m" yoki "$100") */
  format: (uzsAmount: number | null | undefined) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('UZS');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Currency | null;
    if (saved === 'UZS' || saved === 'USD') setCurrencyState(saved);
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_KEY, c);
  }, []);

  const toggle = useCallback(() => {
    setCurrency(currency === 'UZS' ? 'USD' : 'UZS');
  }, [currency, setCurrency]);

  const convert = useCallback((uzs: number | null | undefined): number => {
    const v = Number(uzs) || 0;
    return currency === 'UZS' ? v : Math.round(v / USD_TO_UZS_RATE);
  }, [currency]);

  const format = useCallback((uzs: number | null | undefined): string => {
    const value = convert(uzs);
    if (currency === 'USD') return `$${value.toLocaleString('en-US')}`;
    return `${value.toLocaleString('ru-RU')} so'm`;
  }, [currency, convert]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, toggle, convert, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
