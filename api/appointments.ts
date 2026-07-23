import { z } from 'zod';
import { SchedulingService } from '../server/domain/scheduling';
import { errorResponse } from '../server/http/responses';
import { requireSyntheticEnvironment } from '../server/http/safety';
import { authenticatedActor } from '../server/http/auth';
import { createSchedulingRepository } from '../server/repositories/postgres-scheduling';

const bookSchema = z.object({ holdId: z.string().uuid(), idempotencyKey: z.string().min(8).max(128), reminder: z.object({ channel: z.enum(['email', 'sms']), destination: z.string().min(3).max(254) }).optional() });
const changeSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('cancel'), appointmentId: z.string().uuid(), reason: z.string().max(500).optional() }),
  z.object({ action: z.literal('reschedule'), appointmentId: z.string().uuid(), newHoldId: z.string().uuid(), idempotencyKey: z.string().min(8).max(128) }),
]);
export default async function handler(request: Request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
  try {
    const service = new SchedulingService(createSchedulingRepository(requireSyntheticEnvironment())); const actor = await authenticatedActor(request);
    if (request.method === 'POST') {
      const result = await service.book({ ...bookSchema.parse(await request.json()), actor });
      return Response.json(result, { status: result.duplicate ? 200 : 201, headers: { 'x-request-id': requestId } });
    }
    if (request.method === 'PATCH') {
      const body = changeSchema.parse(await request.json());
      if (body.action === 'cancel') { await service.cancel({ ...body, actor }); return new Response(null, { status: 204 }); }
      const result = await service.reschedule({ ...body, actor }); return Response.json(result, { headers: { 'x-request-id': requestId } });
    }
    return new Response(null, { status: 405, headers: { Allow: 'POST, PATCH' } });
  } catch (error) { return errorResponse(error, requestId); }
}
