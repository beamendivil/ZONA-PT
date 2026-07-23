import { z } from 'zod';
import { CarePlanService } from '../server/domain/care-plans';
import { errorResponse } from '../server/http/responses';
import { requireSyntheticEnvironment } from '../server/http/safety';
import { authenticatedActor } from '../server/http/auth';
import { createCarePlanRepository } from '../server/repositories/postgres-care-plans';

const schema = z.object({ assignmentId: z.string().uuid(), performedAt: z.string().datetime(), idempotencyKey: z.string().min(8).max(128) });
export default async function handler(request: Request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
  try {
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
    const body = schema.parse(await request.json());
    const service = new CarePlanService(createCarePlanRepository(requireSyntheticEnvironment()));
    const result = await service.recordCompletion({ ...body, actor: await authenticatedActor(request), requestId });
    return Response.json(result, { status: result.duplicate ? 200 : 201, headers: { 'x-request-id': requestId } });
  } catch (error) { return errorResponse(error, requestId); }
}
