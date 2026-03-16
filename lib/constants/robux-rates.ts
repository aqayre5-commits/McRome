/**
 * robux-rates.ts
 * 2026 regional Robux pricing configuration.
 *
 * Purchase rates reflect the 1,000 Robux web-browser bundle for each region.
 * DevEx rates reflect Roblox's Developer Exchange cashout payout in local currency.
 * All rates are in local currency units per single Robux.
 */

export type RegionCode = 'US' | 'GB' | 'EU' | 'BR';

export type RobuxRate = {
  regionCode: RegionCode;
  label: string;           // display name for the override dropdown
  flag: string;            // emoji flag
  currency: string;        // ISO 4217 code
  symbol: string;          // display symbol
  locale: string;          // BCP 47 locale for Intl.NumberFormat
  purchaseRate: number;    // local currency per Robux (what players pay)
  devexRate: number;       // local currency per Robux (developer cashout)
  /** Region-specific insight shown below the calculator. null for the US baseline. */
  localComparisonNote: string | null;
};

export const ROBUX_RATES: Record<RegionCode, RobuxRate> = {
  US: {
    regionCode: 'US',
    label: 'United States (USD)',
    flag: '🇺🇸',
    currency: 'USD',
    symbol: '$',
    locale: 'en-US',
    purchaseRate: 0.00999,
    devexRate: 0.0038,
    localComparisonNote: null,
  },
  GB: {
    regionCode: 'GB',
    label: 'United Kingdom (GBP)',
    flag: '🇬🇧',
    currency: 'GBP',
    symbol: '£',
    locale: 'en-GB',
    purchaseRate: 0.0125,  // £12.50 per 1,000 Robux (2026 web rate incl. 20% VAT)
    devexRate: 0.0030,     // £3.00 per 1,000 Robux DevEx cashout
    localComparisonNote:
      'In the UK, Roblox prices include 20% VAT on digital goods. ' +
      'Buying Robux via the web browser is typically 15–30% cheaper than via the iOS App Store ' +
      'or Google Play, which add their own platform commission on top of the base price.',
  },
  EU: {
    regionCode: 'EU',
    label: 'Eurozone (EUR)',
    flag: '🇪🇺',
    currency: 'EUR',
    symbol: '€',
    locale: 'de-DE',
    purchaseRate: 0.01199,
    devexRate: 0.0045,
    localComparisonNote:
      'In the EU, VAT on digital purchases ranges from 17% (Luxembourg) to 27% (Hungary). ' +
      'Web browser purchases avoid the additional 15–30% platform commission charged by the ' +
      'iOS App Store and Google Play, making the web the most cost-efficient purchase channel.',
  },
  BR: {
    regionCode: 'BR',
    label: 'Brazil (BRL)',
    flag: '🇧🇷',
    currency: 'BRL',
    symbol: 'R$',
    locale: 'pt-BR',
    purchaseRate: 0.049,
    devexRate: 0.018,
    localComparisonNote:
      'In Brazil, Robux purchased via the web browser is up to 30% cheaper than via the ' +
      'Google Play Store due to local payment processing optimizations and reduced platform fees. ' +
      'Pix and local card payments are supported at checkout, with no international transaction fees.',
  },
};

// ─── Country → region mapping ──────────────────────────────────────────────────

/** Eurozone members (ISO 3166-1 alpha-2 codes that officially use EUR). */
const EUROZONE = new Set([
  'AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT',
  'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES', 'HR',
  // Small states that use EUR by agreement
  'AD', 'MC', 'SM', 'VA',
]);

/**
 * Returns the RobuxRate config for a given ISO 3166-1 alpha-2 country code.
 * Falls back to US (USD) for any unmapped country.
 */
export function getCountryRate(countryCode: string): RobuxRate {
  const code = countryCode.toUpperCase();
  if (code === 'GB') return ROBUX_RATES.GB;
  if (code === 'BR') return ROBUX_RATES.BR;
  if (EUROZONE.has(code)) return ROBUX_RATES.EU;
  return ROBUX_RATES.US;
}

/** Ordered list used to render the manual override dropdown. */
export const REGION_OPTIONS: RegionCode[] = ['US', 'GB', 'EU', 'BR'];
