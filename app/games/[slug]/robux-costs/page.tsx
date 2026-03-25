import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { Container } from '@/components/ui/container';
import { RobuxConverter } from '@/components/roblox/robux-converter';
import { getGameBySlug } from '@/lib/data/public';
import { getRequestCountry } from '@/lib/geo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getGameBySlug(slug);
  if (!page) return { title: 'Game not found' };

  const title = `${page.name} Robux Costs — USD, GBP, EUR & BRL Prices`;
  const description = `How much do ${page.name} game passes, VIP perks and in-game items cost in real money? Use our Robux converter for live 2026 rates in your local currency.`;

  return {
    title,
    description,
    robots: { index: false },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/games/${slug}/robux-costs`,
    },
    openGraph: { title, description },
  };
}

export default async function RobuxCostsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getGameBySlug(slug);
  if (!page) notFound();

  const headerList = await headers();
  const countryCode = getRequestCountry(headerList);
  const acceptLanguage = headerList.get('accept-language') ?? '';
  const lang: 'en' | 'pt' = countryCode === 'BR' && /\bpt\b/i.test(acceptLanguage) ? 'pt' : 'en';

  const lastUpdated = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';

  const breadcrumbJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'McRome', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Games', item: `${siteUrl}/games` },
      { '@type': 'ListItem', position: 3, name: page.name, item: `${siteUrl}/games/${slug}` },
      { '@type': 'ListItem', position: 4, name: 'Robux Costs', item: `${siteUrl}/games/${slug}/robux-costs` },
    ],
  })
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  return (
    <div className="py-8 md:py-10">
      <Container>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }}
        />

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-700 transition-colors">McRome</Link>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <Link href="/games" className="hover:text-slate-700 transition-colors">Games</Link>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <Link href={`/games/${slug}`} className="hover:text-slate-700 transition-colors">{page.name}</Link>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <span className="text-slate-700 font-medium" aria-current="page">Robux Costs</span>
        </nav>

        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              {page.name} Robux Costs ({new Date().getFullYear()})
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Convert {page.name} Robux prices to real money. Enter any Robux amount below to see
              exactly what it costs in USD, GBP, EUR, and BRL using {lastUpdated} rates.
            </p>
          </div>

          {/* Converter */}
          <RobuxConverter
            gameName={page.name}
            lastUpdated={lastUpdated}
            countryCode={countryCode}
            lang={lang}
          />

          {/* FAQ */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold text-slate-950">
              Frequently asked questions about {page.name} prices
            </h2>
            <dl className="mt-5 space-y-5">
              <div>
                <dt className="font-semibold text-slate-900">Is {page.name} free to play?</dt>
                <dd className="mt-1 text-sm leading-7 text-slate-600">
                  Yes. {page.name} is free on Roblox across mobile, PC, and Xbox. Optional game
                  passes and in-game currency may cost Robux.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">
                  How much is 800 Robux in real money?
                </dt>
                <dd className="mt-1 text-sm leading-7 text-slate-600">
                  At 2026 purchase rates, 800 Robux costs approximately $9.99 USD. Use the converter
                  above for your exact local currency.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">
                  Do Roblox Premium members get a discount?
                </dt>
                <dd className="mt-1 text-sm leading-7 text-slate-600">
                  Premium members receive a 10% bonus on Robux purchases, effectively reducing the
                  per-Robux price. The converter shows standard pricing — apply a 10% discount for
                  Premium rates.
                </dd>
              </div>
            </dl>
          </section>

          {/* Back link */}
          <div className="border-t border-slate-200 pt-6">
            <Link
              href={`/games/${slug}`}
              className="text-sm font-semibold text-brand-600 hover:underline"
            >
              ← Back to {page.name} full guide
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
