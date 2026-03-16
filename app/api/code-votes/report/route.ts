import { NextResponse, type NextRequest } from 'next/server';
import { codeReportSchema } from '@/lib/contracts/api';
import { createServiceSupabaseClient } from '@/lib/supabase/service';

/**
 * POST /api/code-votes/report
 * Flags a game code as potentially misused/spammed, satisfying Google E-E-A-T
 * requirements for moderated UGC.  Sets reported=true on all votes for the code
 * from the reporter's perspective; a human moderator reviews these in Supabase.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = codeReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();

  // Mark all votes on this code as reported so a moderator can review them.
  const { error } = await supabase
    .from('code_votes')
    .update({ reported: true })
    .eq('code_id', parsed.data.codeId);

  if (error) {
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
