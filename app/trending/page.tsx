import { unstable_noStore as noStore } from 'next/cache';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { GameIconImage } from '@/components/roblox/game-icon-image';
import { getTrendingPages } from '@/lib/data/public';
import { formatNumber } from '@/lib/utils';

export const metadata: Metadata = {
  title: `Trending Roblox Games Right Now (${new Date().getFullYear()})`,
  description:
    'Discover the fastest-growing Roblox games today. Sorted by 24-hour player growth — the games blowing up right now.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/trending`,
  },
};

const PLACEHOLDER_IMG = '/images/game-placeholder.svg';

export default async function TrendingPage() {
  noStore();
  const games = await getTrendingPages(50);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';

  const breadcrumbJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'McRome', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Trending', item: `${siteUrl}/trending` },
    ],
  })
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  return (
    <div className="py-8 md:py-10">
      <Container>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-700 transition-colors">McRome</Link>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <span className="text-slate-700 font-medium" aria-current="page">Trending</span>
        </nav>

        <div className="space-y-8">
          {/* Header */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-600">
              Live data
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Trending Roblox games right now
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Sorted by 24-hour player growth. Updated every time the sync cron runs.
            </p>
          </div>

          {games.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center">
              <p className="text-slate-500">No trending data yet — check back soon.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {games.map((game, index) => (
                <article
                  key={game.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-soft transition-shadow hover:shadow-md"
                >
                  <Link
                    href={`/games/${game.slug}`}
                    title={`${game.name} — trending on Roblox`}
                    className="block"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                      <GameIconImage
                        src={game.icon_url ?? PLACEHOLDER_IMG}
                        alt={`${game.name} icon`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Rank badge */}
                      <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white shadow">
                        #{index + 1}
                      </span>

                      {game.trend_spike_label && (
                        <span className="absolute bottom-2 left-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                          {game.trend_spike_label}
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div>
                      <h2 className="line-clamp-1 text-sm font-bold text-slate-900">
                        <Link
                          href={`/games/${game.slug}`}
                          className="transition-colors hover:text-amber-700"
                        >
                          {game.name}
                        </Link>
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {formatNumber(game.active_players)} active players
                        {game.active_players_change_24h > 0 && (
                          <span className="ml-1 font-semibold text-emerald-600">
                            +{formatNumber(game.active_players_change_24h)} today
                          </span>
                        )}
                      </p>
                    </div>

                    <Link
                      href={`/games/${game.slug}`}
                      title={`View guide for ${game.name}`}
                      className="mt-auto inline-flex items-center justify-center rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-amber-600"
                    >
                      View Guide →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Back to home */}
          <div className="border-t border-slate-200 pt-6">
            <Link href="/" className="text-sm font-semibold text-brand-600 hover:underline">
              ← Back to homepage
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
