import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import { Header } from '@/components/site/header';
import { Footer } from '@/components/site/footer';
import { buildDefaultMetadata } from '@/lib/seo';
import { env } from '@/lib/env';
import { analyticsSnippet } from '@/lib/analytics';
import './globals.css';

export const metadata: Metadata = buildDefaultMetadata();

export default function RootLayout({ children }: { children: ReactNode }) {
  const measurementId = env.GA_MEASUREMENT_ID;
  const adsenseId = env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

  return (
    <html lang="en">
      <body>
        {/* Google AdSense — Auto Ads (fills gaps) + enables manual units */}
        {adsenseId ? (
          <Script
            id="adsense-init"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${adsenseId}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        ) : null}

        {measurementId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
            <Script id="ga4-inline" strategy="afterInteractive">
              {analyticsSnippet(measurementId)}
            </Script>
          </>
        ) : null}
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
