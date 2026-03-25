import { headers } from 'next/headers';
import { Container } from '@/components/ui/container';
import { Hero } from '@/components/site/hero';
import { FeaturedGames } from '@/components/roblox/featured-games';
import { TrendingGames } from '@/components/roblox/trending-games';
import { RobuxConverter } from '@/components/roblox/robux-converter';
import { getRequestCountry } from '@/lib/geo';

export default async function HomePage() {
  const headerList = await headers();
  const countryCode = getRequestCountry(headerList);
  const acceptLanguage = headerList.get('accept-language') ?? '';
  const lang: 'en' | 'pt' = countryCode === 'BR' && /\bpt\b/i.test(acceptLanguage) ? 'pt' : 'en';

  return (
    <div className="py-8 md:py-10">
      <Container>
        <div className="space-y-10">
          <Hero />

          <FeaturedGames />

          <TrendingGames />

          <section className="space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">How it works</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Built for players, not search engines</h2>
              <p className="mt-2 text-sm text-slate-500">Every piece of data on McRome has a source. Here is exactly where it comes from.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  step: '1',
                  title: 'Live player data from Roblox',
                  body: 'Active player counts are pulled from the Roblox API every day. The 24-hour change tells you if a game is growing or cooling down — useful before you invest time in it.',
                },
                {
                  step: '2',
                  title: 'Codes voted on by real players',
                  body: 'Every code shows a working rate based on real player votes. Codes above 90% are confirmed working. Below 50% means expired. You can vote on any code you try.',
                },
                {
                  step: '3',
                  title: 'Robux prices in your currency',
                  body: 'Our converter uses verified 2026 web purchase rates. It automatically detects your region and shows prices in USD, GBP, EUR, or BRL so you know exactly what you are spending.',
                },
              ].map(({ step, title, body }) => (
                <article key={step} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{step}</span>
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{body}</p>
                </article>
              ))}
            </div>
          </section>

          <RobuxConverter
            gameName="any Roblox game"
            lastUpdated={new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            countryCode={countryCode}
            lang={lang}
          />
        </div>
      </Container>
    </div>
  );
}
