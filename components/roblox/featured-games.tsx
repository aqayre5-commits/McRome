import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import { getFeaturedPages, getSponsoredGames } from '@/lib/data/public';
import { FEATURED_GAMES, type StaticGame } from '@/lib/data/featured-games';
import { formatNumber } from '@/lib/utils';
import { GameIconImage } from '@/components/roblox/game-icon-image';
import type { RobloxPage } from '@/lib/types';

const PLACEHOLDER_IMG = '/images/game-placeholder.svg';

// Normalise DB rows and static entries into a single shape for the grid
type GameEntry = {
  id: number;
  name: string;
  slug: string;
  icon_url: string | null;
  active_players: number;
  active_players_change_24h: number;
  genre: string | null;
  trend_spike_label: string | null;
  verified_by_community: boolean;
  is_sponsored: boolean;
};

function fromPage(p: RobloxPage): GameEntry {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    icon_url: p.icon_url ?? null,
    active_players: p.active_players,
    active_players_change_24h: p.active_players_change_24h ?? 0,
    genre: p.genre ?? null,
    trend_spike_label: p.trend_spike_label ?? null,
    verified_by_community: p.verified_by_community ?? false,
    is_sponsored: p.is_sponsored ?? false,
  };
}

function fromStatic(s: StaticGame): GameEntry {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    icon_url: s.icon_url || null,
    active_players: s.active_players,
    active_players_change_24h: 0,
    genre: s.genre,
    trend_spike_label: null,
    verified_by_community: false,
    is_sponsored: false,
  };
}

export async function FeaturedGames() {
  noStore();
  const [dbGames, sponsored] = await Promise.all([
    getFeaturedPages(12),
    getSponsoredGames(),
  ]);

  const hasDbData = dbGames.length > 0;
  const organic: GameEntry[] = hasDbData
    ? dbGames.map(fromPage)
    : FEATURED_GAMES.map(fromStatic);

  // Sponsored games are injected at the front when they exist.
  // Currently no game has is_sponsored=true so this array is always empty.
  const sponsoredEntries: GameEntry[] = sponsored.map(fromPage);
  const games: GameEntry[] = [...sponsoredEntries, ...organic].slice(0, 12);

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
            Featured games
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Top Roblox games right now
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sorted by active players. Community-verified codes updated daily.
          </p>
        </div>
        <Link
          href="/games"
          title="Browse all Roblox game guides on McRome"
          className="shrink-0 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          View all games
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {games.map((game) => (
          <article
            key={game.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition-shadow hover:shadow-md"
          >
            {/* Game icon */}
            <Link
              href={`/games/${game.slug}`}
              title={`Latest Roblox codes for ${game.name}`}
              className="block"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                <GameIconImage
                  src={game.icon_url ?? PLACEHOLDER_IMG}
                  alt={`Roblox codes for ${game.name}`}
                  title={`${game.name} — ${formatNumber(game.active_players)} active players`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {game.trend_spike_label ? (
                  <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                    {game.trend_spike_label}
                  </span>
                ) : null}

                {game.is_sponsored ? (
                  <span className="absolute right-2 top-2 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                    Promoted
                  </span>
                ) : game.verified_by_community ? (
                  <span className="absolute right-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                    Verified
                  </span>
                ) : null}
              </div>
            </Link>

            {/* Card body */}
            <div className="flex flex-1 flex-col gap-3 p-4">
              <div>
                <h3 className="line-clamp-1 text-sm font-bold text-slate-900">
                  <Link
                    href={`/games/${game.slug}`}
                    title={`${game.name} Roblox guide — codes, tips & player count`}
                    className="transition-colors hover:text-brand-600"
                  >
                    {game.name}
                  </Link>
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {formatNumber(game.active_players)} active players
                  {game.active_players_change_24h > 0 ? (
                    <span className="ml-1 text-emerald-600">
                      +{formatNumber(game.active_players_change_24h)}
                    </span>
                  ) : game.active_players_change_24h < 0 ? (
                    <span className="ml-1 text-red-500">
                      {formatNumber(game.active_players_change_24h)}
                    </span>
                  ) : null}
                </p>
              </div>

              {hasDbData ? (
                <Link
                  href={`/games/${game.slug}`}
                  title={`${game.name} guide — codes, tips & player count`}
                  className="mt-auto inline-flex items-center justify-center rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-700"
                >
                  View guide →
                </Link>
              ) : (
                <span className="mt-auto inline-flex items-center justify-center rounded-xl bg-slate-200 px-3 py-2 text-xs font-bold text-slate-400 cursor-default">
                  Coming soon
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
