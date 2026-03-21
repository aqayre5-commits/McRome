import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { enrichNextBatch } from '@/lib/services/roblox-pseo';

// Vercel hobby functions time out at 10 s.
// Each Gemini call takes ~2-4 s, so keep the batch small.
const BATCH_SIZE = 3;

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
