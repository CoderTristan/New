'use server'

import { db } from './db'
import {UserProfiles, Subscriptions } from './schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'



async function getCurrentUserId() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')
    return userId
}
function normalizeTimestamps(data: any) {
  const result = { ...data }
  if ('created_at' in result && result.created_at) result.created_at = new Date(result.created_at)
  if ('updated_at' in result && result.updated_at) result.updated_at = new Date(result.updated_at)
  if ('last_edited' in result && result.last_edited) result.last_edited = new Date(result.last_edited)
  if ('scheduled_date' in result && result.scheduled_date) result.scheduled_date = new Date(result.scheduled_date)
  return result
}


export async function upsertUser(data: {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  stripeCustomerId?: string;
}) {
  const now = new Date();

  await db
    .insert(UserProfiles)
    .values({
      user_id: data.userId,
      first_name: data.firstName || null,
      last_name: data.lastName || null,
      email: data.email || null,
      stripe_customer_id: data.stripeCustomerId || null,
      created_at: now,
      updated_at: now,
    })
    .onConflictDoUpdate({
      target: UserProfiles.user_id,
      set: {
        first_name: data.firstName || null,
        last_name: data.lastName || null,
        email: data.email || null,
        stripe_customer_id: data.stripeCustomerId || null,
        updated_at: now,
      },
    });
}

// ----------------------
// Update a user
// ----------------------
export async function updateUser(data: {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  stripeCustomerId?: string;
}) {
  const now = new Date();

  await db
    .update(UserProfiles)
    .set({
      first_name: data.firstName || null,
      last_name: data.lastName || null,
      email: data.email || null,
      stripe_customer_id: data.stripeCustomerId || null,
      updated_at: now,
    })
    .where(eq(UserProfiles.user_id, data.userId));
}

// ----------------------
// Delete a user
// ----------------------
export async function deleteUser(userId: string) {

  // Delete subscriptions
  await db.delete(Subscriptions).where(eq(Subscriptions.user_id, userId));

  // Finally, delete the user profile
  await db.delete(UserProfiles).where(eq(UserProfiles.user_id, userId));
}

// ----------------------
// Upsert a subscription
// ----------------------
export async function upsertSubscription(data: {
  userId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  planName: string;
  status: string;
}) {
  const now = new Date();

  await db
    .insert(Subscriptions)
    .values({
      user_id: data.userId,
      stripe_subscription_id: data.stripeSubscriptionId,
      stripe_price_id: data.stripePriceId,
      plan_name: data.planName,
      status: data.status,
      created_at: now,
      updated_at: now,
    })
    .onConflictDoUpdate({
      target: Subscriptions.user_id, // use user_id instead of stripe_subscription_id
      set: {
        stripe_subscription_id: data.stripeSubscriptionId, // update to latest Stripe subscription
        plan_name: data.planName,
        status: data.status,
        stripe_price_id: data.stripePriceId,
        updated_at: now,
      },
    });
}



export async function getUserById(userId: string) {
  const rows = await db
    .select()
    .from(UserProfiles)
    .where(eq(UserProfiles.user_id, userId))
    .limit(1);

  return rows[0] ?? null;
}

// ----------------------
// Update subscription status
// ----------------------
export async function updateSubscriptionStatus(
  userId: string,
  stripeSubscriptionId: string,
  status: string,
  currentPeriodEnd?: Date,
  planName?: string,
  stripePriceId?: string
) {
  const now = new Date();

  const updateData: Partial<{
    status: string;
    current_period_end: Date;
    plan_name: string;
    stripe_price_id: string;
    updated_at: Date;
  }> = {
    status,
    updated_at: now,
  };

  if (currentPeriodEnd) updateData.current_period_end = currentPeriodEnd;
  if (planName) updateData.plan_name = planName;
  if (stripePriceId) updateData.stripe_price_id = stripePriceId;

  await db
    .update(Subscriptions)
    .set(updateData)
    .where(
      and(
        eq(Subscriptions.user_id, userId),
        eq(Subscriptions.stripe_subscription_id, stripeSubscriptionId)
      )
    );
}

// ----------------------
// Get subscription by Stripe subscription ID
// ----------------------
export async function getSubscriptionById(userId: string, stripeSubscriptionId: string) {
  const rows = await db
    .select()
    .from(Subscriptions)
    .where(
      and(
        eq(Subscriptions.user_id, userId),
        eq(Subscriptions.stripe_subscription_id, stripeSubscriptionId)
      )
    )
    .limit(1);

  return rows[0] ?? null;
}


export async function getSubscription(userId: string) {
  const data = await db
    .select()
    .from(Subscriptions)
    .where(
      and(
        eq(Subscriptions.user_id, userId),
      )
    )
    .limit(1);

  return data;
}
