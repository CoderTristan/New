import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { PLANS } from '@/lib/plans';
import {
  upsertSubscription,
  updateSubscriptionStatus,
  getSubscriptionById,
} from '@/lib/db/dbCalls';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET not set');

export async function POST(req: Request) {
  const sig = (await headers()).get('stripe-signature');
  if (!sig) {
    return NextResponse.json(
      { error: 'Missing Stripe signature header' },
      { status: 400 }
    );
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription') break;

        const userId = session.metadata?.clerkId;
        const priceId = session.metadata?.priceId;
        const subscriptionId = session.subscription as string;

        if (!userId || !priceId || !subscriptionId) {
          throw new Error('Missing checkout metadata');
        }

        const subscription = (await stripe.subscriptions.retrieve(
          subscriptionId
        )) as Stripe.Subscription;


        const plan = PLANS.find((p) => p.stripePriceId === priceId);
        if (!plan) break;



        await upsertSubscription({
          userId,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          planName: plan.name,
          status: subscription.status,
        });

        console.log(`Subscription created for user ${userId}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        if (!subscriptionId) break;

        const subscription = (await stripe.subscriptions.retrieve(
          subscriptionId
        )) as Stripe.Subscription;

        if (!subscription.current_period_end) {
          throw new Error('Missing current_period_end');
        }

        const existing = await getSubscriptionById(
          subscription.metadata?.clerkId ?? '',
          subscription.id
        );
        if (!existing) break;

        await updateSubscriptionStatus(
          existing.user_id,
          subscription.id,
          subscription.status,
          new Date(subscription.current_period_end * 1000)
        );

        console.log(`Payment succeeded for subscription ${subscription.id}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        if (!subscription.current_period_end) {
          throw new Error('Missing current_period_end');
        }

        const existing = await getSubscriptionById(
          subscription.metadata?.clerkId ?? '',
          subscription.id
        );
        if (!existing) break;

        const newPriceId = subscription.items.data[0].price.id;
        const newPlan = PLANS.find((p) => p.stripePriceId === newPriceId);

        await updateSubscriptionStatus(
          existing.user_id,
          subscription.id,
          subscription.status,
          new Date(subscription.current_period_end * 1000),
          newPlan?.name,
          newPriceId
        );

        console.log(`Subscription updated: ${subscription.id}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const existing = await getSubscriptionById(
          subscription.metadata?.clerkId ?? '',
          subscription.id
        );
        if (!existing) break;

        await updateSubscriptionStatus(existing.user_id, subscription.id, 'canceled');
        console.log(`Subscription canceled: ${subscription.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        if (!subscriptionId) break;

        const existing = await getSubscriptionById('', subscriptionId);
        if (!existing) break;

        await updateSubscriptionStatus(existing.user_id, subscriptionId, 'past_due');
        console.log(`Payment failed for subscription: ${subscriptionId}`);
        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }
  } catch (err) {
    console.error('Webhook handler failed:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
