import { z } from 'zod';
import { IntakeConsentService } from '../../server/domain/intake-consent';
import { errorResponse } from '../../server/http/responses';
import { requireSyntheticEnvironment } from '../../server/http/safety';
import { authenticatedActor } from '../../server/http/auth';
import { createPostgresRepository } from '../../server/repositories/postgres-intake-consent';

const bodySchema = z.object({
  expectedVersion: z.number().int().positive(),
  profile: z.object({ requestingDryNeedling: z.boolean() }).passthrough(),
  answers: z.record(z.string(), z.object({
    version: z.string().min(1), answers: z.record(z.string(), z.unknown()), completed: z.boolean(),
  })),
});

export default async function handler(request: Request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
  try {
    const databaseUrl = requireSyntheticEnvironment();
    const id = new URL(request.url).pathname.split('/').pop();
    if (!id) return Response.json({ error: 'invalid', requestId }, { status: 400 });
    const service = new IntakeConsentService(createPostgresRepository(databaseUrl));
    if (request.method === 'GET') {
      const result = await service.reviewIntake({ actor: await authenticatedActor(request), intakeId: id, requestId });
      return Response.json(result, { headers: { ETag: `"${result.version}"`, 'x-request-id': requestId } });
    }
    if (request.method !== 'PUT') return new Response(null, { status: 405, headers: { Allow: 'GET, PUT' } });
    const body = bodySchema.parse(await request.json());
    const result = await service.saveDraft({ ...body, intakeId: id, actor: await authenticatedActor(request), requestId });
    return Response.json(result, { headers: { ETag: `"${result.version}"`, 'x-request-id': requestId } });
  } catch (error) {
    return errorResponse(error, requestId);
  }
}
