import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { syncTopRobloxGames } from '@/lib/services/roblox-pseo';

// Force this route to always run fresh data
export const dynamic = 'force-dynamic';

function isAuthorized(request: NextRequest) {
  // Allow browser access during local development for testing
  if (process.env.NODE_ENV === 'development') return true;

  const bearer = request.headers.get('authorization');
  const secret = bearer?.replace('Bearer ', '') ?? request.headers.get('x-cron-secret');

  // In production, require the CRON_SECRET
  return Boolean(env.CRON_SECRET && secret === env.CRON_SECRET);
}

// Changed to GET so you can visit it in your browser
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // This fills your Supabase DB with 100 top games, icons, and slugs
    const synced = await syncTopRobloxGames(100);
    return NextResponse.json({
      success: true,
      message: `Successfully synced ${synced} games.`,
      synced
    });
  } catch (error) {
    console.error('Sync Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
