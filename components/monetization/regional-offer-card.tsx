import type { RegionalOffer } from '@/lib/types';

type Props = {
  offer: RegionalOffer;
};

export function RegionalOfferCard({ offer }: Props) {
  return (
    <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">CPA offer · {offer.tier}</p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">{offer.title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-700">{offer.description}</p>
      <a
        href={offer.url}
        target="_blank"
        rel="noreferrer noopener nofollow sponsored"
        className="mt-5 inline-flex rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        {offer.ctaLabel}
      </a>
    </section>
  );
}
