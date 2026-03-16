import { NextResponse, type NextRequest } from 'next/server';
import { betaTesterSignupSchema } from '@/lib/contracts/api';
import { createServiceSupabaseClient } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const parsed = betaTesterSignupSchema.safeParse({
    email: formData.get('email'),
    pageId: formData.get('pageId'),
    redirectTo: formData.get('redirectTo') || '/games',
    countryCode: formData.get('countryCode') || undefined
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL('/games?beta=error', request.url));
  }

  const supabase = createServiceSupabaseClient();
  const { error: insertError } = await supabase.from('beta_tester_signups').insert({
    email: parsed.data.email,
    page_id: parsed.data.pageId,
    country_code: parsed.data.countryCode ?? null
  });

  if (insertError) {
    return NextResponse.redirect(new URL(`${parsed.data.redirectTo}?beta=error`, request.url));
  }

  return NextResponse.redirect(new URL(`${parsed.data.redirectTo}?beta=success`, request.url));
}
