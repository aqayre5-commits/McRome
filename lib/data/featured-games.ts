/**
 * Static fallback list of top Roblox games.
 * Used when the Supabase DB has no published pages yet (e.g. fresh deploy).
 * Slugs match the uniqueSlug() format: {slugified-name}-{roblox-game-id}
 * Update icon URLs and slugs once your sync cron has run.
 */

export type StaticGame = {
  id: number;
  name: string;
  slug: string;
  icon_url: string;
  active_players: number;
  genre: string;
};

export const FEATURED_GAMES: StaticGame[] = [
  {
    id: 2753915549,
    name: 'Blox Fruits',
    slug: 'blox-fruits-2753915549',
    icon_url: 'https://tr.rbxcdn.com/180DAY-53fb65b5b7a5db3ad1fce5e5a0bca4c5/150/150/Image/Png/noFilter',
    active_players: 420000,
    genre: 'Adventure',
  },
  {
    id: 6284583030,
    name: 'Pet Simulator 99',
    slug: 'pet-simulator-99-6284583030',
    icon_url: 'https://tr.rbxcdn.com/180DAY-fa13e5b32a25fde2b1f4db29a99a1df7/150/150/Image/Png/noFilter',
    active_players: 310000,
    genre: 'Simulator',
  },
  {
    id: 286090429,
    name: 'Arsenal',
    slug: 'arsenal-286090429',
    icon_url: 'https://tr.rbxcdn.com/180DAY-d30de3bb98c66b2b3f5cc3ecb7d5d9c2/150/150/Image/Png/noFilter',
    active_players: 85000,
    genre: 'Shooter',
  },
  {
    id: 3260590327,
    name: 'Adopt Me!',
    slug: 'adopt-me-3260590327',
    icon_url: 'https://tr.rbxcdn.com/180DAY-0e02e8e7c3ec7b5b7a5e25a5b5b7a5db/150/150/Image/Png/noFilter',
    active_players: 280000,
    genre: 'Social',
  },
  {
    id: 5806338729,
    name: 'Murder Mystery 2',
    slug: 'murder-mystery-2-5806338729',
    icon_url: 'https://tr.rbxcdn.com/180DAY-1234567890abcdef1234567890abcdef/150/150/Image/Png/noFilter',
    active_players: 62000,
    genre: 'Mystery',
  },
  {
    id: 4924922222,
    name: 'Anime Adventures',
    slug: 'anime-adventures-4924922222',
    icon_url: 'https://tr.rbxcdn.com/180DAY-abcdef1234567890abcdef1234567890/150/150/Image/Png/noFilter',
    active_players: 74000,
    genre: 'Tower Defense',
  },
  {
    id: 1537690962,
    name: 'Royale High',
    slug: 'royale-high-1537690962',
    icon_url: 'https://tr.rbxcdn.com/180DAY-fedcba0987654321fedcba0987654321/150/150/Image/Png/noFilter',
    active_players: 55000,
    genre: 'Role Play',
  },
  {
    id: 2788229376,
    name: 'Brookhaven RP',
    slug: 'brookhaven-rp-2788229376',
    icon_url: 'https://tr.rbxcdn.com/180DAY-0987654321fedcba0987654321fedcba/150/150/Image/Png/noFilter',
    active_players: 190000,
    genre: 'Role Play',
  },
  {
    id: 4442272183,
    name: 'Anime Defenders',
    slug: 'anime-defenders-4442272183',
    icon_url: 'https://tr.rbxcdn.com/180DAY-aabbccdd11223344aabbccdd11223344/150/150/Image/Png/noFilter',
    active_players: 68000,
    genre: 'Tower Defense',
  },
  {
    id: 7449423635,
    name: 'Fisch',
    slug: 'fisch-7449423635',
    icon_url: 'https://tr.rbxcdn.com/180DAY-11223344aabbccdd11223344aabbccdd/150/150/Image/Png/noFilter',
    active_players: 95000,
    genre: 'Fishing',
  },
];
