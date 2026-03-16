'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  getCountryRate,
  ROBUX_RATES,
  REGION_OPTIONS,
  type RegionCode,
} from '@/lib/constants/robux-rates';
import { getAffiliateLinkByRegion } from '@/lib/constants/affiliate-links';
import { AffiliateButton } from '@/components/monetization/affiliate-button';

// ─── i18n strings ─────────────────────────────────────────────────────────────

type Lang = 'en' | 'pt';

const STRINGS = {
  en: {
    badge:           'Robux calculator',
    title:           (c: string) => `Robux → ${c} Converter`,
    subtitle:        (g: string) => `For ${g}. Shows both the purchase rate (what you spend) and the DevEx rate (developer cashout).`,
    detected:        'Automatically detected:',
    overridden:      'overridden',
    regionLabel:     'Region:',
    amount:          'Robux amount',
    amountAria:      'Enter number of Robux to convert',
    placeholder:     'e.g. 800',
    purchaseTitle:   'Purchase value',
    purchaseSub:     (r: number, c: string) => `${r} ${c}/R · what you spend`,
    devexTitle:      'DevEx value',
    devexSub:        (r: number, c: string) => `${r} ${c}/R · developer cashout`,
    itemsTitle:      (g: string) => `Common item costs — ${g}`,
    itemsHint:       'Click any row to prefill the calculator.',
    colItem:         'Item',
    colRobux:        'Robux',
    colPurchase:     (s: string) => `Purchase (${s})`,
    colDevex:        (s: string) => `DevEx (${s})`,
    disclaimer:      `Estimates only. Purchase rates reflect 2026 web browser bundle pricing for each region and include applicable VAT. DevEx rates reflect Roblox's published developer cashout payout converted to local currency. Actual amounts may vary by payment method, platform, and Roblox Premium membership.`,
  },
  pt: {
    badge:           'Calculadora Robux',
    title:           (c: string) => `Conversor Robux → ${c}`,
    subtitle:        (g: string) => `Para ${g}. Mostra a taxa de compra (o que você gasta) e a taxa DevEx (saque do desenvolvedor).`,
    detected:        'Detectado automaticamente:',
    overridden:      'substituído',
    regionLabel:     'Região:',
    amount:          'Quantidade de Robux',
    amountAria:      'Digite a quantidade de Robux para converter',
    placeholder:     'ex.: 800',
    purchaseTitle:   'Valor de compra',
    purchaseSub:     (r: number, c: string) => `${r} ${c}/R · o que você gasta`,
    devexTitle:      'Valor DevEx',
    devexSub:        (r: number, c: string) => `${r} ${c}/R · saque do desenvolvedor`,
    itemsTitle:      (g: string) => `Custos comuns de itens — ${g}`,
    itemsHint:       'Clique em qualquer linha para preencher a calculadora.',
    colItem:         'Item',
    colRobux:        'Robux',
    colPurchase:     (s: string) => `Compra (${s})`,
    colDevex:        (s: string) => `DevEx (${s})`,
    disclaimer:      `Apenas estimativas. As taxas de compra refletem os preços do pacote web de 2026 para cada região, incluindo IVA aplicável. As taxas DevEx refletem o pagamento de saque do desenvolvedor publicado pela Roblox, convertido para moeda local. Os valores reais podem variar por método de pagamento, plataforma e associação Roblox Premium.`,
  },
} as const;

// ─── Default item costs ────────────────────────────────────────────────────────

const DEFAULT_ITEM_COSTS: Array<{ label: string; robux: number }> = [
  { label: 'Private Server',  robux: 100  },
  { label: 'VIP Pass',        robux: 500  },
  { label: 'Starter Bundle',  robux: 800  },
  { label: 'Battle Pass',     robux: 400  },
  { label: 'Premium Upgrade', robux: 1700 },
];

