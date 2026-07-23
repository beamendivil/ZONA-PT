import postgres from 'postgres';
import { z } from 'zod';
import { errorResponse } from '../server/http/responses';
import { requireSyntheticEnvironment } from '../server/http/safety';
import { authenticatedActor } from '../server/http/auth';

const schema = z.object({
  carePlanId: z.string().uuid(), exerciseId: z.string().uuid(), dueOn: z.string().date().optional(), position: z.number().int().nonnegative().default(0),
  prescription: z.object({ sets: z.number().int().positive().optional(), repetitions: z.number().int().positive().optional(), holdSeconds: z.number().int().positive().optional(), frequency: z.string().min(1), patientInstructions: z.string().max(2000).optional() }),
});
export default async function handler(request: Request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
  try {
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
    const actor = await authenticatedActor(request);
    if (!['clinician', 'admin'].includes(actor.role)) return Response.json({ error: 'forbidden', requestId }, { status: 403 });
    const body = schema.parse(await request.json());
    const sql = postgres(requireSyntheticEnvironment(), { max: 2, prepare: false });
    const [plan] = await sql`SELECT clinician_id FROM care_plans WHERE id = ${body.carePlanId} AND status IN ('draft', 'active')`;
    if (!plan || (actor.role === 'clinician' && String(plan.clinician_id) !== actor.id)) return Response.json({ error: 'forbidden', requestId }, { status: 403 });
    const id = crypto.randomUUID();
    await sql`INSERT INTO exercise_assignments (id, care_plan_id, exercise_id, prescription, due_on, position, assigned_by)
      VALUES (${id}, ${body.carePlanId}, ${body.exerciseId}, ${sql.json(body.prescription)}, ${body.dueOn ?? null}, ${body.position}, ${actor.id})`;
    return Response.json({ id }, { status: 201, headers: { 'x-request-id': requestId } });
  } catch (error) { return errorResponse(error, requestId); }
}
