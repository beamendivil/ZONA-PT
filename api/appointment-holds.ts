import { z } from 'zod';
import { SchedulingService } from '../server/domain/scheduling';
import { errorResponse } from '../server/http/responses';
import { requireSyntheticEnvironment } from '../server/http/safety';
import { authenticatedActor } from '../server/http/auth';
import { createSchedulingRepository } from '../server/repositories/postgres-scheduling';

const schema = z.object({ slotId: z.string().uuid(), idempotencyKey: z.string().min(8).max(128) });
export default async function handler(request: Request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
  try {
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
    const body = schema.parse(await request.json());
    const result = await new SchedulingService(createSchedulingRepository(requireSyntheticEnvironment())).hold({ ...body, actor: await authenticatedActor(request), now: new Date() });
    return Response.json(result, { status: result.duplicate ? 200 : 201, headers: { 'x-request-id': requestId } });
  } catch (error) { return errorResponse(error, requestId); }
}
