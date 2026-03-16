import { getRegionalPricingCopy } from '@/lib/monetization';

type Props = {
  countryCode: string;
};

export function PricingTable({ countryCode }: Props) {
  const pricingCopy = getRegionalPricingCopy(countryCode);
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      cta: 'Browse public guides',
      href: '/games',
      features: [
        'Public game pages',
        'Answer blocks',
        'FAQ blocks',
        'Search across published pages',
        'Robux-to-USD converter'
      ]
    },
    {
      name: 'Pro',
      price: 'Regional at checkout',
      period: pricingCopy.badge,
      cta: 'Start Pro',
      href: '#checkout',
      features: [
        'Save games to dashboard',
        'Premium account area',
        'Billing portal access',
        'Region-aware Stripe price routing',
        'Weekly meta alerts placeholder'
      ]
    }
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        {pricingCopy.note}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <section key={plan.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">{plan.name}</h2>
                <p className="mt-2 text-4xl font-bold text-slate-950">{plan.price}</p>
                <p className="mt-1 text-sm text-slate-600">{plan.period}</p>
              </div>
            </div>

            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-brand-600" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {plan.name === 'Pro' ? (
              <form id="checkout" action="/api/stripe/checkout" method="post" className="mt-6 space-y-3">
                <input type="hidden" name="interval" value="monthly" />
                <input type="hidden" name="returnPath" value="/account" />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  {plan.cta}
                </button>
              </form>
            ) : (
              <a
                href={plan.href}
                className="mt-6 inline-flex rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                {plan.cta}
              </a>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
