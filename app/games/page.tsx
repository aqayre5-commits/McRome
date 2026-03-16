import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { SearchForm } from '@/components/site/search-form';
import { GameGrid } from '@/components/roblox/game-grid';
import { getGames } from '@/lib/data/public';

export const metadata: Metadata = {
  title: 'Game directory',
  description: 'Browse published Roblox game guides with fast answer blocks, key takeaways, and FAQs.',
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
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Game directory</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Search published Roblox guides
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700">
              Public pages include key takeaways, guide content, and FAQs. Search by game name or slug.
            </p>
          </div>

          <SearchForm defaultValue={query} action="/games" />
          <GameGrid pages={pages} />
        </div>
      </Container>
    </div>
  );
}
