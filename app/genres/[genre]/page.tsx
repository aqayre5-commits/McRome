import { unstable_noStore as noStore } from 'next/cache';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { GameIconImage } from '@/components/roblox/game-icon-image';
import { getGamesByGenre } from '@/lib/data/public';
import { formatNumber } from '@/lib/utils';

type Props = { params: Promise<{ genre: string }> };

function prettifyGenre(raw: string): string {
  return raw
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { genre } = await params;
  const pretty = prettifyGenre(genre);
  const title = `Best ${pretty} Roblox Games (${new Date().getFullYear()})`;
  const description = `Top-rated ${pretty} games on Roblox sorted by active players. Guides, working codes, and player data for every game.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/genres/${genre}`,
    },
    openGraph: { title, description },
  };
}

const PLACEHOLDER_IMG = '/images/game-placeholder.svg';

export default async function GenrePage({ params }: Props) {
  noStore();
  const { genre } = await params;
  const pretty = prettifyGenre(genre);

  // Genre slugs are hyphenated lowercase; DB stores them in their original form.
  // Try exact match first, then try title-cased version.
  const games = await getGamesByGenre(pretty, 48);

  if (games.length === 0) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';

  const breadcrumbJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'McRome', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Games', item: `${siteUrl}/games` },
      { '@type': 'ListItem', position: 3, name: pretty, item: `${siteUrl}/genres/${genre}` },
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
          <Link href="/games" className="hover:text-slate-700 transition-colors">Games</Link>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <span className="text-slate-700 font-medium" aria-current="page">{pretty}</span>
        </nav>

        <div className="space-y-8">
          {/* Header */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
              Genre
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Best {pretty} Roblox Games ({new Date().getFullYear()})
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {games.length} game{games.length !== 1 ? 's' : ''} found. Sorted by active players.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {games.map((game) => (
              <article
                key={game.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition-shadow hover:shadow-md"
              >
                <Link
                  href={`/games/${game.slug}`}
                  title={`${game.name} — ${pretty} Roblox game guide`}
                  className="block"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                    <GameIconImage
                      src={game.icon_url ?? PLACEHOLDER_IMG}
                      alt={`${game.name} icon`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {game.trend_spike_label && (
                      <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                        {game.trend_spike_label}
                      </span>
                    )}
                    {game.verified_by_community && (
                      <span className="absolute right-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                        Verified
                      </span>
                    )}
                  </div>
                </Link>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <h2 className="line-clamp-1 text-sm font-bold text-slate-900">
                      <Link
                        href={`/games/${game.slug}`}
                        title={`${game.name} guide — codes and tips`}
                        className="transition-colors hover:text-brand-600"
                      >
                        {game.name}
                      </Link>
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatNumber(game.active_players)} active players
                      {game.active_players_change_24h > 0 && (
                        <span className="ml-1 text-emerald-600">
                          +{formatNumber(game.active_players_change_24h)}
                        </span>
                      )}
                    </p>
                  </div>

                  <Link
                    href={`/games/${game.slug}`}
                    title={`View codes for ${game.name}`}
                    className="mt-auto inline-flex items-center justify-center rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-700"
                  >
                    View Codes →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Back */}
          <div className="border-t border-slate-200 pt-6">
            <Link href="/games" className="text-sm font-semibold text-brand-600 hover:underline">
              ← Browse all games
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
