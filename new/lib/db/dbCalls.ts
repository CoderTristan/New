'use server'

import { db } from './db'
import { Scripts, UserSettings, Ideas, Reviews, UserProfiles, Subscriptions } from './schema'
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
export async function addAttachmentToScript(scriptId: string, attachment: { name: string; url: string; category: string }) {
  const userId = await getCurrentUserId()

  // Fetch existing attachments
  const row = await db
    .select({ attachments: Scripts.attachments })
    .from(Scripts)
    .where(and(eq(Scripts.id, scriptId), eq(Scripts.user_id, userId)))
    .limit(1)

  if (!row[0]) throw new Error('Script not found or unauthorized')

  const existingAttachments = row[0].attachments || []

  const updatedAttachments = [...existingAttachments, attachment]

  // Update the script in the DB
  await db
    .update(Scripts)
    .set({ attachments: updatedAttachments, updated_at: new Date() })
    .where(and(eq(Scripts.id, scriptId), eq(Scripts.user_id, userId)))

  return updatedAttachments
}
// ----------------------
// Scripts
// ----------------------
export async function getUserScripts() {
  const userId = await getCurrentUserId()
  return db.select().from(Scripts).where(eq(Scripts.user_id, userId))
}

export async function getScriptById(scriptId) {
  console.log('Fetching script with id:', scriptId);
  const userId = await getCurrentUserId()
  const rows = await db
    .select()
    .from(Scripts)
    .where(and(eq(Scripts.id, scriptId), eq(Scripts.user_id, userId)))
    .limit(1)
  if (rows.length === 0) {
    console.log('No script found with id:', scriptId);
  }
  return rows[0] 
}

export async function getScriptByIdeaId(ideaId) {
  const userId = await getCurrentUserId()
  const rows = await db
    .select()
    .from(Scripts)
    .where(and(eq(Scripts.idea_id, ideaId), eq(Scripts.user_id, userId)))
    .limit(1)
  return rows[0] ?? null
}


export async function createScript(data) {
  const userId = await getCurrentUserId()
  const safeData = normalizeTimestamps({ ...data, created_at: new Date(), updated_at: new Date() })
  const [newScript] = await db.insert(Scripts).values({ ...safeData, user_id: userId }).returning()
  return newScript
}

export async function updateScript(scriptId, data) {
  const userId = await getCurrentUserId()
  const safeData = normalizeTimestamps({ ...data, updated_at: new Date() })
  await db.update(Scripts).set(safeData).where(and(eq(Scripts.id, scriptId), eq(Scripts.user_id, userId)))
}

export async function deleteScript(scriptId) {
  const userId = await getCurrentUserId()
  await db.delete(Scripts).where(and(eq(Scripts.id, scriptId), eq(Scripts.user_id, userId)))
}

// ----------------------
// User Settings
// ----------------------
export async function getUserSettings() {
  const userId = await getCurrentUserId()
  const rows = await db.select().from(UserSettings).where(eq(UserSettings.user_id, userId)).limit(1)
  return rows[0] ?? null
}

export async function updateUserSettings(data) {
  const userId = await getCurrentUserId()
  await db.update(UserSettings).set({ ...data }).where(eq(UserSettings.user_id, userId))
}

// ----------------------
// Ideas
// ----------------------
export async function getUserIdeas() {
  const userId = await getCurrentUserId()
  return db.select().from(Ideas).where(eq(Ideas.user_id, userId))
}

export async function getIdeaById(ideaId) {
  const userId = await getCurrentUserId()
  const rows = await db
    .select()
    .from(Ideas)
    .where(and(eq(Ideas.id, ideaId), eq(Ideas.user_id, userId)))
    .limit(1)
  return rows[0] ?? null
}

export async function createIdea(data) {
  const userId = await getCurrentUserId()
  const safeData = normalizeTimestamps({ ...data, created_at: new Date(), updated_at: new Date() })
  const [newIdea] = await db.insert(Ideas).values({ ...safeData, user_id: userId }).returning()
  return newIdea
}

export async function updateIdea(ideaId, data) {
  const userId = await getCurrentUserId()
  const safeData = normalizeTimestamps({ ...data, updated_at: new Date() })
  await db.update(Ideas).set(safeData).where(and(eq(Ideas.id, ideaId), eq(Ideas.user_id, userId)))
}

export async function deleteIdea(ideaId) {
  const userId = await getCurrentUserId()
  await db.delete(Ideas).where(and(eq(Ideas.id, ideaId), eq(Ideas.user_id, userId)))
}

// Promote an idea to a script
export async function promoteIdeaToScript(ideaId, scriptData) {
  const userId = await getCurrentUserId()
  // Create the script
  const safeData = normalizeTimestamps({ ...scriptData, created_at: new Date(), updated_at: new Date() })
  const [newScript] = await db.insert(Scripts).values({ ...safeData, user_id: userId }).returning()

  // Update the idea status
  await db.update(Ideas).set({ status: 'promoted', promoted_to_script_id: newScript.id }).where(and(eq(Ideas.id, ideaId), eq(Ideas.user_id, userId)))

  return newScript
}



// ----------------------
export async function updateScriptStage(scriptId: string | number, stage: 'idea' | 'draft' | 'editing' | 'ready' | 'published') {
  const userId = await getCurrentUserId();
  await db.update(Scripts)
    .set({ stage, last_edited: new Date() }) // update stage and last edited timestamp
    .where(and(eq(Scripts.id, scriptId), eq(Scripts.user_id, userId)));
}

export async function getUserReviews() {
  const userId = await getCurrentUserId()
  return db.select().from(Reviews).where(eq(Reviews.user_id, userId))
}

export async function createReview(data) {
  const userId = await getCurrentUserId()
  const safeData = normalizeTimestamps({ ...data, created_at: new Date(), updated_at: new Date() })
  const [newReview] = await db.insert(Reviews).values({ ...safeData, user_id: userId }).returning()
  return newReview
}
// ----------------------
// User Settings (UPSERT)
// ----------------------
export async function saveSettings(settings: {
  default_words_per_minute: number
  max_concurrent_drafts: number
  require_schedule_before_draft: boolean
}) {
  const userId = await getCurrentUserId()
  const now = new Date()

  await db
    .insert(UserSettings)
    .values({
      user_id: userId,
      default_words_per_minute: settings.default_words_per_minute,
      max_concurrent_drafts: settings.max_concurrent_drafts,
      require_schedule_before_draft: settings.require_schedule_before_draft,
      created_at: now,
      updated_at: now,
    })
    .onConflictDoUpdate({
      target: UserSettings.user_id,
      set: {
        default_words_per_minute: settings.default_words_per_minute,
        max_concurrent_drafts: settings.max_concurrent_drafts,
        require_schedule_before_draft: settings.require_schedule_before_draft,
        updated_at: now,
      },
    })
}


export async function getReviewByScriptId(scriptId: string | number) {
  const userId = await getCurrentUserId()
  const data = await db.select().from(Reviews).where(and(eq(Reviews.user_id, userId), eq(Reviews.script_id, scriptId)))
  return data[0]
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
  // Delete all reviews
  await db.delete(Reviews).where(eq(Reviews.user_id, userId));

  // Delete all scripts
  await db.delete(Scripts).where(eq(Scripts.user_id, userId));

  // Delete all ideas
  await db.delete(Ideas).where(eq(Ideas.user_id, userId));

  // Delete user settings
  await db.delete(UserSettings).where(eq(UserSettings.user_id, userId));

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
