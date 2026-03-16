import { env } from '@/lib/env';
import type { RegionalTier } from '@/lib/types';

const fallbackTier1Countries = new Set(
  env.REGIONAL_TIER1_COUNTRIES.split(',').map((entry) => entry.trim().toUpperCase()).filter(Boolean)
);

export function getRequestCountry(headers: Headers): string {
  const country =
    headers.get('x-vercel-ip-country') ??
    headers.get('cf-ipcountry') ??
    headers.get('x-country-code') ??
    'US';

  return country.toUpperCase();
}

export function getRegionalTier(countryCode: string): RegionalTier {
  return fallbackTier1Countries.has(countryCode.toUpperCase()) ? 'tier1' : 'tier2';
}
