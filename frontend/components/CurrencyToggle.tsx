'use client';
import { useCurrency } from '@/context/CurrencyContext';

export default function CurrencyToggle() {
  const { currency, toggle } = useCurrency();
  const next = currency === 'UZS' ? 'USD' : 'UZS';

  return (
    <button
      onClick={toggle}
      className="h-9 px-3 rounded-full border flex items-center justify-center text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:border-gold-bright"
      style={{ borderColor: 'var(--border-gold)', color: 'var(--gold-light)', minWidth: 52 }}
      aria-label={`Switch to ${next}`}
    >
      {next}
    </button>
  );
}
