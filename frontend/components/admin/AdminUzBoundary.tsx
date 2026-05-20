'use client';
import { ReactNode, useEffect } from 'react';
import { useLang } from '@/context/LanguageContext';

/**
 * Admin panel chrome doimo UZ tilida bo'lishini ta'minlaydi.
 * Sayt locale RU bo'lsa ham, admin paneliga kirgach UZ ga o'tadi.
 */
export default function AdminUzBoundary({ children }: { children: ReactNode }) {
  const { locale, setLocale } = useLang();

  useEffect(() => {
    if (locale !== 'uz') setLocale('uz');
  }, [locale, setLocale]);

  return <>{children}</>;
}
