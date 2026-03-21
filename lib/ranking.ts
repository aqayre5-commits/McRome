import type { RobloxPage } from '@/lib/types';

/** Minimum active players to publish without viral override */
export const MIN_PLAYERS = 5000;
/** Minimum 24h growth to qualify as viral exception */
export const VIRAL_GROWTH_THRESHOLD = 1000;
/** Minimum thumbs-up ratio (0-100) for quality floor */
export const MIN_RATING_PCT = 30;

/** Returns true if a game passes the publish eligibility filter */
export function isPublishEligible(game: {
  active_players: number;
  active_players_change_24h: number;
  rating_percentage: number | null;
  is_trending_override?: boolean;
}): boolean {
  const viral = game.active_players_change_24h >= VIRAL_GROWTH_THRESHOLD;
  const meetsPlayerFloor = game.active_players >= MIN_PLAYERS;
  const meetsQuality = game.rating_percentage === null || game.rating_percentage >= MIN_RATING_PCT;
  return (meetsPlayerFloor || viral) && meetsQuality;
}

/** Returns true if game qualifies as a viral/trending exception (< 5000 players but growing fast) */
export function isTrendingException(game: {
  active_players: number;
  active_players_change_24h: number;
}): boolean {
  return game.active_players < MIN_PLAYERS && game.active_players_change_24h >= VIRAL_GROWTH_THRESHOLD;
}

/**
 * Weighted publish score:
 * - Active players (normalised to 0-1 against 500k ceiling): 40%
 * - Thumbs-up ratio (0-100 → 0-1): 25%
 * - 24h growth (normalised against 50k ceiling): 20%
 * - Verification signal: 10%
 * - Freshness (1 if refreshed today, else 0): 5%
 */
export function computePublishScore(game: {
  active_players: number;
  active_players_change_24h: number;
  rating_percentage: number | null;
  verified_by_community: boolean;
  last_data_refresh: string | null;
}): number {
  const PLAYER_CEIL = 500_000;
  const GROWTH_CEIL = 50_000;

  const playerScore = Math.min(game.active_players / PLAYER_CEIL, 1);
  const ratingScore = game.rating_percentage !== null ? game.rating_percentage / 100 : 0.5;
  const growthScore = Math.min(Math.max(game.active_players_change_24h, 0) / GROWTH_CEIL, 1);
  const verifiedScore = game.verified_by_community ? 1 : 0;
  const freshnessScore =
    game.last_data_refresh &&
    Date.now() - new Date(game.last_data_refresh).getTime() < 86_400_000
      ? 1
      : 0;

  return Number(
    (
      playerScore * 0.4 +
      ratingScore * 0.25 +
      growthScore * 0.2 +
      verifiedScore * 0.1 +
      freshnessScore * 0.05
    ).toFixed(6)
  );
}

/** Classify game into publish group A/B/C/D per execution plan */
export function getPublishGroup(game: {
  active_players: number;
  active_players_change_24h: number;
}): 'A' | 'B' | 'C' | 'D' | null {
  if (game.active_players >= 20_000) return 'A';
  if (game.active_players >= 10_000) return 'B';
  if (game.active_players >= MIN_PLAYERS) return 'C';
  if (game.active_players_change_24h >= VIRAL_GROWTH_THRESHOLD) return 'D';
  return null;
}
