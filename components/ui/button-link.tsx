import type { ReactNode } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Props = {
  href: string | Route;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
};

export function ButtonLink({ href, children, variant = 'primary', className }: Props) {
  const styles = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700',
    secondary: 'bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50',
    ghost: 'text-slate-700 hover:text-slate-900'
  };

  return (
    <Link
      href={href as Route}
      className={cn(
        'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition',
        styles[variant],
        className
      )}
    >
      {children}
    </Link>
  );
}
