import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { UsefulAnswerArticle } from '@/components/roblox/useful-answer-article';
import { CodeVoteSection } from '@/components/roblox/code-vote-section';
import { SaveGameForm } from '@/components/roblox/save-game-form';
import { RobuxConverter } from '@/components/roblox/robux-converter';
import { CommunityVerifyForm } from '@/components/roblox/community-verify-form';
import { AdSlot } from '@/components/monetization/ad-slot';
import { RegionalOfferCard } from '@/components/monetization/regional-offer-card';
import { BetaTesterSignupForm } from '@/components/monetization/beta-tester-signup-form';
import { getGameBySlug } from '@/lib/data/public';
import { getCodesWithVotes } from '@/lib/data/codes';
import { getRequestCountry } from '@/lib/geo';
import { buildRegionalOffer } from '@/lib/monetization';
import { buildGameMetadata } from '@/lib/seo';

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getGameBySlug(slug);

  if (!page) {
    return { title: 'Game not found' };
  }

  return buildGameMetadata(page);
}

export default async function GameDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ verify?: string; beta?: string; country?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = await getGameBySlug(slug);
  const headerList = await headers();
  const detectedCountry = getRequestCountry(headerList);
  // ?country=BR overrides geolocation in non-production environments only
  const countryCode =
    process.env.NODE_ENV !== 'production' && sp.country
      ? sp.country.toUpperCase()
      : detectedCountry;

  // Use Portuguese UI when the browser language is pt-* AND the visitor is in Brazil.
  const acceptLanguage = headerList.get('accept-language') ?? '';
  const lang: 'en' | 'pt' = countryCode === 'BR' && /\bpt\b/i.test(acceptLanguage) ? 'pt' : 'en';

  if (!page) {
    notFound();
  }

  const offer = buildRegionalOffer(countryCode, page.name);
  const lastUpdated = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Fetch game codes and 24h vote tallies in parallel with no extra waterfalls.
  const codesWithVotes = await getCodesWithVotes(page.id);

  // Build an optional FAQ entry for the JSON-LD schema from the top-voted code.
  const topCode = codesWithVotes
    .filter((c) => c.total_votes_24h > 0)
    .sort((a, b) => b.total_votes_24h - a.total_votes_24h)[0];

  const topCodeFaq = topCode
    ? {
        q: `Is the "${topCode.code_text}" code still working in ${page.name}?`,
        a:
          topCode.success_rate_24h !== null && topCode.success_rate_24h >= 50
            ? `Yes — ${topCode.success_rate_24h}% of users verified this code as working in the last 24 hours (${topCode.total_votes_24h} vote${topCode.total_votes_24h !== 1 ? 's' : ''}).`
            : `This code has mixed or negative reports — ${topCode.success_rate_24h ?? 0}% working based on ${topCode.total_votes_24h} recent vote${topCode.total_votes_24h !== 1 ? 's' : ''}. It may be expired.`,
      }
    : undefined;

  // ── Data-driven FAQs ──────────────────────────────────────────────────────────
  // Built from live Supabase data so they are always accurate and match the
  // visible accordion content (Google's 2026 FAQ schema requirement).
  const activeCodes = codesWithVotes.filter((c) => c.success_rate_24h === null || c.success_rate_24h >= 50);
  const dataFaqs = [
    {
      q: `What are the latest working codes for ${page.name}?`,
      a: activeCodes.length > 0
        ? `As of ${lastUpdated}, community-verified working codes for ${page.name} include: ${activeCodes.slice(0, 5).map((c) => c.code_text).join(', ')}. Vote on any code above to keep success rates current.`
        : `No community-verified codes are listed for ${page.name} yet. Check back daily — McRome tracks code expirations in real time. When new codes drop, they appear here within 24 hours.`,
    },
    {
      q: `How many people are playing ${page.name} right now?`,
      a: `${page.name} currently has ${new Intl.NumberFormat('en-US').format(page.active_players)} active players, making it one of the most-played experiences on Roblox${page.trend_spike_label ? ` — and it's currently showing a ${page.trend_spike_label.toLowerCase()}` : ''}.`,
    },
    {
      q: `How do I redeem codes in ${page.name}?`,
      a: `To redeem codes in ${page.name}, open the game and look for a Twitter bird icon, Codes button, or Settings menu on the main screen. Enter the code exactly as shown (codes are case-sensitive) and press Confirm or Redeem. If a code doesn't work, it may have expired — check the success rate badge on McRome for a live status.`,
    },
    {
      q: `Is ${page.name} free to play?`,
      a: `Yes, ${page.name} is free to play on Roblox across mobile, PC, and Xbox. Some in-game items, game passes, and currency may require Robux. Use the McRome Robux converter on this page to see exactly what those cost in your local currency.`,
    },
  ];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const breadcrumbJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'McRome', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Games', item: `${siteUrl}/games` },
      { '@type': 'ListItem', position: 3, name: page.name, item: `${siteUrl}/games/${page.slug}` },
    ],
  })
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  return (
    <div className="py-8 md:py-10">
      <Container>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />

        {/* Visual breadcrumb trail — mirrors the JSON-LD for a perfect HCU signal */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
          <a href="/" className="hover:text-slate-700 transition-colors">McRome</a>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <a href="/games" className="hover:text-slate-700 transition-colors">Games</a>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <span className="text-slate-700 font-medium" aria-current="page">{page.name}</span>
        </nav>
        {process.env.NODE_ENV !== 'production' && sp.country ? (
          <div className="mb-6 rounded-2xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
            <span className="font-semibold">Testing mode:</span> geolocation overridden to{' '}
            <code className="rounded bg-yellow-100 px-1 font-mono">{sp.country.toUpperCase()}</code>.
            Remove <code className="rounded bg-yellow-100 px-1 font-mono">?country=</code> from the
            URL to restore real detection. This banner is hidden in production.
          </div>
        ) : null}

        {sp.verify === 'success' ? (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Thanks — your verification was recorded.
          </div>
        ) : sp.verify === 'error' ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            Verification could not be saved. Please try again.
          </div>
        ) : null}
        {sp.beta === 'success' ? (
          <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900">
            You&apos;re on the beta waitlist.
          </div>
        ) : sp.beta === 'error' ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            Beta signup failed. Please try again.
          </div>
        ) : null}

        <div className="grid gap-8 xl:grid-cols-[1fr,320px]">
          <div className="space-y-8">
            {/* Slot 1: above the article title */}
            <AdSlot slotId="REPLACE_SLOT_ID_ABOVE_TITLE" format="horizontal" />

            <UsefulAnswerArticle page={page} topCodeFaq={topCodeFaq} dataFaqs={dataFaqs} />

            {/* Slot 2: between Description (UsefulAnswerArticle) and Codes */}
            <AdSlot slotId="REPLACE_SLOT_ID_MID_CONTENT" format="auto" />

            <CodeVoteSection codes={codesWithVotes} />
            <RobuxConverter gameName={page.name} lastUpdated={lastUpdated} countryCode={countryCode} lang={lang} />
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="text-lg font-semibold text-slate-950">Actions</h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                Save this game page to your account dashboard for faster follow-up reads.
              </p>
              <div className="mt-4">
                <SaveGameForm pageId={page.id} redirectTo={`/games/${page.slug}`} />
              </div>
            </div>
            <CommunityVerifyForm
              pageId={page.id}
              redirectTo={`/games/${page.slug}`}
              verificationCount={page.community_verification_count}
              verifiedByCommunity={page.verified_by_community}
            />
            <BetaTesterSignupForm
              pageId={page.id}
              redirectTo={`/games/${page.slug}`}
              countryCode={countryCode}
            />
            <RegionalOfferCard offer={offer} />
            {/* Slot 3: sidebar */}
            <AdSlot slotId="REPLACE_SLOT_ID_SIDEBAR" format="vertical" />
          </aside>
        </div>
      </Container>
    </div>
  );
}
