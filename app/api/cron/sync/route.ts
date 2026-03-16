import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { syncTopRobloxGames } from '@/lib/services/roblox-pseo';

function isAuthorized(request: NextRequest) {
  const bearer = request.headers.get('authorization');
  const secret = bearer?.replace('Bearer ', '') ?? request.headers.get('x-cron-secret');
  return Boolean(env.CRON_SECRET && secret === env.CRON_SECRET);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const synced = await syncTopRobloxGames(100);
    return NextResponse.json({ synced });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
