import { describe, expect, it, vi } from 'vitest';
import {
  DomainError,
  IntakeConsentService,
  missingRequiredForms,
  type IntakeConsentRepository,
  type IntakeState,
} from './intake-consent';

const intake: IntakeState = {
  id: 'intake-1', patientId: 'patient-1', version: 2,
  profile: { requestingDryNeedling: false }, answers: {},
};

function repository(): IntakeConsentRepository {
  return {
    getIntake: vi.fn(async () => intake),
    appendAudit: vi.fn(async () => undefined),
    saveIntake: vi.fn(async (next) => next),
    getConsentDocument: vi.fn(async () => ({
      id: 'document-1', type: 'consent-to-treat', version: 'v1',
      contentSha256: 'a'.repeat(64), required: true,
    })),
    appendConsent: vi.fn(async () => ({ id: 'record-1' })),
  };
}

describe('intake and consent domain', () => {
  it('applies conditional forms and validates required fields on the server', () => {
    expect(missingRequiredForms(intake, [
      { id: 'history', version: 'v1', required: true, requiredFieldIds: ['conditions'] },
      { id: 'dry', version: 'v1', required: true, condition: 'dry-needling-requested', requiredFieldIds: [] },
    ], true)).toEqual(['history']);
  });

  it('allows clinician review and records the sensitive-data view', async () => {
    const repo = repository();
    const service = new IntakeConsentService(repo);
    await expect(service.reviewIntake({
      actor: { id: 'clinician-1', role: 'clinician' }, intakeId: intake.id, requestId: 'request-view',
    })).resolves.toEqual(intake);
    expect(repo.appendAudit).toHaveBeenCalledWith(expect.objectContaining({ action: 'intake.viewed' }));
  });

  it('rejects stale autosaves with an optimistic concurrency conflict', async () => {
    const service = new IntakeConsentService(repository());
    await expect(service.saveDraft({
      actor: { id: 'patient-1', role: 'patient', patientId: 'patient-1' },
      intakeId: intake.id, expectedVersion: 1, profile: intake.profile, answers: {}, requestId: 'request-1',
    })).rejects.toMatchObject({ code: 'conflict' } satisfies Partial<DomainError>);
  });

  it('prevents a patient from accessing another patient intake', async () => {
    const service = new IntakeConsentService(repository());
    await expect(service.saveDraft({
      actor: { id: 'patient-2', role: 'patient', patientId: 'patient-2' },
      intakeId: intake.id, expectedVersion: 2, profile: intake.profile, answers: {}, requestId: 'request-2',
    })).rejects.toMatchObject({ code: 'forbidden' } satisfies Partial<DomainError>);
  });

  it('binds a signature to the exact immutable document hash', async () => {
    const service = new IntakeConsentService(repository());
    await expect(service.signConsent({
      actor: { id: 'patient-1', role: 'patient', patientId: 'patient-1' },
      patientId: 'patient-1', type: 'consent-to-treat', version: 'v1',
      documentSha256: 'b'.repeat(64), accepted: true, signedBy: 'Patient One',
      signerRole: 'patient', signedAt: new Date().toISOString(), requestId: 'request-3',
    })).rejects.toMatchObject({ code: 'conflict' } satisfies Partial<DomainError>);
  });
});
