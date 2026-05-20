import clsx from 'clsx';

const variantMap: Record<string, string> = {
  Bestseller: 'badge-gold',
  Iconic: 'badge-gold',
  Limited: 'badge-gold',
  Exclusive: 'badge-gold',
  Rare: 'badge-gold',
  Sale: 'badge-sale',
  New: 'badge-new',
};

export default function Badge({ label }: { label: string }) {
  return (
    <span className={clsx('badge', variantMap[label] || 'badge-gold')}>
      {label}
    </span>
  );
}
