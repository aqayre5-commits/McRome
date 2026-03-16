import type { FAQItem, RobloxPage } from '@/lib/types';
import { clampWords, parseFaqs, parseGuide, parseSummary, stripMarkdown } from '@/lib/content';
import { formatNumber, formatDelta } from '@/lib/utils';

type Props = {
  page: RobloxPage;
  /**
   * Optional extra FAQ entry injected into the FAQPage JSON-LD only (not shown
   * in the visible accordion).  Used to surface real-time code vote status in
   * structured data without cluttering the editorial content.
   */
  topCodeFaq?: FAQItem;
  /**
   * Data-driven FAQs generated from live game data (player count, codes, etc.).
   * Shown in a visible "Quick answers" accordion AND included in FAQPage JSON-LD.
   * Google requires schema FAQs to match visible content — this satisfies that rule.
   */
  dataFaqs?: FAQItem[];
};

export function UsefulAnswerArticle({ page, topCodeFaq, dataFaqs = [] }: Props) {
  const summaryBullets = parseSummary(page.useful_summary);
  const guideParagraphs = parseGuide(page.detailed_guide);
  const faqs = parseFaqs(page.faq_data as FAQItem[] | string | null);
  // Merge all FAQ sources into one schema block (Google forbids multiple FAQPage blocks).
  // Order: editorial (AI) → data-driven (live) → top code vote (schema-only).
  const schemaFaqs = [
    ...faqs,
    ...dataFaqs,
    ...(topCodeFaq ? [topCodeFaq] : []),
  ];
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/games/${page.slug}`;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${page.name} ${new Date().getFullYear()} guide: ${formatNumber(page.active_players)} active players`,
    description:
      (stripMarkdown(page.answer_block || page.useful_summary || '') || `Useful answers and tips for ${page.name}.`).slice(0, 155),
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
    image: page.icon_url || undefined,
    dateModified: page.last_indexed_at || undefined,
    author: {
      '@type': 'Organization',
      name: 'McRome'
    },
    publisher: {
      '@type': 'Organization',
      name: 'McRome'
    }
  };

  const faqJsonLd =
    schemaFaqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: schemaFaqs.map((faq) => ({
            '@type': 'Question',
            name: stripMarkdown(faq.q),
            acceptedAnswer: {
              '@type': 'Answer',
              text: stripMarkdown(faq.a)
            }
          }))
        }
      : null;

  function safeJsonLd(obj: object) {
    return JSON.stringify(obj)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026');
  }

  return (
    <article className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }}
      />
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
        />
      ) : null}

      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
        <div className="grid gap-6 md:grid-cols-[120px,1fr]">
          <div className="overflow-hidden rounded-2xl bg-slate-100">
            {page.icon_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={page.icon_url} alt={`${page.name} icon`} className="h-32 w-full object-cover" />
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-slate-500">No image</div>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
              Useful answer
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              {page.name}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1">
                {formatNumber(page.active_players)} active players
              </span>
              {page.active_players_change_24h !== 0 ? (
                <span className={`rounded-full px-3 py-1 ${page.active_players_change_24h > 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'}`}>
                  {formatDelta(page.active_players_change_24h)}
                </span>
              ) : null}
              {page.trend_spike_label ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">{page.trend_spike_label}</span>
              ) : null}
              <span className="rounded-full bg-slate-100 px-3 py-1">{page.language_code.toUpperCase()}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                {page.device_compatibility.join(' / ')}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Refreshed {page.last_data_refresh ? new Date(page.last_data_refresh).toLocaleDateString() : 'today'}
              </span>
              {page.verified_by_community ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-900">Verified by community</span>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {page.answer_block ? (
        <section className="rounded-3xl border border-brand-200 bg-brand-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">Fast answer</p>
          <p className="mt-3 text-base leading-8 text-slate-800">{clampWords(page.answer_block, 100)}</p>
        </section>
      ) : null}

      {summaryBullets.length ? (
        <section className="rounded-3xl border border-slate-200 bg-brand-50 p-6">
          <h2 className="text-xl font-semibold text-slate-950">Key takeaways</h2>
          <ul className="mt-4 space-y-3">
            {summaryBullets.map((item, index) => (
              <li key={`${index}-${item}`} className="flex gap-3 text-sm leading-7 text-slate-800">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-brand-600" />
                <span>{stripMarkdown(item)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {guideParagraphs.length ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-semibold text-slate-950">
            How to progress faster in {page.name}
          </h2>
          <div className="mt-4 space-y-4">
            {guideParagraphs.map((paragraph, index) => (
              <p key={index} className="text-base leading-8 text-slate-700">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {faqs.length ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-2xl font-semibold text-slate-950">Frequently asked questions</h2>
          <div className="mt-4 divide-y divide-slate-200">
            {faqs.map((faq) => (
              <details key={faq.q} className="group py-4">
                <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
                  {stripMarkdown(faq.q)}
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-700">{stripMarkdown(faq.a)}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {dataFaqs.length > 0 ? (
        <section className="rounded-3xl border border-brand-100 bg-brand-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Quick answers</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">
            {page.name} — common questions
          </h2>
          <div className="mt-4 divide-y divide-brand-100">
            {dataFaqs.map((faq) => (
              <details key={faq.q} className="py-4">
                <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
                  {faq.q}
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-700">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
