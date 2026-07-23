import postgres from 'postgres';
import { z } from 'zod';
import { errorResponse } from '../server/http/responses';
import { requireSyntheticEnvironment } from '../server/http/safety';
import { authenticatedActor } from '../server/http/auth';

const schema = z.object({ patientId: z.string().uuid(), title: z.string().trim().min(1).max(160), startsOn: z.string().date(), endsOn: z.string().date().optional() });
export default async function handler(request: Request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
  try {
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
    const actor = await authenticatedActor(request);
    if (!['clinician', 'admin'].includes(actor.role)) return Response.json({ error: 'forbidden', requestId }, { status: 403 });
    const body = schema.parse(await request.json());
    const sql = postgres(requireSyntheticEnvironment(), { max: 2, prepare: false });
    const id = crypto.randomUUID();
    await sql.begin(async (tx) => {
      await tx`INSERT INTO care_plans (id, patient_id, clinician_id, title, starts_on, ends_on)
        VALUES (${id}, ${body.patientId}, ${actor.id}, ${body.title}, ${body.startsOn}, ${body.endsOn ?? null})`;
      await tx`INSERT INTO audit_events (actor_id, actor_role, action, resource_type, resource_id, request_id)
        VALUES (${actor.id}, ${actor.role}, 'care_plan.created', 'care_plan', ${id}, ${requestId})`;
    });
    return Response.json({ id, version: 1 }, { status: 201, headers: { 'x-request-id': requestId } });
  } catch (error) { return errorResponse(error, requestId); }
}
