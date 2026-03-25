/**
 * affiliate-links.ts
 * Localized Roblox gift card affiliate link registry.
 *
 * SETUP: Replace every YOUR_*_TAG placeholder with your real Amazon Associates
 * tracking IDs before going to production.  The US link is already a live
 * shortened URL; the others are full ASIN paths that need a valid tag.
 *
 * FTC / Google 2026: all outbound links rendered via AffiliateButton carry
 * rel="sponsored nofollow noopener noreferrer" automatically.
 */

import { getCountryRate, type RegionCode } from '@/lib/constants/robux-rates';

export type AffiliateLink = {
  href: string;
  storeName: string;   // e.g. "Amazon UK"  — used in aria-label
  buttonLabel: string; // e.g. "Buy Robux on Amazon UK" — button text
  isAmazon: boolean;   // drives FTC "Amazon Associate" disclosure
};

// ─── Per-region link table ─────────────────────────────────────────────────────

const LINKS_BY_REGION: Record<RegionCode, AffiliateLink> = {
  US: {
    // Live Amazon US affiliate link — replace YOUR_US_TAG if you want a custom one
    href: 'https://amzn.to/4budfEJ',
    storeName: 'Amazon US',
    buttonLabel: 'Buy Robux on Amazon US',
    isAmazon: true,
  },
  GB: {
    // TODO: replace with your Amazon UK Associates link once approved
    href: 'https://www.roblox.com/giftcards',
    storeName: 'Roblox',
    buttonLabel: 'Get Robux Gift Cards',
    isAmazon: false,
  },
  EU: {
    // TODO: replace with your Amazon DE Associates link once approved
    href: 'https://www.roblox.com/giftcards',
    storeName: 'Roblox',
    buttonLabel: 'Get Robux Gift Cards',
    isAmazon: false,
  },
  BR: {
    // TODO: replace with your Amazon BR Associates link once approved
    href: 'https://www.roblox.com/giftcards',
    storeName: 'Roblox',
    buttonLabel: 'Get Robux Gift Cards',
    isAmazon: false,
  },
};

/**
 * Official Roblox gift cards page.
 * Used when a country isn't covered by any regional Amazon store.
 * Not an affiliate link — isAmazon: false suppresses FTC disclosure.
 */
export const GLOBAL_FALLBACK: AffiliateLink = {
  href: 'https://www.roblox.com/giftcards',
  storeName: 'Roblox',
  buttonLabel: 'Get Robux Gift Cards',
  isAmazon: false,
};

// ─── Lookup helpers ────────────────────────────────────────────────────────────

/**
 * Resolve the best affiliate link for a given RegionCode.
 * Use this inside Client Components where you already have the selected region.
 */
export function getAffiliateLinkByRegion(regionCode: RegionCode): AffiliateLink {
  return LINKS_BY_REGION[regionCode] ?? GLOBAL_FALLBACK;
}

/**
 * Resolve the best affiliate link from a raw ISO 3166-1 alpha-2 country code.
 * Use this in Server Components / route handlers where you have the raw header value.
 */
export function getAffiliateLink(countryCode: string): AffiliateLink {
  const rate = getCountryRate(countryCode);
  return LINKS_BY_REGION[rate.regionCode] ?? GLOBAL_FALLBACK;
}

/** True if any placeholder tags still need to be replaced. */
export function hasPlaceholderTags(): boolean {
  return Object.values(LINKS_BY_REGION).some((l) => l.href.includes('YOUR_'));
}
