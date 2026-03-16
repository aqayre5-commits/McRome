import { createHash } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { communityVerifySchema } from '@/lib/contracts/api';
import { createServiceSupabaseClient } from '@/lib/supabase/service';

function getFingerprint(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '0.0.0.0';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const parsed = communityVerifySchema.safeParse({
    pageId: formData.get('pageId'),
    redirectTo: formData.get('redirectTo') || '/games'
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL('/games?verify=error', request.url));
  }

  const supabase = createServiceSupabaseClient();
  const fingerprint = getFingerprint(request);

  const { error: upsertError } = await supabase.from('community_verifications').upsert(
    {
      page_id: parsed.data.pageId,
      fingerprint,
      is_helpful: true
    },
    { onConflict: 'page_id,fingerprint' }
  );

  if (upsertError) {
    return NextResponse.redirect(new URL(`${parsed.data.redirectTo}?verify=error`, request.url));
  }

  const { count } = await supabase
    .from('community_verifications')
    .select('*', { count: 'exact', head: true })
    .eq('page_id', parsed.data.pageId)
    .eq('is_helpful', true);

  const verificationCount = count ?? 0;
  await supabase
    .from('roblox_pages')
    .update({
      community_verification_count: verificationCount,
      verified_by_community: verificationCount >= 3,
      community_verified_at: verificationCount >= 3 ? new Date().toISOString() : null
    })
    .eq('id', parsed.data.pageId);

  return NextResponse.redirect(new URL(`${parsed.data.redirectTo}?verify=success`, request.url));
}
