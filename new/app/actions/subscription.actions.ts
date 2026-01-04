'use server';

import { stripe } from '@/lib/stripe';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PLANS } from '@/lib/plans';
import { getUserById, updateUser } from '@/lib/db/dbCalls';

const baseUrl = process.env.APP_URL;

export async function createSubscriptionCheckout(priceId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  // Validate Price ID
  const validPriceIds = PLANS.map(p => p.stripePriceId).filter(Boolean);
  if (!validPriceIds.includes(priceId)) {
    throw new Error('Invalid price ID');
  }

  // Fetch user record
  const user = await getUserById(userId);

  let stripeCustomerId = user?.stripe_customer_id;

  // Create Stripe customer if needed
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      metadata: { clerkId: userId }, // IMPORTANT: use consistent key
    });

    stripeCustomerId = customer.id;

    // Update user in DB
    await updateUser({ userId, stripeCustomerId });
  }

  // Create Stripe Checkout Session
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard/billing`,
    cancel_url: `${baseUrl}/dashboard/billing`,
    metadata: {
      clerkId: userId, // MUST match webhook
      priceId: priceId, // matches webhook
    },
  });

  return redirect(checkoutSession.url);
}

export async function redirectToCustomerPortal() {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');

  const user = await getUserById(userId);

  if (!user?.stripe_customer_id) {
    throw new Error('Stripe customer not found.');
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${baseUrl}/dashboard/billing`,
  });

  return redirect(portalSession.url);
}
