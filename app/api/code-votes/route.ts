import { createHash } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { codeVoteSchema } from '@/lib/contracts/api';
import { createServiceSupabaseClient } from '@/lib/supabase/service';

function getFingerprint(request: NextRequest): string {
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    '0.0.0.0';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = codeVoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', issues: parsed.error.issues }, { status: 400 });
  }

  const { codeId, isWorking } = parsed.data;
  const fingerprint = getFingerprint(request);
  const supabase = createServiceSupabaseClient();

  // Verify the code exists and is active before accepting a vote.
  const { data: code, error: lookupError } = await supabase
    .from('game_codes')
    .select('id')
    .eq('id', codeId)
    .eq('is_active', true)
    .single();

  if (lookupError || !code) {
    return NextResponse.json({ error: 'Code not found' }, { status: 404 });
  }

  // Upsert: one vote per fingerprint per code (allows vote changes).
  const { error: upsertError } = await supabase
    .from('code_votes')
    .upsert(
      { code_id: codeId, is_working: isWorking, fingerprint, created_at: new Date().toISOString() },
      { onConflict: 'code_id,fingerprint' }
    );

  if (upsertError) {
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
  }

  // Return the updated 24-hour tally so the client can reconcile.
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: votes } = await supabase
    .from('code_votes')
    .select('is_working')
    .eq('code_id', codeId)
    .gte('created_at', cutoff);

  const total   = votes?.length ?? 0;
  const working = votes?.filter((v) => v.is_working).length ?? 0;

  return NextResponse.json({
    success: true,
    total_votes_24h:   total,
    working_votes_24h: working,
    success_rate_24h:  total > 0 ? Math.round((100 * working) / total) : null,
  });
}
