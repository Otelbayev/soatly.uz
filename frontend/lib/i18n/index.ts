import ru, { Translations } from './ru';
import uz from './uz';

export type Locale = 'uz' | 'ru';

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: 'uz', label: "O'zbek",  flag: '🇺🇿' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

export const translations: Record<Locale, Translations> = { uz, ru };

export const DEFAULT_LOCALE: Locale = 'uz';

export type { Translations };
