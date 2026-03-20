import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import { getTrendingPages } from '@/lib/data/public';
import { GameIconImage } from '@/components/roblox/game-icon-image';
import { formatNumber } from '@/lib/utils';

const PLACEHOLDER_IMG = '/images/game-placeholder.svg';

export async function TrendingGames() {
  noStore();
  const games = await getTrendingPages(8);

  // Don't render the section at all if no trending data exists yet
  if (!games.length) return null;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-600">
          Trending now
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Games blowing up right now
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Fastest-growing Roblox games in the last 24 hours.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {games.map((game) => (
          <article
            key={game.id}
            className="group flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-3 transition-shadow hover:shadow-md"
          >
            <Link
              href={`/games/${game.slug}`}
              title={`${game.name} Roblox guide — trending now`}
              className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl"
            >
              <GameIconImage
                src={game.icon_url ?? PLACEHOLDER_IMG}
                alt={`${game.name} icon`}
                className="h-full w-full object-cover"
              />
            </Link>

            <div className="min-w-0 flex-1">
              <Link
                href={`/games/${game.slug}`}
                className="line-clamp-1 text-sm font-bold text-slate-900 transition-colors hover:text-amber-700"
              >
                {game.name}
              </Link>
              <p className="text-xs text-slate-500">
                {formatNumber(game.active_players)} players
                {game.active_players_change_24h > 0 && (
                  <span className="ml-1 font-semibold text-emerald-600">
                    +{formatNumber(game.active_players_change_24h)}
                  </span>
                )}
              </p>
              {game.trend_spike_label && (
                <span className="mt-1 inline-block rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  {game.trend_spike_label}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
