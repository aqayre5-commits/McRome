import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { getStripe } from '@/lib/services/stripe';
import { absoluteUrl } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const service = createServiceSupabaseClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.redirect(new URL('/login?next=/account', request.url));
  }

  const { data: subscription } = await service
    .from('subscriptions')
    .select('customer_id')
    .eq('user_id', data.user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription?.customer_id) {
    return NextResponse.redirect(new URL('/pricing', request.url));
  }

  const stripe = getStripe();

  let portal;
  try {
    portal = await stripe.billingPortal.sessions.create({
      customer: subscription.customer_id,
      return_url: absoluteUrl('/account')
    });
  } catch {
    return NextResponse.redirect(new URL('/account?portal=error', request.url));
  }

  return NextResponse.redirect(portal.url);
}
