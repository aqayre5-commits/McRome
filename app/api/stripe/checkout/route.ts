import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { checkoutSchema } from '@/lib/contracts/api';
import { getRequestCountry } from '@/lib/geo';
import { resolveStripePriceId } from '@/lib/monetization';
import { getStripe } from '@/lib/services/stripe';
import { absoluteUrl } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const parsed = checkoutSchema.safeParse({
    interval: formData.get('interval'),
    returnPath: formData.get('returnPath') || '/account'
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL('/pricing', request.url));
  }

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) {
    return NextResponse.redirect(new URL('/login?next=/pricing', request.url));
  }

  const countryCode = getRequestCountry(request.headers);
  const priceId = resolveStripePriceId(parsed.data.interval, countryCode);

  if (!priceId) {
    throw new Error('Missing Stripe price id');
  }

  const stripe = getStripe();

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: data.user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: absoluteUrl(`${parsed.data.returnPath}?checkout=success`),
      cancel_url: absoluteUrl('/pricing?checkout=cancel'),
      metadata: {
        user_id: data.user.id,
        country_code: countryCode
      },
      subscription_data: {
        metadata: {
          user_id: data.user.id,
          country_code: countryCode
        }
      }
    });
  } catch {
    return NextResponse.redirect(new URL('/pricing?checkout=error', request.url));
  }

  if (!session.url) {
    return NextResponse.redirect(new URL('/pricing?checkout=error', request.url));
  }

  return NextResponse.redirect(session.url);
}
