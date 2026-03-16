import Stripe from 'stripe';
import { env } from '@/lib/env';

let stripeSingleton: Stripe | null = null;

export function getStripe() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY');
  }

  if (!stripeSingleton) {
    stripeSingleton = new Stripe(env.STRIPE_SECRET_KEY);
  }

  return stripeSingleton;
}
