import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { env } from '@/lib/env';
import type { RobloxPage, SavedGame, Subscription } from '@/lib/types';

// Public game reads use the service role client to bypass RLS.
// The service key never leaves the server.
const db = createServiceSupabaseClient();

export async function getFeaturedPages(limit = 12): Promise<RobloxPage[]> {
  const { data, error } = await db
    .from('roblox_pages')
    .select('*')
    .eq('is_published', true)
    .gte('active_players', 5000)
    .order('featured_score', { ascending: false, nullsFirst: false })
    .order('active_players', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[getFeaturedPages] Supabase error:', error.message);
    return [];
  }
  return (data as RobloxPage[]) ?? [];
}

export async function getTrendingPages(limit = 8): Promise<RobloxPage[]> {
  const { data, error } = await db
    .from('roblox_pages')
    .select('*')
    .eq('is_published', true)
    .gte('active_players', 5000)
    .not('trend_spike_score', 'is', null)
    .gt('trend_spike_score', 0)
    .order('trend_spike_score', { ascending: false })
    .order('active_players_change_24h', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[getTrendingPages] Supabase error:', error.message);
    return [];
  }
  return (data as RobloxPage[]) ?? [];
}

export async function getSponsoredGames(): Promise<RobloxPage[]> {
  const { data, error } = await db
    .from('roblox_pages')
    .select('*')
    .eq('is_sponsored', true)
    .order('sponsor_priority', { ascending: true, nullsFirst: false })
    .limit(4);

  if (error) {
    console.error('[getSponsoredGames] Supabase error:', error.message);
    return [];
  }
  return (data as RobloxPage[]) ?? [];
}

export async function getGameBySlug(slug: string): Promise<RobloxPage | null> {
  const { data, error } = await db
    .from('roblox_pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) console.error('[getGameBySlug] Supabase error:', error.message);
  return (data as RobloxPage | null) ?? null;
}

export async function getGames(search?: string, limit = 48): Promise<RobloxPage[]> {
  let query = db
    .from('roblox_pages')
    .select('*')
    .eq('is_published', true)
    .order('verified_by_community', { ascending: false })
    .order('active_players', { ascending: false })
    .limit(limit);

  if (search) {
    query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) console.error('[getGames] Supabase error:', error.message);
  return (data as RobloxPage[]) ?? [];
}

export async function getAllPublishedSlugs(limit = 10000): Promise<Array<{ slug: string; last_indexed_at: string | null }>> {
  const { data } = await db
    .from('roblox_pages')
    .select('slug,last_indexed_at')
    .eq('is_published', true)
    .order('id', { ascending: true })
    .limit(limit);

  return (data as Array<{ slug: string; last_indexed_at: string | null }> | null) ?? [];
}

export async function getGamesByGenre(genre: string, limit = 24): Promise<RobloxPage[]> {
  const { data, error } = await db
    .from('roblox_pages')
    .select('*')
    .eq('is_published', true)
    .eq('genre', genre)
    .order('active_players', { ascending: false })
    .limit(limit);

  if (error) console.error('[getGamesByGenre] Supabase error:', error.message);
  return (data as RobloxPage[]) ?? [];
}

export async function getDistinctGenres(): Promise<string[]> {
  const { data, error } = await db
    .from('roblox_pages')
    .select('genre')
    .eq('is_published', true)
    .not('genre', 'is', null);

  if (error || !data) return [];
  const genres = [...new Set((data as { genre: string | null }[]).map((r) => r.genre).filter(Boolean))] as string[];
  return genres.sort();
}

export async function getSitemapEligiblePages(): Promise<Array<{ slug: string; last_indexed_at: string | null }>> {
  const { data } = await db
    .from('roblox_pages')
    .select('slug,last_indexed_at')
    .eq('is_published', true)
    .order('publish_score', { ascending: false, nullsFirst: false })
    .order('active_players', { ascending: false })
    .limit(env.SITEMAP_INDEX_LIMIT);

  return (data as Array<{ slug: string; last_indexed_at: string | null }> | null) ?? [];
}

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function getCurrentSubscription(userId: string): Promise<Subscription | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as Subscription | null) ?? null;
}

export async function getSavedGames(userId: string): Promise<SavedGame[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('saved_games')
    .select('user_id,page_id,created_at,roblox_pages(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return (data as SavedGame[] | null) ?? [];
}
