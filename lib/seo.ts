import type { Metadata } from 'next';
import type { RobloxPage } from '@/lib/types';
import { absoluteUrl, formatNumber } from '@/lib/utils';

export function buildDefaultMetadata(): Metadata {
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: {
      default: 'McRome',
      template: '%s | McRome'
    },
    description: 'Fast answers, useful Roblox game guides, FAQs, utility tools, and premium saved game features.',
    alternates: {
      canonical: '/'
    },
    openGraph: {
      title: 'McRome',
      description: 'Fast answers, useful Roblox game guides, FAQs, utility tools, and premium saved game features.',
      url: absoluteUrl('/'),
      siteName: 'McRome',
      type: 'website',
      images: [absoluteUrl('/og-default.svg')]
    },
    twitter: {
      card: 'summary_large_image',
      title: 'McRome',
      description: 'Fast answers, useful Roblox game guides, FAQs, utility tools, and premium saved game features.',
      images: [absoluteUrl('/og-default.svg')]
    },
    other: {
      'google-adsense-account': `ca-${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ?? ''}`,
    }
  };
}

export function buildGameMetadata(page: RobloxPage): Metadata {
  const year = new Date().getFullYear();
  const activePlayers = formatNumber(page.active_players);
  const title = `${page.name} ${year} guide: ${activePlayers} active players`;
  const description =
    page.answer_block?.slice(0, 155) ??
    page.useful_summary?.slice(0, 155) ??
    `Useful answers, progression tips, and FAQs for ${page.name}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/games/${page.slug}`
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/games/${page.slug}`),
      type: 'article',
      images: page.icon_url ? [page.icon_url] : [absoluteUrl('/og-default.svg')]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: page.icon_url ? [page.icon_url] : [absoluteUrl('/og-default.svg')]
    }
  };
}
