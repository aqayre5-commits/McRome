import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { getGameBySlug } from '@/lib/data/public';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getGameBySlug(slug);
  if (!page) return { title: 'Game not found' };

  const title = `${page.name} Private Server Cost (${new Date().getFullYear()})`;
  const description = `How much does a private server in ${page.name} cost? Find the current Robux price and convert it to USD, GBP, EUR and BRL.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/games/${slug}/private-server-cost`,
    },
    openGraph: { title, description },
  };
}

const USD_PER_ROBUX = 0.0125; // 800 R = $9.99 (standard web purchase rate)

function formatUSD(robux: number) {
  return (robux * USD_PER_ROBUX).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
}

export default async function PrivateServerCostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getGameBySlug(slug);
  if (!page) notFound();

  const cost = page.private_server_cost_robux;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';

  const breadcrumbJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'McRome', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Games', item: `${siteUrl}/games` },
      { '@type': 'ListItem', position: 3, name: page.name, item: `${siteUrl}/games/${slug}` },
      { '@type': 'ListItem', position: 4, name: 'Private Server Cost', item: `${siteUrl}/games/${slug}/private-server-cost` },
    ],
  })
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  const faqJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How much does a private server cost in ${page.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: cost != null
            ? `A private server in ${page.name} costs ${cost.toLocaleString()} Robux (approximately ${formatUSD(cost)} USD at standard 2026 purchase rates).`
            : `Private server pricing for ${page.name} is not currently listed. Check the game's store page on Roblox for the latest price.`,
        },
      },
      {
        '@type': 'Question',
        name: `Is a private server in ${page.name} worth it?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Whether a private server is worth the cost depends on your playstyle. Private servers let you play with friends-only, farm resources without competition, and test strategies. With ${new Intl.NumberFormat('en-US').format(page.active_players)} active players, ${page.name} is one of Roblox's busiest games — a private server can significantly improve the experience.`,
        },
      },
    ],
  })
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

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
          <span className="text-slate-700 font-medium" aria-current="page">Private Server Cost</span>
        </nav>

        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              {page.name} Private Server Cost ({new Date().getFullYear()})
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Find out exactly how much a private server in {page.name} costs in Robux and real
              money, plus whether it&apos;s worth the investment.
            </p>
          </div>

          {/* Cost card */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold text-slate-950">Current private server price</h2>
            {cost != null ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Robux</p>
                  <p className="mt-2 text-4xl font-bold text-slate-950">
                    {cost.toLocaleString()} R
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    ~USD (purchase rate)
                  </p>
                  <p className="mt-2 text-4xl font-bold text-slate-950">{formatUSD(cost)}</p>
                  <p className="mt-1 text-xs text-slate-400">Standard 2026 web pricing</p>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-5">
                <p className="text-sm text-amber-800">
                  Private server pricing for {page.name} hasn&apos;t been recorded yet.
                  Check the game&apos;s store on Roblox for the current price.
                </p>
              </div>
            )}
          </section>

          {/* FAQ */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold text-slate-950">Private server FAQ</h2>
            <dl className="mt-5 space-y-5">
              <div>
                <dt className="font-semibold text-slate-900">
                  Is a private server in {page.name} worth it?
                </dt>
                <dd className="mt-1 text-sm leading-7 text-slate-600">
                  With{' '}
                  {new Intl.NumberFormat('en-US').format(page.active_players)} active players,{' '}
                  {page.name} public servers can be crowded. A private server gives you exclusive
                  access with friends, distraction-free farming, and the ability to set your own
                  rules. For serious players it&apos;s often a worthwhile investment.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">
                  Can I share my private server with others?
                </dt>
                <dd className="mt-1 text-sm leading-7 text-slate-600">
                  Yes. The owner of a private server can share a link or invite specific Roblox
                  friends. The capacity limit depends on the game&apos;s server configuration.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">
                  Do I pay monthly or is it a one-time purchase?
                </dt>
                <dd className="mt-1 text-sm leading-7 text-slate-600">
                  Roblox private servers are typically charged monthly in Robux. The server stays
                  active as long as you keep renewing. Some games offer lifetime servers at a higher
                  one-time cost.
                </dd>
              </div>
            </dl>
          </section>

          {/* Related links */}
          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
            <a
              href={`/games/${slug}/robux-costs`}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Robux costs →
            </a>
            <a
              href={`/games/${slug}/codes`}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Working codes →
            </a>
            <Link
              href={`/games/${slug}`}
              className="text-sm font-semibold text-brand-600 hover:underline self-center ml-auto"
            >
              ← Back to {page.name} guide
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
