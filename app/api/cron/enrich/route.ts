import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { enrichNextBatch } from '@/lib/services/roblox-pseo';

// Enrichments run in parallel so 10 games finish in ~3-4 s (one Gemini RTT),
// comfortably within Vercel's 10 s hobby function limit.
const BATCH_SIZE = 10;

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
