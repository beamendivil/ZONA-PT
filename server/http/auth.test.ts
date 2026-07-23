import { describe, expect, it } from 'vitest';
import { resolveActorFromAccess, type AccessRow } from './auth';

const patient: AccessRow = { userId: 'u1', userStatus: 'active', membershipRole: null, membershipStatus: null, patientId: 'p1', patientAccessStatus: 'active' };
const staff: AccessRow = { ...patient, patientId: null, patientAccessStatus: null, membershipRole: 'clinician', membershipStatus: 'active' };

describe('verified application access', () => {
  it('rejects suspended accounts', () => expect(() => resolveActorFromAccess({ ...patient, userStatus: 'suspended' }, [0, 0])).toThrow('not active'));
  it('requires a registered second factor for staff', () => expect(() => resolveActorFromAccess(staff, [0, -1])).toThrow('multi-factor'));
  it('maps patient identity from server-owned access', () => expect(resolveActorFromAccess(patient, [0, -1])).toEqual({ id: 'u1', role: 'patient', patientId: 'p1' }));
});
