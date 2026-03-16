import { headers } from 'next/headers';
import { Container } from '@/components/ui/container';
import { PricingTable } from '@/components/pricing/pricing-table';
import { getRequestCountry } from '@/lib/geo';

export const metadata = {
  title: 'Pricing',
  description: 'Simple plans for McRome. Free public pages. Pro unlocks saved games, account tools, and region-aware checkout.',
  alternates: { canonical: '/pricing' }
};

export default async function PricingPage({
  searchParams
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const [headerList, sp] = await Promise.all([headers(), searchParams]);
  const countryCode = getRequestCountry(headerList);

  return (
    <div className="py-8 md:py-10">
      <Container>
        <div className="space-y-6">
          {sp.checkout === 'error' ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              Checkout could not be started. Please try again.
            </div>
          ) : null}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Pricing</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Simple plans</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700">
              Public pages stay open. Pro adds account tools and uses region-aware checkout routing. Detected market: {countryCode}.
            </p>
          </div>
          <PricingTable countryCode={countryCode} />
        </div>
      </Container>
    </div>
  );
}
