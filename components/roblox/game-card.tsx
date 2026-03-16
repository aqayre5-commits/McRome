import Link from 'next/link';
import type { RobloxPage } from '@/lib/types';
import { formatNumber } from '@/lib/utils';

export function GameCard({ page }: { page: RobloxPage }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
      <Link href={`/games/${page.slug}`} className="block">
        <div className="aspect-[16/9] bg-slate-100">
          {page.icon_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={page.icon_url}
              alt={`${page.name} icon`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">No image</div>
          )}
        </div>
      </Link>

      <div className="space-y-3 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Game page</p>
          <h2 className="mt-1 line-clamp-2 text-lg font-semibold text-slate-900">
            <Link href={`/games/${page.slug}`}>{page.name}</Link>
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {formatNumber(page.active_players)} active
          </span>
          {page.genre ? (
            <span className="rounded-full bg-slate-100 px-3 py-1">{page.genre}</span>
          ) : null}
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-slate-700">
          {page.useful_summary ?? 'AI-enriched summary pending.'}
        </p>

        <Link
          href={`/games/${page.slug}`}
          className="inline-flex text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          Read useful answer
        </Link>
      </div>
    </article>
  );
}
