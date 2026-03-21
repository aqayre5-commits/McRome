import type { MetadataRoute } from 'next';
import { getSitemapEligiblePages, getDistinctGenres } from '@/lib/data/public';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const [pages, genres] = await Promise.all([
    getSitemapEligiblePages(),
    getDistinctGenres(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`,                        lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${baseUrl}/games`,                   lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${baseUrl}/trending`,                lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${baseUrl}/about`,                   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/contact`,                 lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/privacy`,                 lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/disclaimer`,              lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/blog/roblox-essentials`,  lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.6 },
  ];

  const genreRoutes: MetadataRoute.Sitemap = genres.map((genre) => ({
    url: `${baseUrl}/genres/${encodeURIComponent(genre.toLowerCase().replace(/\s+/g, '-'))}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Core game pages + sub-page templates
  const gameRoutes: MetadataRoute.Sitemap = pages.flatMap((page) => {
    const lastMod = page.last_indexed_at ? new Date(page.last_indexed_at) : new Date();
    const base = `${baseUrl}/games/${page.slug}`;
    return [
      { url: base,                              lastModified: lastMod, changeFrequency: 'daily' as const,  priority: 0.8 },
      { url: `${base}/codes`,                   lastModified: lastMod, changeFrequency: 'daily' as const,  priority: 0.7 },
      { url: `${base}/robux-costs`,             lastModified: lastMod, changeFrequency: 'weekly' as const, priority: 0.6 },
      { url: `${base}/private-server-cost`,     lastModified: lastMod, changeFrequency: 'weekly' as const, priority: 0.6 },
      { url: `${base}/is-it-worth-it`,          lastModified: lastMod, changeFrequency: 'weekly' as const, priority: 0.6 },
    ];
  });

  return [...staticRoutes, ...genreRoutes, ...gameRoutes];
}
