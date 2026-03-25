import { ButtonLink } from '@/components/ui/button-link';
import { SearchForm } from '@/components/site/search-form';

export function Hero() {
  return (
    <section className="rounded-3xl bg-slate-950 px-6 py-12 text-white shadow-soft md:px-10 md:py-16">
      <div className="grid gap-8 md:grid-cols-[1.2fr,0.8fr] md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-300">
            Roblox game guides
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Verified codes, real player counts, and Robux pricing for every Roblox game
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Community-verified codes, live active player counts, and regional Robux converter — so you spend less time searching and more time playing.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/games">Browse games</ButtonLink>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="mb-4 text-sm font-semibold text-slate-200">Find a game page</p>
          <SearchForm action="/games" />
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>1. Search a game.</li>
            <li>2. Read key takeaways and FAQ.</li>
            <li>3. Check codes, converter, and community verifications.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
