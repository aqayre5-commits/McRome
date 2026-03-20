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
