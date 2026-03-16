import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import { GoogleTagManager } from '@next/third-parties/google';
import { Header } from '@/components/site/header';
import { Footer } from '@/components/site/footer';
import { buildDefaultMetadata } from '@/lib/seo';
import './globals.css';

export const metadata: Metadata = buildDefaultMetadata();

export default function RootLayout({ children }: { children: ReactNode }) {
  const gtmId = process.env.GTM_ID;
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

  return (
    <html lang="en">
      {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
      <body>
        {adsenseId ? (
          <Script
            id="adsense-init"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${adsenseId}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        ) : null}
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
