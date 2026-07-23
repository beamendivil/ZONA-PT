import postgres, { type JSONValue } from 'postgres';
import { z } from 'zod';
import { errorResponse } from '../server/http/responses';
import { requireSyntheticEnvironment } from '../server/http/safety';
import { authenticatedActor } from '../server/http/auth';

const locale = z.object({ name: z.string().min(1), description: z.string().min(1), instructions: z.array(z.string().min(1)).min(1), warning: z.string().min(1) });
const schema = z.object({ slug: z.string().regex(/^[a-z0-9-]+$/), category: z.string().min(1), bodyArea: z.string().min(1), content: z.object({ en: locale, es: locale.optional() }) });
export default async function handler(request: Request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
  try {
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
    const actor = await authenticatedActor(request);
    if (!['clinician', 'admin'].includes(actor.role)) return Response.json({ error: 'forbidden', requestId }, { status: 403 });
    const body = schema.parse(await request.json());
    const sql = postgres(requireSyntheticEnvironment(), { max: 2, prepare: false });
    const id = crypto.randomUUID();
    await sql`INSERT INTO exercises (id, slug, content, category, body_area, created_by)
      VALUES (${id}, ${body.slug}, ${sql.json(body.content as JSONValue)}, ${body.category}, ${body.bodyArea}, ${actor.id})`;
    return Response.json({ id }, { status: 201, headers: { 'x-request-id': requestId } });
  } catch (error) { return errorResponse(error, requestId); }
}
