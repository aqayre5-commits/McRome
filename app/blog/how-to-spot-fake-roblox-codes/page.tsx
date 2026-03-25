import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button-link';

export const metadata: Metadata = {
  title: 'How to Spot Fake Roblox Code Sites (2026 Guide)',
  description:
    'Fake Roblox code sites steal your time and sometimes your account. Learn the warning signs, how to verify codes safely, and which sources to trust in 2026.',
  alternates: { canonical: '/blog/how-to-spot-fake-roblox-codes' },
  openGraph: {
    type: 'article',
    title: 'How to Spot Fake Roblox Code Sites (2026 Guide)',
    description:
      'Fake Roblox code sites steal your time and sometimes your account. Learn the warning signs and how to verify codes safely.',
  },
};

const SCHEMA = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to Spot Fake Roblox Code Sites (2026 Guide)',
  description:
    'Fake Roblox code sites steal your time and sometimes your account. Learn the warning signs, how to verify codes safely, and which sources to trust in 2026.',
  author: { '@type': 'Organization', name: 'McRome' },
  publisher: { '@type': 'Organization', name: 'McRome' },
  datePublished: '2026-03-20',
  dateModified: '2026-03-20',
  url: 'https://mcrome.com/blog/how-to-spot-fake-roblox-codes',
})
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e')
  .replace(/&/g, '\\u0026');

export default function FakeRobloxCodesPage() {
  return (
    <div className="py-8 md:py-10">
      <Container>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SCHEMA }} />

        <div className="mx-auto max-w-3xl space-y-8">
          <header>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Safety guide · 2026</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              How to Spot Fake Roblox Code Sites
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Hundreds of sites claim to have working Roblox codes. Most are fake — designed to waste
              your time with survey loops, steal your account credentials, or serve you malware. Here
              is how to tell the difference quickly.
            </p>
          </header>

          <div className="space-y-10 text-sm leading-7 text-slate-700">

            <section className="rounded-3xl border border-red-100 bg-red-50 p-8 space-y-5">
              <h2 className="text-2xl font-bold text-slate-950">Warning signs of a fake code site</h2>

              <div className="space-y-5">
                <div>
                  <h3 className="font-semibold text-slate-900">1. &quot;Human verification&quot; before seeing codes</h3>
                  <p className="mt-1">
                    This is the most common scam pattern. The site promises codes but forces you to
                    complete a survey, download an app, or &quot;verify you are human&quot; before revealing
                    them. Legitimate code sites do not do this. The survey is the product — you are
                    being used to generate ad revenue with no codes at the end.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">2. Codes with no working/expired status</h3>
                  <p className="mt-1">
                    Real code pages show you whether each code is currently working. If a site just
                    lists codes with no success rate, no &quot;last checked&quot; date, and no community
                    feedback, you have no way to know if the codes are valid. Most will be expired.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">3. Promises of free Robux</h3>
                  <p className="mt-1">
                    No website can give you free Robux. Roblox does not have a third-party code
                    system for currency — only game developers can distribute in-game currency for
                    their specific game. Any site claiming to give free Robux is lying and is likely
                    trying to steal your Roblox login credentials.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">4. Asking for your Roblox password</h3>
                  <p className="mt-1">
                    Never enter your Roblox password on any site other than roblox.com. Any site
                    asking for your username and password to &quot;verify&quot; or &quot;activate&quot; codes is a
                    phishing site. Your account will be stolen.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">5. Lists of 50+ codes for the same game</h3>
                  <p className="mt-1">
                    Most games have only a handful of active codes at any time. A site listing 50
                    codes for a single game is almost certainly padding with old, expired, or
                    completely fabricated codes to look comprehensive.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-8 space-y-5">
              <h2 className="text-2xl font-bold text-slate-950">How to verify codes safely</h2>

              <ol className="space-y-5">
                <li className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">1</span>
                  <div>
                    <p className="font-semibold text-slate-900">Check the official source first</p>
                    <p className="mt-1">
                      Most game developers post codes on their official Discord server, Twitter/X
                      account, or YouTube channel. A code announced on the developer&apos;s own channel
                      is guaranteed to be real (though it may expire quickly).
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">2</span>
                  <div>
                    <p className="font-semibold text-slate-900">Use community-voted code trackers</p>
                    <p className="mt-1">
                      Sites that show community success rates tell you immediately whether a code is
                      working based on real player attempts. A code with 85% working rate from 40
                      recent votes is reliably valid. A code with 10% working rate is expired —
                      do not waste time on it.
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">3</span>
                  <div>
                    <p className="font-semibold text-slate-900">Check when the code was last verified</p>
                    <p className="mt-1">
                      Codes expire without warning. A code verified working yesterday has a much
                      higher chance of still being valid than one that was last checked six months
                      ago. Always look for a &quot;last checked&quot; or &quot;last updated&quot; date.
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">4</span>
                  <div>
                    <p className="font-semibold text-slate-900">Vote after you try a code</p>
                    <p className="mt-1">
                      On McRome, every code has a working/not working vote. Taking five seconds to
                      vote after you try a code helps every other player who checks that page.
                      Community voting is what makes code tracking reliable.
                    </p>
                  </div>
                </li>
              </ol>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft space-y-3">
              <h2 className="text-2xl font-bold text-slate-950">What McRome does differently</h2>
              <p>
                Every code on McRome shows a working rate calculated from real player votes. We do
                not list codes without community data. We do not run survey gates. We do not ask for
                your Roblox login. Codes with low working rates are clearly flagged so you can skip
                them without trying.
              </p>
              <p>
                If you find a code that is listed as working but is actually expired, you can vote it
                down or email us at{' '}
                <a href="mailto:contact@mcrome.com" className="text-brand-600 hover:underline">
                  contact@mcrome.com
                </a>
                {' '}and we will update it.
              </p>
            </section>

            <div className="flex flex-wrap gap-3 pt-2">
              <ButtonLink href="/games">Browse game codes</ButtonLink>
              <ButtonLink href="/blog/roblox-essentials" variant="secondary">Roblox starter guide</ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