type Props = {
  gameName: string;
  lastUpdated: string;
  countryCode?: string;
  lang?: 'en' | 'pt';
  itemPrices?: Array<{ label: string; robux: number }>;
};

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (non-secure context) — fail silently
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy ${label} to clipboard`}
      className="ml-2 shrink-0 rounded-lg border border-slate-600 px-2 py-0.5 text-xs text-slate-400 transition-colors hover:border-blue-500 hover:text-blue-400 active:scale-95"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

export function RobuxConverter({ gameName, lastUpdated, countryCode = 'US', lang = 'en', itemPrices }: Props) {
  const detectedRate = getCountryRate(countryCode);
  const s = STRINGS[lang];

  const [robux, setRobux] = useState(800);
  const [selectedRegion, setSelectedRegion] = useState<RegionCode>(detectedRate.regionCode);

  const rate = ROBUX_RATES[selectedRegion];
  const items = itemPrices ?? DEFAULT_ITEM_COSTS;
  const isOverridden = selectedRegion !== detectedRate.regionCode;

  const fmt = useCallback(
    (amount: number) =>
      amount.toLocaleString(rate.locale, {
        style: 'currency',
        currency: rate.currency,
        minimumFractionDigits: 2,
      }),
    [rate.locale, rate.currency],
  );

  const purchaseValue  = useMemo(() => robux * rate.purchaseRate, [robux, rate.purchaseRate]);
  const devexValue     = useMemo(() => robux * rate.devexRate,    [robux, rate.devexRate]);
  const affiliateLink  = useMemo(() => getAffiliateLinkByRegion(selectedRegion), [selectedRegion]);

  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Robux to Currency Converter',
    applicationCategory: 'CalculatorApplication',
    operatingSystem: 'Web',
    description:
      `Convert Robux to ${rate.currency} using 2026 rates. Purchase rate: ${rate.purchaseRate} ${rate.currency}/R. ` +
      `DevEx cashout rate: ${rate.devexRate} ${rate.currency}/R. Includes common item costs for ${gameName}.`,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  })
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  return (
    <section
      aria-label="Robux to currency converter tool"
      className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900"
    >
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaJson }}
      />

      {/* ── Header ── */}
      <div className="border-b border-slate-700 bg-slate-800 px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">
              {s.badge}
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">
              {s.title(rate.currency)}
            </h2>
          </div>
          <span className="rounded-full border border-emerald-700 bg-emerald-900/40 px-3 py-1 text-xs font-medium text-emerald-400">
            Rates verified {lastUpdated}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {s.subtitle(gameName)}
        </p>
      </div>

      {/* ── Region selector ── */}
      <div className="border-b border-slate-700 bg-slate-800/50 px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Detected region badge */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span aria-hidden="true">📍</span>
            <span>
              {s.detected}{' '}
              <span className="font-medium text-slate-300">
                {detectedRate.flag} {detectedRate.label}
              </span>
            </span>
            {isOverridden && (
              <span className="ml-1 rounded-full bg-amber-900/50 px-2 py-0.5 text-amber-400">
                {s.overridden}
              </span>
            )}
          </div>

          {/* Manual override dropdown */}
          <label className="ml-auto flex items-center gap-2 text-xs text-slate-400">
            <span>{s.regionLabel}</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value as RegionCode)}
              aria-label="Manually select currency region"
              className="rounded-lg border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-slate-200 outline-none ring-blue-500 focus:ring-1"
            >
              {REGION_OPTIONS.map((code) => {
                const r = ROBUX_RATES[code];
                return (
                  <option key={code} value={code}>
                    {r.flag} {r.label}
                  </option>
                );
              })}
            </select>
          </label>
        </div>
      </div>

      {/* ── Input ── */}
      <div className="px-6 py-5">
        <label htmlFor="robux-amount" className="block text-sm font-medium text-slate-300">
          {s.amount}
        </label>
        <input
          id="robux-amount"
          type="number"
          min={0}
          step={1}
          value={robux === 0 ? '' : robux}
          onChange={(e) => setRobux(Math.max(0, Math.floor(Number(e.target.value || 0))))}
          aria-label={s.amountAria}
          aria-describedby="robux-converter-disclaimer"
          placeholder={s.placeholder}
          className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-lg font-bold text-white outline-none ring-blue-500 transition-colors placeholder:text-slate-600 focus:ring-2"
        />
      </div>

      {/* ── Result cards ── */}
      <div className="grid gap-4 px-6 pb-5 sm:grid-cols-2">
        {/* Purchase value */}
        <div className="rounded-2xl border border-blue-800/60 bg-blue-950/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">
            {s.purchaseTitle}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {s.purchaseSub(rate.purchaseRate, rate.currency)}
          </p>
          <div className="mt-3 flex items-baseline gap-1">
            <span
              aria-live="polite"
              aria-label={`Purchase value: ${fmt(purchaseValue)}`}
              className="text-2xl font-bold tabular-nums text-white"
            >
              {fmt(purchaseValue)}
            </span>
            <CopyButton value={fmt(purchaseValue)} label="purchase value" />
          </div>
        </div>

        {/* DevEx value */}
        <div className="rounded-2xl border border-emerald-800/60 bg-emerald-950/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
            {s.devexTitle}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {s.devexSub(rate.devexRate, rate.currency)}
          </p>
          <div className="mt-3 flex items-baseline gap-1">
            <span
              aria-live="polite"
              aria-label={`Developer Exchange value: ${fmt(devexValue)}`}
              className="text-2xl font-bold tabular-nums text-white"
            >
              {fmt(devexValue)}
            </span>
            <CopyButton value={fmt(devexValue)} label="DevEx value" />
          </div>
        </div>
      </div>

      {/* ── Affiliate buy button ── */}
      <div className="px-6 pb-5">
        <AffiliateButton link={affiliateLink} />
      </div>

      {/* ── Local comparison note ── */}
      {rate.localComparisonNote ? (
        <div className="mx-6 mb-5 rounded-2xl border border-amber-800/50 bg-amber-950/30 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-400">
            {rate.flag} Local insight
          </p>
          <p className="mt-1.5 text-sm leading-6 text-slate-300">
            {rate.localComparisonNote}
          </p>
        </div>
      ) : null}

      {/* ── Common item costs table ── */}
      <div className="border-t border-slate-700 px-6 py-5">
        <h3 className="text-sm font-semibold text-slate-300">
          {s.itemsTitle(gameName)}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          {s.itemsHint}
        </p>
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-700">
          <table
            className="w-full min-w-[420px] text-sm"
            aria-label={`Common item costs in ${gameName}`}
          >
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800">
                <th
                  scope="col"
                  className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                >
                  {s.colItem}
                </th>
                <th
                  scope="col"
                  className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-400"
                >
                  {s.colRobux}
                </th>
                <th
                  scope="col"
                  className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-blue-400"
                >
                  {s.colPurchase(rate.symbol)}
                </th>
                <th
                  scope="col"
                  className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-emerald-400"
                >
                  {s.colDevex(rate.symbol)}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr
                  key={item.label}
                  onClick={() => setRobux(item.robux)}
                  onKeyDown={(e) => e.key === 'Enter' && setRobux(item.robux)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Set calculator to ${item.robux} Robux for ${item.label}`}
                  className={`cursor-pointer transition-colors hover:bg-slate-700 ${
                    i % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/40'
                  }`}
                >
                  <td className="px-4 py-2.5 text-slate-200">{item.label}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-300">
                    {item.robux.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-blue-300">
                    {fmt(item.robux * rate.purchaseRate)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-emerald-300">
                    {fmt(item.robux * rate.devexRate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <div className="border-t border-slate-700 px-6 py-3">
        <p id="robux-converter-disclaimer" className="text-xs leading-5 text-slate-500">
          {s.disclaimer}
        </p>
      </div>
    </section>
  );
}
