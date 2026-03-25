import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { getGameBySlug } from '@/lib/data/public';
import { getPublishGroup } from '@/lib/ranking';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getGameBySlug(slug);
  if (!page) return { title: 'Game not found' };

  const title = `Is ${page.name} Worth It? (${new Date().getFullYear()} Honest Review)`;
  const description = `An honest, data-driven verdict on whether ${page.name} is worth your time and Robux in ${new Date().getFullYear()}. Player count, rating, and community signals reviewed.`;

  return {
    title,
    description,
    robots: { index: false },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/games/${slug}/is-it-worth-it`,
    },
    openGraph: { title, description },
  };
}

function getVerdict(
  activePlayers: number,
  ratingPct: number | null,
  verifiedByCommunity: boolean,
): { label: string; color: string; text: string } {
  const rating = ratingPct ?? 70;

  if (activePlayers >= 20_000 && rating >= 80 && verifiedByCommunity) {
    return {
      label: 'Highly Recommended',
      color: 'emerald',
      text: 'Exceptional player count, strong community rating, and community-verified. This is one of the best experiences on Roblox right now.',
    };
  }
  if (activePlayers >= 10_000 && rating >= 65) {
    return {
      label: 'Worth Playing',
      color: 'brand',
      text: 'Solid player base and good community ratings. Most players find this game enjoyable — worth at least trying for free.',
    };
  }
  if (activePlayers >= 5_000 && rating >= 50) {
    return {
      label: 'Decent',
      color: 'amber',
      text: 'Above the 5,000-player threshold with acceptable ratings. A solid choice if you enjoy the genre, but not a must-play.',
    };
  }
  return {
    label: 'Mixed',
    color: 'slate',
    text: 'Lower activity or ratings than our benchmarks. Try it free first before spending Robux.',
  };
}

const verdictColors: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  brand:   { bg: 'bg-brand-50',   text: 'text-brand-800',   border: 'border-brand-200' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-800',   border: 'border-amber-200' },
  slate:   { bg: 'bg-slate-50',   text: 'text-slate-700',   border: 'border-slate-200' },
};

export default async function IsItWorthItPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getGameBySlug(slug);
  if (!page) notFound();

  const verdict = getVerdict(page.active_players, page.rating_percentage, page.verified_by_community);
  const group = getPublishGroup({ active_players: page.active_players, active_players_change_24h: page.active_players_change_24h });
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const colors = (verdictColors[verdict.color] ?? verdictColors['slate'])!;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';

  const faqJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Is ${page.name} worth playing in ${new Date().getFullYear()}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${verdict.label}. ${verdict.text} Currently ${new Intl.NumberFormat('en-US').format(page.active_players)} players are active.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is ${page.name}'s community rating?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: page.rating_percentage != null
            ? `${page.name} has a ${page.rating_percentage}% positive rating on Roblox based on community thumbs-up votes.`
            : `Community rating data for ${page.name} is not currently available.`,
        },
      },
    ],
  })
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  const breadcrumbJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'McRome', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Games', item: `${siteUrl}/games` },
      { '@type': 'ListItem', position: 3, name: page.name, item: `${siteUrl}/games/${slug}` },
      { '@type': 'ListItem', position: 4, name: 'Is It Worth It?', item: `${siteUrl}/games/${slug}/is-it-worth-it` },
    ],
  })
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  const lastUpdated = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="py-8 md:py-10">
      <Container>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd }} />

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-700 transition-colors">McRome</Link>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <Link href="/games" className="hover:text-slate-700 transition-colors">Games</Link>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <Link href={`/games/${slug}`} className="hover:text-slate-700 transition-colors">{page.name}</Link>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <span className="text-slate-700 font-medium" aria-current="page">Is It Worth It?</span>
        </nav>

        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Is {page.name} Worth It? ({new Date().getFullYear()})
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              A data-driven verdict based on live player counts, community ratings, and McRome
              quality signals. Last updated {lastUpdated}.
            </p>
          </div>

          {/* Verdict card */}
          <section className={`rounded-3xl border ${colors.border} ${colors.bg} p-6`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Our verdict</p>
            <p className={`mt-2 text-2xl font-bold ${colors.text}`}>{verdict.label}</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{verdict.text}</p>
          </section>

          {/* Data points */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold text-slate-950">Data behind the verdict</h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">Active players</dt>
                <dd className="mt-2 text-2xl font-bold text-slate-950">
                  {new Intl.NumberFormat('en-US').format(page.active_players)}
                </dd>
                {page.active_players_change_24h !== 0 && (
                  <dd className={`mt-0.5 text-xs font-semibold ${page.active_players_change_24h > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {page.active_players_change_24h > 0 ? '+' : ''}
                    {new Intl.NumberFormat('en-US').format(page.active_players_change_24h)} (24h)
                  </dd>
                )}
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">Community rating</dt>
                <dd className="mt-2 text-2xl font-bold text-slate-950">
                  {page.rating_percentage != null ? `${page.rating_percentage}%` : 'N/A'}
                </dd>
                <dd className="mt-0.5 text-xs text-slate-400">thumbs up on Roblox</dd>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">Popularity tier</dt>
                <dd className="mt-2 text-2xl font-bold text-slate-950">Tier {group ?? 'D'}</dd>
                <dd className="mt-0.5 text-xs text-slate-400">
                  {group === 'A' ? '20k+ players' : group === 'B' ? '10–20k players' : group === 'C' ? '5–10k players' : 'Growing fast'}
                </dd>
              </div>

              {page.verified_by_community && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 sm:col-span-2 lg:col-span-1">
                  <dt className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Community verified</dt>
                  <dd className="mt-2 text-sm text-emerald-800">
                    Real players have verified the quality of this game on McRome.
                    {page.community_verification_count > 0 && (
                      <span className="ml-1 font-semibold">
                        ({page.community_verification_count} verifications)
                      </span>
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {/* Pros / Cons */}
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
              <h2 className="font-bold text-emerald-900">Reasons to play</h2>
              <ul className="mt-3 space-y-2 text-sm text-emerald-800">
                <li>✓ Free to start — no upfront cost</li>
                <li>✓ {new Intl.NumberFormat('en-US').format(page.active_players)} active players means a lively community</li>
                {page.rating_percentage != null && page.rating_percentage >= 70 && (
                  <li>✓ {page.rating_percentage}% positive rating from the community</li>
                )}
                {page.verified_by_community && <li>✓ Community-verified on McRome</li>}
                {page.trend_spike_label && <li>✓ {page.trend_spike_label} — momentum is building</li>}
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="font-bold text-slate-900">Things to consider</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>· Some items require Robux to unlock</li>
                <li>· Public servers can be crowded — private server recommended for serious farming</li>
                {page.rating_percentage != null && page.rating_percentage < 60 && (
                  <li>· Mixed community ratings — try free first</li>
                )}
                <li>· Game updates may change mechanics — check McRome for the latest data</li>
              </ul>
            </div>
          </section>

          {/* Related links */}
          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
            <a
              href={`/games/${slug}/codes`}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Free codes →
            </a>
            <a
              href={`/games/${slug}/robux-costs`}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Robux costs →
            </a>
            <a
              href={`/games/${slug}/private-server-cost`}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Private server →
            </a>
            <Link
              href={`/games/${slug}`}
              className="text-sm font-semibold text-brand-600 hover:underline self-center ml-auto"
            >
              ← Full guide
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
