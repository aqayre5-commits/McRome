'use client';

import { useEffect, useRef } from 'react';

type Props = {
  slotId: string;       // AdSense ad unit slot ID (from your AdSense dashboard)
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  className?: string;
};

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/**
 * Manual AdSense unit.
 * Publisher ID is read from NEXT_PUBLIC_ADSENSE_PUBLISHER_ID at build time.
 * Wrap with a min-height container to prevent CLS (Core Web Vitals).
 */
export function AdSlot({ slotId, format = 'auto', className }: Props) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
  const pushed = useRef(false);

  useEffect(() => {
    if (!publisherId || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // adsbygoogle not loaded yet — Auto Ads will handle it
    }
  }, [publisherId]);

  if (!publisherId) return null;
  if (slotId.startsWith('REPLACE_') || slotId.includes('YOUR_')) return null;

  return (
    <div
      className={`overflow-hidden rounded-2xl bg-slate-900/50 ${className ?? ''}`}
      style={{ minHeight: 250 }}
      aria-label="Advertisement"
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: 250 }}
        data-ad-client={`ca-${publisherId}`}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
