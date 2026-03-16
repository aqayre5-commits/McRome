import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';

export const metadata: Metadata = {
  title: 'Disclaimer & Terms',
  description: 'McRome is a fan-made resource and is not affiliated with Roblox Corporation.',
  alternates: { canonical: '/disclaimer' },
};

export default function DisclaimerPage() {
  return (
    <div className="py-8 md:py-10">
      <Container>
        <div className="mx-auto max-w-3xl space-y-8">
          <header>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Legal</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Disclaimer &amp; Terms</h1>
            <p className="mt-2 text-sm text-slate-500">Last updated: March 2026</p>
          </header>

          <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-soft text-sm leading-7 text-slate-700">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-950">Fan-made resource</h2>
              <p>
                McRome (<strong>mcrome.com</strong>) is an independent, fan-made resource. We are{' '}
                <strong>not</strong> affiliated with, sponsored by, or endorsed by Roblox Corporation.
                &ldquo;Roblox&rdquo; and all associated game titles, logos, and trademarks are the
                property of Roblox Corporation.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-950">Game codes</h2>
              <p>
                All game codes listed on this site are provided for informational purposes only. Codes
                are managed and distributed by individual game developers, not by McRome. We cannot
                guarantee the validity, availability, or continued functionality of any code. Always
                verify codes directly in-game.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-950">Robux conversion rates</h2>
              <p>
                Robux-to-currency conversion rates shown on this site are estimates based on publicly
                available 2026 bundle pricing and Roblox&rsquo;s published Developer Exchange (DevEx)
                cashout rates. Actual amounts may vary depending on your payment method, platform
                (web, iOS, Android), Roblox Premium membership status, and regional taxation.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-950">Affiliate links</h2>
              <p>
                Some pages contain affiliate links to third-party retailers. If you make a purchase
                through one of these links, McRome may earn a small commission at no extra cost to you.
                We only link to official, reputable retailers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-950">Accuracy</h2>
              <p>
                We strive to keep all information accurate and up to date. However, the Roblox
                platform, game content, and pricing change frequently. McRome is not liable for any
                decisions made based on information found on this site.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-950">Contact</h2>
              <p>
                For legal enquiries, contact{' '}
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
