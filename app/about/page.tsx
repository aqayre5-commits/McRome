import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';

export const metadata: Metadata = {
  title: 'About McRome — Roblox Game Guides',
  description:
    'McRome provides community-verified Roblox game guides, working codes, and real-money Robux pricing. Learn how our data is collected, verified, and kept accurate.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="py-8 md:py-10">
      <Container>
        <div className="mx-auto max-w-3xl space-y-8">
          <header>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">About us</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">About McRome</h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              McRome helps Roblox players find working codes, understand what games are worth their
              time, and see exactly what Robux costs in their local currency — all in one place.
            </p>
          </header>

          <div className="space-y-8 text-sm leading-7 text-slate-700">

            {/* Mission */}
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft space-y-3">
              <h2 className="text-lg font-semibold text-slate-950">What McRome is</h2>
              <p>
                We publish game guides for the most-played Roblox experiences. Each guide covers the
                basics of the game, tips for new players, community-voted codes, and a Robux converter
                showing real-money prices in USD, GBP, EUR, and BRL.
              </p>
              <p>
                We only publish guides for games with a meaningful active player count. Low-traffic
                games are tracked but not published until they have enough community interest to be
                worth covering.
              </p>
            </section>

            {/* How data works */}
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft space-y-5">
              <h2 className="text-lg font-semibold text-slate-950">How our data works</h2>

              <div className="space-y-5">
                <div>
                  <h3 className="font-semibold text-slate-900">Active player counts</h3>
                  <p className="mt-1">
                    Player counts are pulled directly from the Roblox API once per day and shown on
                    every game page. We also show the 24-hour change so you can see if a game is
                    growing or losing players. These numbers are as accurate as Roblox&apos;s own data.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">Community code verification</h3>
                  <p className="mt-1">
                    Anyone can vote on whether a code is working or expired. Votes are counted and
                    displayed as a success rate on every code. A code showing 90%+ working rate has
                    been confirmed by multiple real players recently. A code below 50% has likely
                    expired — we flag it clearly so you don&apos;t waste time trying it.
                  </p>
                  <p className="mt-2">
                    We do not add codes automatically. Codes come from community submissions and are
                    shown with their vote data so you can judge their reliability yourself.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">Robux pricing</h3>
                  <p className="mt-1">
                    Our Robux converter uses 2026 web purchase rates verified against Roblox&apos;s
                    own pricing pages. We update rates when Roblox publishes pricing changes.
                    Rates are estimates — always confirm on roblox.com before purchasing.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">Guide content</h3>
                  <p className="mt-1">
                    Game guide summaries and FAQs are written to give players a quick overview of each
                    game. We review guides for accuracy and update them when games release major
                    updates. If you find an error, please report it using the contact details below.
                  </p>
                </div>
              </div>
            </section>

            {/* Editorial standards */}
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft space-y-3">
              <h2 className="text-lg font-semibold text-slate-950">Editorial standards</h2>
              <ul className="space-y-3">
                {[
                  'We only publish guides for games that have a meaningful, active player base.',
                  'Player counts and code success rates are sourced from real data — we do not estimate or fabricate these.',
                  'When a code expires, it is marked as expired. We do not remove expired codes — seeing what has expired is useful information.',
                  'If a guide contains an error, we correct it. Corrections are made as soon as they are reported.',
                  'We disclose affiliate links clearly. Amazon affiliate links on our site are marked and help support McRome at no extra cost to you.',
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Corrections */}
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft space-y-3">
              <h2 className="text-lg font-semibold text-slate-950">Corrections policy</h2>
              <p>
                If you find incorrect information on any McRome page — wrong player count, outdated
                guide content, a code listed as working that has expired, or anything else — please
                email us. We aim to correct factual errors within 24 hours of being notified.
              </p>
              <p>
                To report an error, include the page URL and what is incorrect. You do not need to
                provide a correction — just flagging the issue is enough.
              </p>
            </section>

            {/* Contact */}
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft space-y-3">
              <h2 className="text-lg font-semibold text-slate-950">Contact us</h2>
              <p>
                Questions, error reports, code submissions, or feedback — email us at{' '}
                <a href="mailto:contact@mcrome.com" className="text-brand-600 hover:underline font-medium">
                  contact@mcrome.com
                </a>
                . We read every message.
              </p>
            </section>

          </div>
        </div>
      </Container>
    </div>
  );
}
