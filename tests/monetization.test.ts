import { describe, expect, it } from 'vitest';
import { resolveStripePriceId, buildRegionalOffer, getRegionalPricingCopy } from '@/lib/monetization';

describe('resolveStripePriceId', () => {
  it('returns tier1 monthly price for US monthly', () => {
    expect(resolveStripePriceId('monthly', 'US')).toBe('price_monthly_tier1');
  });

  it('returns tier1 yearly price for GB yearly', () => {
    expect(resolveStripePriceId('yearly', 'GB')).toBe('price_yearly_tier1');
  });

  it('returns tier2 monthly price for BR monthly', () => {
    expect(resolveStripePriceId('monthly', 'BR')).toBe('price_monthly_tier2');
  });

  it('returns tier2 yearly price for ZZ yearly', () => {
    expect(resolveStripePriceId('yearly', 'ZZ')).toBe('price_yearly_tier2');
  });
});

describe('buildRegionalOffer', () => {
  it('returns tier1 offer for US', () => {
    const offer = buildRegionalOffer('US', 'Adopt Me');
    expect(offer.tier).toBe('tier1');
    expect(offer.url).toBe('https://example.com/tier1');
    expect(offer.title).toContain('beta');
  });

  it('returns tier2 offer for BR', () => {
    const offer = buildRegionalOffer('BR', 'Blox Fruits');
    expect(offer.tier).toBe('tier2');
    expect(offer.url).toBe('https://example.com/tier2');
  });

  it('includes game name in description', () => {
    const offer = buildRegionalOffer('US', 'Piggy');
    expect(offer.description).toContain('Piggy');
  });
});

describe('getRegionalPricingCopy', () => {
  it('returns tier1 badge for US', () => {
    const copy = getRegionalPricingCopy('US');
    expect(copy.badge).toBe('Tier 1 pricing');
  });

  it('returns tier2 badge for BR', () => {
    const copy = getRegionalPricingCopy('BR');
    expect(copy.badge).toBe('Tier 2 pricing');
  });

  it('includes note text', () => {
    const copy = getRegionalPricingCopy('US');
    expect(copy.note.length).toBeGreaterThan(0);
  });
});
