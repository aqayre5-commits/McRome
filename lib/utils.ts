import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function absoluteUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

export function isActiveSubscription(status?: string | null) {
  return status === 'active' || status === 'trialing';
}

export function formatDelta(delta: number): string {
  if (delta === 0) return '';
  const sign = delta > 0 ? '+' : '';
  return `${sign}${new Intl.NumberFormat('en-US').format(delta)} 24h`;
}
