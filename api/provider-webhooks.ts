import { createHash } from 'node:crypto';
import postgres, { type JSONValue } from 'postgres';
import { z } from 'zod';
import { verifyWebhookSignature } from '../server/domain/scheduling';
import { errorResponse } from '../server/http/responses';
import { requireSyntheticEnvironment } from '../server/http/safety';

const eventSchema = z.discriminatedUnion('type', [
  z.object({ id: z.string().min(1), type: z.literal('slot.upsert'), data: z.object({ calendarId: z.string().uuid(), externalSlotId: z.string().min(1), startsAt: z.string().datetime(), endsAt: z.string().datetime(), format: z.enum(['in-person', 'virtual']) }) }),
  z.object({ id: z.string().min(1), type: z.literal('slot.unavailable'), data: z.object({ calendarId: z.string().uuid(), externalSlotId: z.string().min(1) }) }),
  z.object({ id: z.string().min(1), type: z.literal('appointment.cancelled'), data: z.object({ externalEventId: z.string().min(1) }) }),
]);
export default async function handler(request: Request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
  try {
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
    const secret = process.env.SCHEDULING_WEBHOOK_SECRET; if (!secret) throw new Error('SCHEDULING_WEBHOOK_SECRET is required.');
    const rawBody = await request.text(); const signature = request.headers.get('x-provider-signature') ?? ''; const timestamp = request.headers.get('x-provider-timestamp') ?? '';
    if (!verifyWebhookSignature({ rawBody, signature, timestamp, secret, nowSeconds: Math.floor(Date.now() / 1000) })) return Response.json({ error: 'invalid_signature', requestId }, { status: 401 });
    const event = eventSchema.parse(JSON.parse(rawBody)); const provider = request.headers.get('x-provider-name') ?? 'unconfigured';
    const sql = postgres(requireSyntheticEnvironment(), { max: 2, prepare: false });
    const [receipt] = await sql`INSERT INTO provider_webhook_events
      (provider, provider_event_id, event_type, payload_sha256, event_data, attempt_count)
      VALUES (${provider}, ${event.id}, ${event.type}, ${createHash('sha256').update(rawBody).digest('hex')}, ${sql.json(event.data as JSONValue)}, 1)
      ON CONFLICT (provider, provider_event_id) DO UPDATE SET attempt_count = provider_webhook_events.attempt_count + 1
      RETURNING id, status`;
    if (receipt.status === 'processed') return Response.json({ received: true, duplicate: true }, { headers: { 'x-request-id': requestId } });
    try {
      await sql.begin(async (tx) => {
        if (event.type === 'slot.upsert') await tx`INSERT INTO availability_slots
          (calendar_id, external_slot_id, starts_at, ends_at, format, status)
          VALUES (${event.data.calendarId}, ${event.data.externalSlotId}, ${event.data.startsAt}, ${event.data.endsAt}, ${event.data.format}, 'available')
          ON CONFLICT (calendar_id, external_slot_id) DO UPDATE SET starts_at = EXCLUDED.starts_at,
            ends_at = EXCLUDED.ends_at, format = EXCLUDED.format,
            status = CASE WHEN availability_slots.status = 'booked' THEN 'booked' ELSE 'available' END, updated_at = now()`;
        if (event.type === 'slot.unavailable') await tx`UPDATE availability_slots SET status = 'unavailable', updated_at = now()
          WHERE calendar_id = ${event.data.calendarId} AND external_slot_id = ${event.data.externalSlotId} AND status <> 'booked'`;
        if (event.type === 'appointment.cancelled') {
          const cancelled = await tx`UPDATE appointments SET status = 'cancelled', updated_at = now()
            WHERE provider = ${provider} AND external_event_id = ${event.data.externalEventId} AND status = 'booked'
            RETURNING id, slot_id`;
          if (cancelled[0]) {
            await tx`UPDATE availability_slots SET status = 'available', updated_at = now() WHERE id = ${cancelled[0].slot_id}`;
            await tx`UPDATE notification_jobs SET status = 'cancelled', updated_at = now() WHERE appointment_id = ${cancelled[0].id} AND status = 'pending'`;
            await tx`INSERT INTO appointment_status_history (appointment_id, from_status, to_status, changed_by, reason)
              VALUES (${cancelled[0].id}, 'booked', 'cancelled', '00000000-0000-0000-0000-000000000000', 'Scheduling provider webhook')`;
          }
        }
        await tx`UPDATE provider_webhook_events SET status = 'processed', processed_at = now(), last_error_code = NULL WHERE id = ${receipt.id}`;
      });
    } catch (processingError) {
      console.error('Provider webhook processing failed', { requestId, provider, eventId: event.id, eventType: event.type, error: processingError });
      await sql`UPDATE provider_webhook_events SET status = 'failed', last_error_code = 'processing_failed' WHERE id = ${receipt.id}`;
      return Response.json({ error: 'processing_failed', requestId }, { status: 500 });
    }
    return Response.json({ received: true, duplicate: false }, { status: 202, headers: { 'x-request-id': requestId } });
  } catch (error) { return errorResponse(error, requestId); }
}
