import { z } from 'zod';
import { IntakeConsentService } from '../server/domain/intake-consent';
import { errorResponse } from '../server/http/responses';
import { requireSyntheticEnvironment } from '../server/http/safety';
import { authenticatedActor } from '../server/http/auth';
import { createPostgresRepository } from '../server/repositories/postgres-intake-consent';

const bodySchema = z.object({
  patientId: z.string().uuid(), intakeId: z.string().uuid().optional(),
  type: z.string().min(1), version: z.string().min(1), documentSha256: z.string().length(64),
  accepted: z.boolean(), signedBy: z.string().min(1), signerRole: z.enum(['patient', 'caregiver']),
  signedAt: z.string().datetime(),
});

export default async function handler(request: Request) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
  try {
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
    const databaseUrl = requireSyntheticEnvironment();
    const body = bodySchema.parse(await request.json());
    const service = new IntakeConsentService(createPostgresRepository(databaseUrl));
    const result = await service.signConsent({ ...body, actor: await authenticatedActor(request), requestId });
    return Response.json(result, { status: 201, headers: { 'x-request-id': requestId } });
  } catch (error) {
    return errorResponse(error, requestId);
  }
}
