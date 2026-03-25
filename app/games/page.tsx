import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { SearchForm } from '@/components/site/search-form';
import { GameGrid } from '@/components/roblox/game-grid';
import { getGames } from '@/lib/data/public';

export const metadata: Metadata = {
  title: 'Roblox Game Guides — Codes, Player Counts & Robux Prices',
  description: 'Browse Roblox game guides with community-verified codes, live active player counts, and real-money Robux pricing. Updated daily.',
  alternates: { canonical: '/games' }
};

export default async function GamesPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? '';
  const pages = await getGames(query);

  return (
    <div className="py-8 md:py-10">
      <Container>
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">All game guides</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Roblox game guides
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700">
              Community-verified codes, live player counts, and Robux pricing for the most-played
              Roblox games. Search by game name below.
            </p>
          </div>

          <SearchForm defaultValue={query} action="/games" />
          <GameGrid pages={pages} />
        </div>
      </Container>
    </div>
  );
}
