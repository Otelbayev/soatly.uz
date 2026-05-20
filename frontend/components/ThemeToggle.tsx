'use client';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200"
      style={{ borderColor: 'var(--border-gold)', color: 'var(--text-muted)' }}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark'
        ? <Sun size={16} style={{ color: 'var(--gold-light)' }} />
        : <Moon size={16} style={{ color: 'var(--gold)' }} />
      }
    </button>
  );
}
