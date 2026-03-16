import { env } from '@/lib/env';
import { getRegionalTier } from '@/lib/geo';
import type { RegionalOffer } from '@/lib/types';

export function resolveStripePriceId(interval: 'monthly' | 'yearly', countryCode: string): string | undefined {
  const tier = getRegionalTier(countryCode);

  if (interval === 'monthly') {
    if (tier === 'tier1') return env.STRIPE_PRICE_PRO_MONTHLY_TIER1 || env.STRIPE_PRICE_PRO_MONTHLY;
    return env.STRIPE_PRICE_PRO_MONTHLY_TIER2 || env.STRIPE_PRICE_PRO_MONTHLY;
  }

  if (tier === 'tier1') return env.STRIPE_PRICE_PRO_YEARLY_TIER1 || env.STRIPE_PRICE_PRO_YEARLY;
  return env.STRIPE_PRICE_PRO_YEARLY_TIER2 || env.STRIPE_PRICE_PRO_YEARLY;
}

export function buildRegionalOffer(countryCode: string, gameName: string): RegionalOffer {
  const tier = getRegionalTier(countryCode);
  const url =
    tier === 'tier1'
      ? env.CPA_BETA_SIGNUP_URL_TIER1 || '/pricing'
      : env.CPA_BETA_SIGNUP_URL_TIER2 || '/pricing';

  return {
    id: `beta-${tier}`,
    tier,
    title: tier === 'tier1' ? 'Regional beta tester offer' : 'Mobile-first beta tester offer',
    description:
      tier === 'tier1'
        ? `Join ${gameName} and similar launch campaigns with higher-payout beta tester offers.`
        : `Join ${gameName} and similar launch campaigns optimized for fast mobile signups and regional traffic.`,
    ctaLabel: tier === 'tier1' ? 'Open beta offer' : 'Open regional offer',
    url
  };
}

export function getRegionalPricingCopy(countryCode: string): { badge: string; note: string } {
  const tier = getRegionalTier(countryCode);
  return tier === 'tier1'
    ? {
        badge: 'Tier 1 pricing',
        note: 'Stripe checkout uses your Tier 1 price mapping when configured.'
      }
    : {
        badge: 'Tier 2 pricing',
        note: 'Stripe checkout uses your Tier 2 price mapping when configured.'
      };
}
