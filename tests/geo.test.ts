import { describe, expect, it } from 'vitest';
import { getRegionalTier, getRequestCountry } from '@/lib/geo';

describe('getRegionalTier', () => {
  it('returns tier1 for US', () => {
    expect(getRegionalTier('US')).toBe('tier1');
  });

  it('returns tier1 for lowercase us', () => {
    expect(getRegionalTier('us')).toBe('tier1');
  });

  it('returns tier1 for GB', () => {
    expect(getRegionalTier('GB')).toBe('tier1');
  });

  it('returns tier2 for BR', () => {
    expect(getRegionalTier('BR')).toBe('tier2');
  });

  it('returns tier2 for unknown country', () => {
    expect(getRegionalTier('ZZ')).toBe('tier2');
  });
});

describe('getRequestCountry', () => {
  it('reads x-vercel-ip-country header', () => {
    const headers = new Headers({ 'x-vercel-ip-country': 'DE' });
    expect(getRequestCountry(headers)).toBe('DE');
  });

  it('falls back to cf-ipcountry', () => {
    const headers = new Headers({ 'cf-ipcountry': 'FR' });
    expect(getRequestCountry(headers)).toBe('FR');
  });

  it('falls back to x-country-code', () => {
    const headers = new Headers({ 'x-country-code': 'jp' });
    expect(getRequestCountry(headers)).toBe('JP');
  });

  it('defaults to US when no header present', () => {
    const headers = new Headers();
    expect(getRequestCountry(headers)).toBe('US');
  });
});
