import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Paths that are no longer part of the public pSEO site.
// /login is intentionally NOT listed — it remains reachable so that
// already-authenticated users can refresh their session and access /dashboard.
const RETIRED_PATHS = ['/pricing', '/signup'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (RETIRED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.redirect(new URL('/', request.url), { status: 301 });
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|ads.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
