import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { getStripe } from '@/lib/services/stripe';
import { createServiceSupabaseClient } from '@/lib/supabase/service';

export async function POST(request: Request) {
  const body = await request.text();
  const headerList = await headers();
  const signature = headerList.get('stripe-signature');

  if (!signature || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing stripe signature or secret' }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();

  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.deleted'
  ) {
    let subscription: Stripe.Subscription | null = null;
    let userId = '';

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      userId = session.metadata?.user_id ?? '';

      if (typeof session.subscription === 'string') {
        subscription = await stripe.subscriptions.retrieve(session.subscription);
      }
    } else {
      subscription = event.data.object as Stripe.Subscription;
    }

    if (subscription) {
      if (!userId && typeof subscription.metadata?.user_id === 'string') {
        userId = subscription.metadata.user_id;
      }

      if (!userId) {
        return NextResponse.json({ received: true, skipped: 'no user_id in metadata' });
      }

      const customerId =
        typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

      await supabase.from('subscriptions').upsert({
        id: subscription.id,
        user_id: userId,
        customer_id: customerId,
        price_id: subscription.items.data[0]?.price.id ?? null,
        status: subscription.status,
        current_period_end: new Date((subscription.items.data[0]?.current_period_end ?? 0) * 1000).toISOString()
      });
    }
  }

  return NextResponse.json({ received: true });
}
