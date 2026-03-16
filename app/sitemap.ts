import type { MetadataRoute } from 'next';
import { getSitemapEligiblePages } from '@/lib/data/public';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const pages = await getSitemapEligiblePages();

  return [
    { url: `${baseUrl}/`,                        lastModified: new Date() },
    { url: `${baseUrl}/games`,                   lastModified: new Date() },
    { url: `${baseUrl}/about`,                   lastModified: new Date() },
    { url: `${baseUrl}/contact`,                 lastModified: new Date() },
    { url: `${baseUrl}/privacy`,                 lastModified: new Date() },
    { url: `${baseUrl}/disclaimer`,              lastModified: new Date() },
    { url: `${baseUrl}/blog/roblox-essentials`,  lastModified: new Date() },
    ...pages.map((page) => ({
      url: `${baseUrl}/games/${page.slug}`,
      lastModified: page.last_indexed_at ? new Date(page.last_indexed_at) : new Date()
    }))
  ];
}
