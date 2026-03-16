import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';

export const metadata: Metadata = {
  title: 'About McRome',
  description: 'McRome is a data-driven Roblox guide engine built for instant, community-verified answers.',
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
          </header>

          <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-soft text-sm leading-7 text-slate-700">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-950">Our mission</h2>
              <p>
                McRome exists to provide <strong>Information Gain</strong> for the Roblox community.
                We built a programmatic guide engine to give players instant, data-driven answers —
                active player counts, community-verified codes, and regional Robux price conversion —
                so you spend less time searching and more time playing.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-950">What makes us different</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    title: 'Answer blocks',
                    body: 'Sub-100-word fast answers placed above the guide body for AI overview readiness and scan speed.',
                  },
                  {
                    title: 'Freshness signals',
                    body: 'Active player deltas, trend spike labels, and community vote counts create visible, real-time information gain.',
                  },
                  {
                    title: 'Regional accuracy',
                    body: 'Automatic geo-detection shows Robux prices and DevEx rates in your local currency using 2026 data.',
                  },
                ].map(({ title, body }) => (
                  <article key={title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <h3 className="font-semibold text-slate-900">{title}</h3>
                    <p className="mt-2 text-xs leading-6 text-slate-600">{body}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-950">Community verification</h2>
              <p>
                Every game code on McRome can be voted on by players. Working? Expired? The community
                decides, and success rates update in real time. This keeps our data honest and reduces
                the spread of outdated codes.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-950">Get in touch</h2>
              <p>
                Have a suggestion, found an error, or want to report a new code? Email us at{' '}
                <a href="mailto:contact@mcrome.com" className="text-brand-600 hover:underline">
                  contact@mcrome.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}
