import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';
import { requestIndexingForVerifiedPages } from '@/lib/services/roblox-pseo';

function isAuthorized(request: NextRequest) {
  if (process.env.NODE_ENV === 'development') return true;
  const bearer = request.headers.get('authorization');
  const secret = bearer?.replace('Bearer ', '') ?? request.headers.get('x-cron-secret');
  return Boolean(env.CRON_SECRET && secret === env.CRON_SECRET);
}

export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Hard cap at 20/day to stay well under Google's 200 req/day Indexing API limit.
    // Sub-pages are discovered organically via the sitemap — only parent slugs submitted.
    const result = await requestIndexingForVerifiedPages(20);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
