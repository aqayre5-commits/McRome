import { headers } from 'next/headers';
import { Container } from '@/components/ui/container';
import { Hero } from '@/components/site/hero';
import { GameGrid } from '@/components/roblox/game-grid';
import { ButtonLink } from '@/components/ui/button-link';
import { RobuxConverter } from '@/components/roblox/robux-converter';
import { getFeaturedPages } from '@/lib/data/public';
import { getRequestCountry } from '@/lib/geo';

export default async function HomePage() {
  const featuredPages = await getFeaturedPages(6);
  const headerList = await headers();
  const countryCode = getRequestCountry(headerList);
  const acceptLanguage = headerList.get('accept-language') ?? '';
  const lang: 'en' | 'pt' = countryCode === 'BR' && /\bpt\b/i.test(acceptLanguage) ? 'pt' : 'en';

  return (
    <div className="py-8 md:py-10">
      <Container>
        <div className="space-y-10">
          <Hero />

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Featured pages</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                  Published Roblox useful answers
                </h2>
              </div>
              <ButtonLink href="/games" variant="secondary">View all games</ButtonLink>
            </div>

            <GameGrid pages={featuredPages} />
          </section>

          <section className="grid gap-5 md:grid-cols-3">
            {[
              ['Instant Game Insights', 'Skip the fluff. Get 2026\'s most accurate Roblox guides with verified active player counts and key takeaways delivered in under 10 seconds.'],
              ['Real-Time Code Tracking', 'Our community-driven engine tracks code expirations daily. Never waste time on an expired reward again with our success-rate badges.'],
              ['Global Value Tools', 'Use our smart converter to see real-time Robux-to-USD rates. Automatically localized for US, UK, EU, and Brazil to help you spend smarter.']
            ].map(([title, body]) => (
              <article key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-700">{body}</p>
              </article>
            ))}
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
