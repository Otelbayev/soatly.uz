import { ReactNode } from 'react';
import clsx from 'clsx';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: string;
}

export default function GlassCard({ children, className, hover = true, padding = 'p-6' }: GlassCardProps) {
  return (
    <div className={clsx('glass-card', padding, hover && 'cursor-pointer', className)}>
      {children}
    </div>
  );
}
