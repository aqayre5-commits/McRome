import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { CodeVoteSection } from '@/components/roblox/code-vote-section';
import { getGameBySlug } from '@/lib/data/public';
import { getCodesWithVotes } from '@/lib/data/codes';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getGameBySlug(slug);
  if (!page) return { title: 'Game not found' };

  const title = `${page.name} Codes (${new Date().getFullYear()}) — Working & Expired`;
  const description = `All active and expired codes for ${page.name} on Roblox. Community-verified success rates updated daily. Redeem codes for free rewards.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/games/${slug}/codes`,
    },
    openGraph: { title, description },
  };
}

export default async function CodesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [page, codesWithVotes] = await Promise.all([
    getGameBySlug(slug),
    getGameBySlug(slug).then((p) => (p ? getCodesWithVotes(p.id) : [])),
  ]);

  if (!page) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';

  const breadcrumbJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'McRome', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Games', item: `${siteUrl}/games` },
      { '@type': 'ListItem', position: 3, name: page.name, item: `${siteUrl}/games/${slug}` },
      { '@type': 'ListItem', position: 4, name: 'Codes', item: `${siteUrl}/games/${slug}/codes` },
    ],
  })
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  const activeCodes = codesWithVotes.filter(
    (c) => c.success_rate_24h === null || c.success_rate_24h >= 50,
  );
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

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
          <span className="text-slate-700 font-medium" aria-current="page">Codes</span>
        </nav>

        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              {page.name} Codes ({new Date().getFullYear()})
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              All working and expired codes for {page.name}. Community members vote on each code
              daily — check the success-rate badge before redeeming. Updated {lastUpdated}.
            </p>

            {activeCodes.length > 0 && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-sm font-semibold text-emerald-800">
                  {activeCodes.length} working code{activeCodes.length !== 1 ? 's' : ''} right now:
                  {' '}{activeCodes.slice(0, 3).map((c) => c.code_text).join(', ')}
                  {activeCodes.length > 3 ? ` + ${activeCodes.length - 3} more` : ''}.
                </p>
              </div>
            )}
          </div>

          {/* How to Redeem */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold text-slate-950">How to redeem codes in {page.name}</h2>
            <ol className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">1</span>
                Open {page.name} on Roblox (mobile, PC, or Xbox).
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">2</span>
                Look for a <strong>Twitter bird icon</strong>, <strong>Codes</strong> button, or{' '}
                <strong>Settings menu</strong> on the main screen or pause menu.
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">3</span>
                Type or paste the code exactly as shown — codes are <strong>case-sensitive</strong>.
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">4</span>
                Press <strong>Confirm</strong> or <strong>Redeem</strong> to claim your reward.
              </li>
            </ol>
          </section>

          {/* Code vote section */}
          <CodeVoteSection codes={codesWithVotes} />

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
