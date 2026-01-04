import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { upsertUser, updateUser, deleteUser } from '@/lib/db/dbCalls';

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!WEBHOOK_SECRET) {
    return new Response('CLERK_WEBHOOK_SECRET is not set', { status: 500 });
  }

  // Get Svix headers
  const headerPayload = headers();
  const svix_id = (await headerPayload).get('svix-id');
  const svix_timestamp = (await headerPayload).get('svix-timestamp');
  const svix_signature = (await headerPayload).get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing Svix headers', { status: 400 });
  }

  // Get raw body
  const body = JSON.stringify(await req.json());

  // Verify webhook signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  try {
    switch (evt.type) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name } = evt.data;
        const email = email_addresses[0]?.email_address;
        if (!email) throw new Error('No email for new user');

        await upsertUser({
          userId: id,
          email,
          firstName: first_name,
          lastName: last_name,
        });

        console.log(`User created: ${id} (${email})`);
        break;
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name } = evt.data;
        const email = email_addresses[0]?.email_address;

        await updateUser({
          userId: id,
          email,
          firstName: first_name,
          lastName: last_name,
        });

        console.log(`User updated: ${id} (${email})`);
        break;
      }

      case 'user.deleted': {
        const { id } = evt.data;
        await deleteUser(id);
        console.log(`User deleted: ${id}`);
        break;
      }

      default:
        console.log(`Unhandled Clerk event type: ${evt.type}`);
    }
  } catch (err) {
    console.error('Error processing Clerk webhook:', err);
    return new Response('Webhook handler failed', { status: 500 });
  }

  return new Response('Webhook processed successfully', { status: 200 });
}
