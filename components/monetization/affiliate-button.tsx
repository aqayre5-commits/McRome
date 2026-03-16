import type { AffiliateLink } from '@/lib/constants/affiliate-links';

type Props = {
  link: AffiliateLink;
  /** Visual size of the button. Defaults to 'md'. */
  size?: 'sm' | 'md';
};

/**
 * AffiliateButton
 *
 * Renders a localized "Buy Robux" CTA that points to the correct regional store.
 * Always carries rel="sponsored nofollow noopener noreferrer" per Google 2026 spam policy.
 * Renders an FTC disclosure line below for Amazon Associates links.
 *
 * This component is intentionally free of 'use client' — it has no interactivity
 * and can be rendered inside both Server and Client Component trees.
 */
export function AffiliateButton({ link, size = 'md' }: Props) {
  const sizeClasses =
    size === 'sm'
      ? 'px-4 py-2 text-xs'
      : 'px-5 py-3 text-sm';

  return (
    <div>
      <a
        href={link.href}
        target="_blank"
        rel="sponsored nofollow noopener noreferrer"
        aria-label={`${link.buttonLabel} — opens ${link.storeName} in a new tab`}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 font-semibold text-white transition-colors hover:bg-emerald-400 active:scale-[0.98] ${sizeClasses}`}
      >
        <span aria-hidden="true">🛒</span>
        {link.buttonLabel}
        <span aria-hidden="true" className="ml-auto opacity-60">↗</span>
      </a>

      {link.isAmazon && (
        <p className="mt-1.5 text-center text-[10px] leading-4 text-slate-500">
          As an Amazon Associate, we earn from qualifying purchases.
        </p>
      )}
    </div>
  );
}
