import postgres from 'postgres';
import { errorResponse } from '../server/http/responses';
import { requireSyntheticEnvironment } from '../server/http/safety';
import { authenticatedActor } from '../server/http/auth';

export default async function handler(request: Request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
  try {
    if (request.method !== 'GET') return new Response(null, { status: 405, headers: { Allow: 'GET' } });
    const actor = await authenticatedActor(request);
    if (!['clinician', 'admin'].includes(actor.role)) return Response.json({ error: 'forbidden', requestId }, { status: 403 });
    const sql = postgres(requireSyntheticEnvironment(), { max: 2, prepare: false });
    const rows = actor.role === 'admin'
      ? await sql`SELECT id, patient_id, care_plan_id, reason, priority, status, created_at FROM review_tasks WHERE status = 'open' ORDER BY created_at`
      : await sql`SELECT id, patient_id, care_plan_id, reason, priority, status, created_at FROM review_tasks WHERE status = 'open' AND assigned_clinician_id = ${actor.id} ORDER BY created_at`;
    return Response.json({ tasks: rows }, { headers: { 'x-request-id': requestId } });
  } catch (error) { return errorResponse(error, requestId); }
}
