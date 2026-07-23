import { DomainError } from '../domain/intake-consent';

export function errorResponse(error: unknown, requestId: string) {
  if (error instanceof DomainError) {
    const status = { unauthenticated: 401, mfa_required: 403, forbidden: 403, not_found: 404, conflict: 409, invalid: 422 }[error.code];
    return Response.json({ error: error.code, message: error.message, requestId }, { status });
  }
  console.error('Stage 2 API request failed', { requestId, error });
  return Response.json({ error: 'internal_error', message: 'Request failed.', requestId }, { status: 500 });
}
