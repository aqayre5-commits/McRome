import type { RobloxPage } from '@/lib/types';
import { GameCard } from '@/components/roblox/game-card';

export function GameGrid({ pages }: { pages: RobloxPage[] }) {
  if (!pages.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
        No published pages found for this query.
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {pages.map((page) => (
        <GameCard key={page.id} page={page} />
      ))}
    </div>
  );
}
