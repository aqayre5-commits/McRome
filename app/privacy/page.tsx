import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How McRome collects and uses data when you visit our Roblox guides.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="py-8 md:py-10">
      <Container>
        <div className="mx-auto max-w-3xl space-y-8">
          <header>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Legal</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Privacy Policy</h1>
            <p className="mt-2 text-sm text-slate-500">Last updated: March 2026</p>
          </header>

          <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-soft text-sm leading-7 text-slate-700">
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-950">Overview</h2>
              <p>
                At McRome (<strong>mcrome.com</strong>), we take your privacy seriously. You do not need
                to create an account or provide any personal data to access our Roblox guides.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-950">Data we collect</h2>
              <p>
                We collect standard analytical data to improve the site experience. This includes IP
                address, browser type, pages visited, and approximate geographic region. This data is
                collected via cookies and is processed by Google Analytics (GA4).
              </p>
              <p>
                If you use our community code-verification feature, we derive a hashed fingerprint
                (SHA-256 of your IP address and browser user-agent) solely to prevent duplicate votes.
                This fingerprint cannot be reversed to identify you personally.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-950">How we use your data</h2>
              <ul className="list-disc space-y-1 pl-5">
                <li>To understand which pages are most useful to visitors.</li>
                <li>To detect your region and display relevant Robux pricing.</li>
                <li>To prevent spam votes on our code-verification tool.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-950">Third-party services</h2>
              <p>
                We use Google Analytics for traffic analysis and may display affiliate links to
                third-party retailers (such as Amazon). We do not sell, rent, or trade your personal
                data to any third party.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-950">Cookies</h2>
              <p>
                We use cookies for analytics and session management. You can disable cookies in your
                browser settings at any time. Disabling cookies will not prevent you from reading our
                guides.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-950">Contact</h2>
              <p>
                For privacy-related questions, email us at{' '}
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
