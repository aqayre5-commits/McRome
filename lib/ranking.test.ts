import { describe, it, expect } from 'vitest';
import {
  isPublishEligible,
  isTrendingException,
  computePublishScore,
  getPublishGroup,
  MIN_PLAYERS,
  VIRAL_GROWTH_THRESHOLD,
} from './ranking';

const NOW = new Date().toISOString();
const OLD = new Date(Date.now() - 2 * 86_400_000).toISOString();

// ── isPublishEligible ──────────────────────────────────────────────────────────

describe('isPublishEligible', () => {
  it('returns true for a game above 5000 players with no rating', () => {
    expect(
      isPublishEligible({
        active_players: 10_000,
        active_players_change_24h: 0,
        rating_percentage: null,
      }),
    ).toBe(true);
  });

  it('returns true for a game above 5000 players with good rating', () => {
    expect(
      isPublishEligible({
        active_players: 6_000,
        active_players_change_24h: 0,
        rating_percentage: 75,
      }),
    ).toBe(true);
  });

  it('returns false when players < 5000 and no viral growth', () => {
    expect(
      isPublishEligible({
        active_players: 2_000,
        active_players_change_24h: 500,
        rating_percentage: null,
      }),
    ).toBe(false);
  });

  it('returns true for viral exception (< 5000 players but growth >= 1000)', () => {
    expect(
      isPublishEligible({
        active_players: 3_000,
        active_players_change_24h: VIRAL_GROWTH_THRESHOLD,
        rating_percentage: null,
      }),
    ).toBe(true);
  });

  it('returns false when rating is below MIN_RATING_PCT even with enough players', () => {
    expect(
      isPublishEligible({
        active_players: 20_000,
        active_players_change_24h: 0,
        rating_percentage: 10,
      }),
    ).toBe(false);
  });

  it('returns true when rating is exactly at MIN_RATING_PCT floor', () => {
    expect(
      isPublishEligible({
        active_players: MIN_PLAYERS,
        active_players_change_24h: 0,
        rating_percentage: 30,
      }),
    ).toBe(true);
  });
});

// ── isTrendingException ────────────────────────────────────────────────────────

describe('isTrendingException', () => {
  it('returns true when players < 5000 and growth >= 1000', () => {
    expect(
      isTrendingException({ active_players: 4_999, active_players_change_24h: 1_000 }),
    ).toBe(true);
  });

  it('returns false when players >= 5000', () => {
    expect(
      isTrendingException({ active_players: 5_000, active_players_change_24h: 2_000 }),
    ).toBe(false);
  });

  it('returns false when growth < 1000 even with low players', () => {
    expect(
      isTrendingException({ active_players: 100, active_players_change_24h: 999 }),
    ).toBe(false);
  });
});

// ── computePublishScore ────────────────────────────────────────────────────────

describe('computePublishScore', () => {
  it('returns a value between 0 and 1', () => {
    const score = computePublishScore({
      active_players: 50_000,
      active_players_change_24h: 10_000,
      rating_percentage: 90,
      verified_by_community: true,
      last_data_refresh: NOW,
    });
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('scores higher for more players', () => {
    const base = {
      active_players_change_24h: 0,
      rating_percentage: 70,
      verified_by_community: false,
      last_data_refresh: NOW,
    };
    const low = computePublishScore({ ...base, active_players: 5_000 });
    const high = computePublishScore({ ...base, active_players: 100_000 });
    expect(high).toBeGreaterThan(low);
  });

  it('adds bonus for verified_by_community', () => {
    const base = {
      active_players: 20_000,
      active_players_change_24h: 0,
      rating_percentage: 70,
      last_data_refresh: NOW,
    };
    const unverified = computePublishScore({ ...base, verified_by_community: false });
    const verified = computePublishScore({ ...base, verified_by_community: true });
    expect(verified).toBeGreaterThan(unverified);
  });

  it('gives freshness bonus when refreshed within 24h', () => {
    const base = {
      active_players: 20_000,
      active_players_change_24h: 0,
      rating_percentage: 70,
      verified_by_community: false,
    };
    const stale = computePublishScore({ ...base, last_data_refresh: OLD });
    const fresh = computePublishScore({ ...base, last_data_refresh: NOW });
    expect(fresh).toBeGreaterThan(stale);
  });

  it('handles null rating_percentage by defaulting to 0.5', () => {
    const withNull = computePublishScore({
      active_players: 10_000,
      active_players_change_24h: 0,
      rating_percentage: null,
      verified_by_community: false,
      last_data_refresh: NOW,
    });
    const with50 = computePublishScore({
      active_players: 10_000,
      active_players_change_24h: 0,
      rating_percentage: 50,
      verified_by_community: false,
      last_data_refresh: NOW,
    });
    expect(withNull).toBeCloseTo(with50, 5);
  });
});

// ── getPublishGroup ────────────────────────────────────────────────────────────

describe('getPublishGroup', () => {
  it('returns A for >= 20k players', () => {
    expect(getPublishGroup({ active_players: 20_000, active_players_change_24h: 0 })).toBe('A');
  });

  it('returns B for 10–19999 players', () => {
    expect(getPublishGroup({ active_players: 15_000, active_players_change_24h: 0 })).toBe('B');
  });

  it('returns C for 5000–9999 players', () => {
    expect(getPublishGroup({ active_players: 7_500, active_players_change_24h: 0 })).toBe('C');
  });

  it('returns D for < 5000 players with viral growth', () => {
    expect(getPublishGroup({ active_players: 3_000, active_players_change_24h: 1_500 })).toBe('D');
  });

  it('returns null for < 5000 players with no viral growth', () => {
    expect(getPublishGroup({ active_players: 100, active_players_change_24h: 0 })).toBeNull();
  });
});
