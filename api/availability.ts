import { z } from 'zod';
import { SchedulingService } from '../server/domain/scheduling';
import { errorResponse } from '../server/http/responses';
import { requireSyntheticEnvironment } from '../server/http/safety';
import { createSchedulingRepository } from '../server/repositories/postgres-scheduling';
import { authenticatedActor } from '../server/http/auth';

const querySchema = z.object({ from: z.string().datetime(), to: z.string().datetime() });
export default async function handler(request: Request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
  try {
    if (request.method !== 'GET') return new Response(null, { status: 405, headers: { Allow: 'GET' } });
    await authenticatedActor(request);
    const url = new URL(request.url); const query = querySchema.parse({ from: url.searchParams.get('from'), to: url.searchParams.get('to') });
    const slots = await new SchedulingService(createSchedulingRepository(requireSyntheticEnvironment())).availability(query);
    return Response.json({ slots }, { headers: { 'x-request-id': requestId } });
  } catch (error) { return errorResponse(error, requestId); }
}
