import { verifyWebhook } from '@clerk/backend/webhooks';
import postgres from 'postgres';

export default async function handler(request: Request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
  try {
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
    const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    const databaseUrl = process.env.DATABASE_URL;
    if (!signingSecret || !databaseUrl) throw new Error('Clerk webhook and database configuration are required.');
    const event = await verifyWebhook(request, { signingSecret });
    const sql = postgres(databaseUrl, { max: 2, prepare: false });
    if (event.type === 'user.created' || event.type === 'user.updated') {
      const primary = event.data.email_addresses.find((email) => email.id === event.data.primary_email_address_id)?.email_address ?? '';
      const displayName = [event.data.first_name, event.data.last_name].filter(Boolean).join(' ') || primary || 'ZONA PT user';
      const suspended = event.data.banned || event.data.locked;
      await sql`INSERT INTO users (clerk_user_id, primary_email, display_name, status)
        VALUES (${event.data.id}, ${primary}, ${displayName}, ${suspended ? 'suspended' : 'active'})
        ON CONFLICT (clerk_user_id) DO UPDATE SET primary_email = EXCLUDED.primary_email,
          display_name = EXCLUDED.display_name,
          status = CASE WHEN ${suspended} THEN 'suspended' ELSE users.status END, updated_at = now()`;
    }
    if (event.type === 'user.deleted' && event.data.id) {
      await sql.begin(async (tx) => {
        const users = await tx`UPDATE users SET status = 'closed', updated_at = now() WHERE clerk_user_id = ${event.data.id!} RETURNING id`;
        if (users[0]) {
          await tx`UPDATE clinic_memberships SET status = 'revoked', updated_at = now() WHERE user_id = ${users[0].id}`;
          await tx`UPDATE patient_access SET status = 'revoked', revoked_at = now() WHERE user_id = ${users[0].id}`;
        }
      });
    }
    return Response.json({ received: true }, { headers: { 'x-request-id': requestId } });
  } catch (error) {
    console.error('Clerk webhook failed', { requestId, error });
    return Response.json({ error: 'invalid_webhook', requestId }, { status: 400 });
  }
}
