import { createServiceSupabaseClient } from '@/lib/supabase/service';
import type { GameCodeWithVotes } from '@/lib/types';

/**
 * Fetch all active game codes for a page, enriched with 24-hour vote tallies.
 * Uses the service client so it bypasses RLS for the vote aggregation.
 * Returns an empty array when the page has no codes yet.
 */
export async function getCodesWithVotes(pageId: number): Promise<GameCodeWithVotes[]> {
  const supabase = createServiceSupabaseClient();

  const { data: codes, error: codesError } = await supabase
    .from('game_codes')
    .select('id, page_id, code_text, description, is_active, added_at')
    .eq('page_id', pageId)
    .eq('is_active', true)
    .order('added_at', { ascending: false });

  if (codesError || !codes || codes.length === 0) return [];

  const codeIds = codes.map((c) => c.id as number);
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Fetch all votes for these codes within the last 24 hours.
  const { data: votes } = await supabase
    .from('code_votes')
    .select('code_id, is_working')
    .in('code_id', codeIds)
    .gte('created_at', cutoff);

  const voteRows = votes ?? [];

  return codes.map((code) => {
    const codeVotes = voteRows.filter((v) => v.code_id === code.id);
    const total    = codeVotes.length;
    const working  = codeVotes.filter((v) => v.is_working).length;

    return {
      ...code,
      total_votes_24h:   total,
      working_votes_24h: working,
      success_rate_24h:  total > 0 ? Math.round((100 * working) / total) : null,
    } satisfies GameCodeWithVotes;
  });
}
