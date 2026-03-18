import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { syncTopRobloxGames } from '@/lib/services/roblox-pseo';

export const dynamic = 'force-dynamic';

function isAuthorized(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const xCronSecret = request.headers.get('x-cron-secret');

  console.log('cron auth debug', {
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    hasAuthorizationHeader: !!authHeader,
    authStartsWithBearer: authHeader?.startsWith('Bearer '),
    hasXCronSecretHeader: !!xCronSecret,
    hasEnvCronSecret: !!env.CRON_SECRET,
    pathname: request.nextUrl.pathname,
    host: request.headers.get('host'),
  });

  // Allow browser access during local development for testing
  if (process.env.NODE_ENV === 'development') return true;

  const secret =
    authHeader?.replace('Bearer ', '') ?? xCronSecret;

  const authorized = Boolean(env.CRON_SECRET && secret === env.CRON_SECRET);

  console.log('cron auth result', {
    authorized,
    hasExtractedSecret: !!secret,
  });

  return authorized;
}

export async function GET(request: NextRequest) {
  console.log('cron route hit', {
    pathname: request.nextUrl.pathname,
    method: request.method,
  });

  if (!isAuthorized(request)) {
    console.log('cron route unauthorized');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('cron auth passed, starting sync');

  try {
    const synced = await syncTopRobloxGames(100);

    console.log('cron sync success', { synced });

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${synced} games.`,
      synced,
    });
  } catch (error) {
    console.error('Sync Error:', error);
    // This fix ensures we see the ACTUAL error message, not "[object Object]"
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : JSON.stringify(error) 
    }, { status: 500 });
  }
}
