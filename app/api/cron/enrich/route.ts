import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { enrichNextBatch } from '@/lib/services/roblox-pseo';

// Enrichments run in parallel — 20 Gemini calls fire at once and finish in
// ~3-4 s (one network RTT), well within Vercel's 10 s hobby limit.
// Only games with >= 10,000 active players are enriched (top games first).
const BATCH_SIZE = 20;

function isAuthorized(request: NextRequest) {
  const bearer = request.headers.get('authorization');
  const secret = bearer?.replace('Bearer ', '') ?? request.headers.get('x-cron-secret');
  return Boolean(env.CRON_SECRET && secret === env.CRON_SECRET);
}

async function handle(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await enrichNextBatch(BATCH_SIZE);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET  = handle;
export const POST = handle;
