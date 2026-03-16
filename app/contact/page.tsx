import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the McRome team — report codes, bugs, or general enquiries.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <div className="py-8 md:py-10">
      <Container>
        <div className="mx-auto max-w-3xl space-y-8">
          <header>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Contact</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Get in touch</h1>
          </header>

          <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-soft text-sm leading-7 text-slate-700">
            <p>
              Whether you have a new code to report, found a bug in our calculator, or just want to
              say hello — we read every message.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  label: 'General enquiries',
                  value: 'contact@mcrome.com',
                  detail: 'Questions, feedback, partnerships.',
                },
                {
                  label: 'Code reports',
                  value: 'contact@mcrome.com',
                  detail: 'New codes or expired code alerts.',
                },
              ].map(({ label, value, detail }) => (
                <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
                  <a
                    href={`mailto:${value}`}
                    className="mt-1 block text-base font-semibold text-brand-600 hover:underline"
                  >
                    {value}
                  </a>
                  <p className="mt-1 text-xs text-slate-500">{detail}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="font-medium text-slate-800">Response time</p>
              <p className="mt-1 text-slate-600">We usually respond within 24–48 hours.</p>
            </div>

            <section className="space-y-4 border-t border-slate-100 pt-6">
              <h2 className="text-base font-semibold text-slate-950">Frequently asked questions</h2>
              <div className="space-y-4">
                {[
                  {
                    q: 'Are the codes on this site safe?',
                    a: 'Yes. We only list official codes provided by game developers. We never ask for your Roblox password or account details.',
                  },
                  {
                    q: 'Why does the Robux price change by region?',
                    a: 'Our system detects your region automatically. Prices in the UK, EU, and Brazil are adjusted based on 2026 exchange rates and local taxes.',
                  },
                  {
                    q: 'How do I verify a code?',
                    a: "Click the 'Working' or 'Expired' button next to any code on a game page. Your vote updates the community success rate in real time.",
                  },
                ].map(({ q, a }) => (
                  <details key={q} className="group rounded-2xl border border-slate-200 bg-white">
                    <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-slate-900">
                      {q}
                    </summary>
                    <p className="px-5 pb-4 text-sm text-slate-600">{a}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}
