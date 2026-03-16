import { createServerSupabaseClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';
import type { RobloxPage, SavedGame, Subscription } from '@/lib/types';

export async function getFeaturedPages(limit = 12): Promise<RobloxPage[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('roblox_pages')
    .select('*')
    .eq('is_published', true)
    .order('verified_by_community', { ascending: false })
    .order('active_players', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as RobloxPage[];
}

export async function getGameBySlug(slug: string): Promise<RobloxPage | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('roblox_pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  return (data as RobloxPage | null) ?? null;
}

export async function getGames(search?: string, limit = 48): Promise<RobloxPage[]> {
  const supabase = await createServerSupabaseClient();
  let query = supabase
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
  if (error || !data) return [];
  return data as RobloxPage[];
}

export async function getAllPublishedSlugs(limit = 10000): Promise<Array<{ slug: string; last_indexed_at: string | null }>> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('roblox_pages')
    .select('slug,last_indexed_at')
    .eq('is_published', true)
    .order('id', { ascending: true })
    .limit(limit);

  return (data as Array<{ slug: string; last_indexed_at: string | null }> | null) ?? [];
}

export async function getSitemapEligiblePages(): Promise<Array<{ slug: string; last_indexed_at: string | null }>> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('roblox_pages')
    .select('slug,last_indexed_at')
    .eq('is_published', true)
    .eq('verified_by_community', true)
    .order('trend_spike_score', { ascending: false })
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
