import postgres from 'postgres';
import { z } from 'zod';
import { errorResponse } from '../server/http/responses';
import { requireSyntheticEnvironment } from '../server/http/safety';
import { authenticatedActor } from '../server/http/auth';

const schema = z.object({ carePlanId: z.string().uuid(), assignmentId: z.string().uuid().optional(), visibility: z.enum(['patient', 'clinician']).default('patient'), body: z.string().trim().min(1).max(5000) });
export default async function handler(request: Request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
  try {
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
    const actor = await authenticatedActor(request);
    if (!['clinician', 'admin'].includes(actor.role)) return Response.json({ error: 'forbidden', requestId }, { status: 403 });
    const body = schema.parse(await request.json());
    const sql = postgres(requireSyntheticEnvironment(), { max: 2, prepare: false });
    const [plan] = await sql`SELECT clinician_id FROM care_plans WHERE id = ${body.carePlanId}`;
    if (!plan || (actor.role === 'clinician' && String(plan.clinician_id) !== actor.id)) return Response.json({ error: 'forbidden', requestId }, { status: 403 });
    const id = crypto.randomUUID();
    await sql`INSERT INTO clinician_notes (id, care_plan_id, assignment_id, author_id, visibility, body)
      VALUES (${id}, ${body.carePlanId}, ${body.assignmentId ?? null}, ${actor.id}, ${body.visibility}, ${body.body})`;
    return Response.json({ id }, { status: 201, headers: { 'x-request-id': requestId } });
  } catch (error) { return errorResponse(error, requestId); }
}
