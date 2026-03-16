import { describe, expect, it } from 'vitest';
import { cn, formatNumber, absoluteUrl, isActiveSubscription, formatDelta } from '@/lib/utils';

describe('cn', () => {
  it('joins class strings', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('ignores falsy values', () => {
    expect(cn('a', false, undefined, 'b')).toBe('a b');
  });

  it('handles conditional object syntax', () => {
    expect(cn('base', { active: true, hidden: false })).toBe('base active');
  });
});

describe('formatNumber', () => {
  it('formats large numbers with commas', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('formats small numbers', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

describe('absoluteUrl', () => {
  it('joins base and path with leading slash', () => {
    expect(absoluteUrl('/games')).toBe('http://localhost:3000/games');
  });

  it('handles path without leading slash', () => {
    expect(absoluteUrl('games')).toBe('http://localhost:3000/games');
  });

  it('strips trailing slash from base', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000/';
    expect(absoluteUrl('/pricing')).toBe('http://localhost:3000/pricing');
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
  });
});

describe('formatDelta', () => {
  it('returns empty string for zero', () => {
    expect(formatDelta(0)).toBe('');
  });

  it('prefixes positive delta with +', () => {
    expect(formatDelta(1500)).toBe('+1,500 24h');
  });

  it('negative delta has no extra sign', () => {
    expect(formatDelta(-800)).toBe('-800 24h');
  });
});

describe('isActiveSubscription', () => {
  it('returns true for active', () => {
    expect(isActiveSubscription('active')).toBe(true);
  });

  it('returns true for trialing', () => {
    expect(isActiveSubscription('trialing')).toBe(true);
  });

  it('returns false for inactive', () => {
    expect(isActiveSubscription('inactive')).toBe(false);
  });

  it('returns false for null', () => {
    expect(isActiveSubscription(null)).toBe(false);
  });

  it('returns false for canceled', () => {
    expect(isActiveSubscription('canceled')).toBe(false);
  });
});
