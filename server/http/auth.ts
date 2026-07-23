import { createClerkClient } from '@clerk/backend';
import postgres from 'postgres';
import { DomainError, type Actor } from '../domain/intake-consent';

export interface AccessRow {
  userId: string;
  userStatus: 'active' | 'suspended' | 'closed';
  membershipRole: 'clinician' | 'admin' | null;
  membershipStatus: 'active' | 'invited' | 'suspended' | 'revoked' | null;
  patientId: string | null;
  patientAccessStatus: 'active' | 'revoked' | null;
}

export function resolveActorFromAccess(row: AccessRow | null, factorVerificationAge: [number, number] | null): Actor {
  if (!row || row.userStatus !== 'active') throw new DomainError('forbidden', 'This account is not active.');
  if (row.membershipRole && row.membershipStatus === 'active') {
    if (!factorVerificationAge || factorVerificationAge[1] < 0) throw new DomainError('mfa_required', 'Staff multi-factor authentication is required.');
    return { id: row.userId, role: row.membershipRole };
  }
  if (row.patientId && row.patientAccessStatus === 'active') return { id: row.userId, role: 'patient', patientId: row.patientId };
  throw new DomainError('forbidden', 'No active clinic or patient access was found.');
}

export async function authenticatedActor(request: Request): Promise<Actor> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY;
  const databaseUrl = process.env.DATABASE_URL;
  if (!secretKey || !publishableKey || !databaseUrl) throw new Error('Clerk and database environment variables are required.');
  const state = await createClerkClient({ secretKey, publishableKey }).authenticateRequest(request, { acceptsToken: 'session_token' });
  if (!state.isAuthenticated) throw new DomainError('unauthenticated', 'A valid session is required.');
  const auth = state.toAuth();
  const sql = postgres(databaseUrl, { max: 2, prepare: false });
  const [row] = await sql`SELECT u.id AS user_id, u.status AS user_status,
      m.role AS membership_role, m.status AS membership_status,
      p.patient_id, p.status AS patient_access_status
    FROM users u
    LEFT JOIN clinic_memberships m ON m.user_id = u.id AND m.status = 'active'
    LEFT JOIN patient_access p ON p.user_id = u.id AND p.status = 'active'
    WHERE u.clerk_user_id = ${auth.userId} LIMIT 1`;
  return resolveActorFromAccess(row ? {
    userId: String(row.user_id), userStatus: row.user_status as AccessRow['userStatus'],
    membershipRole: row.membership_role as AccessRow['membershipRole'], membershipStatus: row.membership_status as AccessRow['membershipStatus'],
    patientId: row.patient_id ? String(row.patient_id) : null, patientAccessStatus: row.patient_access_status as AccessRow['patientAccessStatus'],
  } : null, auth.factorVerificationAge);
}
