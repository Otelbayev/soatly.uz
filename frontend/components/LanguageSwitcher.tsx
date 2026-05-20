'use client';
import { useLang } from '@/context/LanguageContext';
import type { Locale } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLang();
  const next: Locale = locale === 'uz' ? 'ru' : 'uz';

  return (
    <button
      onClick={() => setLocale(next)}
      className="h-9 px-3 rounded-full border flex items-center justify-center text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:border-gold-bright"
      style={{ borderColor: 'var(--border-gold)', color: 'var(--gold-light)', minWidth: 44 }}
      aria-label={`Switch to ${next.toUpperCase()}`}
    >
      {next.toUpperCase()}
    </button>
  );
}
