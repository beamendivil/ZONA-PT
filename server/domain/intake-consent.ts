export type ActorRole = 'patient' | 'clinician' | 'admin';

export interface Actor {
  id: string;
  role: ActorRole;
  patientId?: string;
}

export interface IntakeFormRule {
  id: string;
  version: string;
  required: boolean;
  condition?: 'dry-needling-requested' | 'telehealth-supported';
  requiredFieldIds: string[];
}

export interface IntakeState {
  id: string;
  patientId: string;
  version: number;
  profile: { requestingDryNeedling: boolean } & Record<string, unknown>;
  answers: Record<string, { version: string; answers: Record<string, unknown>; completed: boolean }>;
}

export interface ConsentDocumentState {
  id: string;
  type: string;
  version: string;
  contentSha256: string;
  required: boolean;
}

export interface AuditEvent {
  actorId: string;
  actorRole: ActorRole;
  action: string;
  resourceType: 'intake' | 'consent' | 'care_plan';
  resourceId: string;
  requestId: string;
  metadata: Record<string, string | number | boolean>;
}

export interface IntakeConsentRepository {
  getIntake(id: string): Promise<IntakeState | null>;
  appendAudit(audit: AuditEvent): Promise<void>;
  saveIntake(next: IntakeState, expectedVersion: number, audit: AuditEvent): Promise<IntakeState>;
  getConsentDocument(type: string, version: string): Promise<ConsentDocumentState | null>;
  appendConsent(input: {
    patientId: string;
    intakeId?: string;
    document: ConsentDocumentState;
    accepted: boolean;
    signedBy: string;
    signerRole: 'patient' | 'caregiver';
    signedAt: string;
    audit: AuditEvent;
  }): Promise<{ id: string }>;
}

export class DomainError extends Error {
  constructor(public readonly code: 'unauthenticated' | 'mfa_required' | 'forbidden' | 'not_found' | 'conflict' | 'invalid', message: string) {
    super(message);
  }
}

function assertOwnPatient(actor: Actor, patientId: string) {
  if (actor.role === 'patient' && actor.patientId !== patientId) {
    throw new DomainError('forbidden', 'Patients may only access their own records.');
  }
}

export function applicableForms(
  rules: IntakeFormRule[],
  profile: IntakeState['profile'],
  telehealthSupported: boolean,
) {
  return rules.filter((rule) => {
    if (rule.condition === 'dry-needling-requested') return profile.requestingDryNeedling;
    if (rule.condition === 'telehealth-supported') return telehealthSupported;
    return true;
  });
}

export function missingRequiredForms(
  intake: IntakeState,
  rules: IntakeFormRule[],
  telehealthSupported: boolean,
) {
  return applicableForms(rules, intake.profile, telehealthSupported)
    .filter((rule) => {
      if (!rule.required) return false;
      const submission = intake.answers[rule.id];
      if (!submission?.completed || submission.version !== rule.version) return true;
      return rule.requiredFieldIds.some((field) => {
        const value = submission.answers[field];
        return value === undefined || value === null || value === '' || value === false;
      });
    })
    .map((rule) => rule.id);
}

export class IntakeConsentService {
  constructor(private readonly repository: IntakeConsentRepository) {}

  async reviewIntake(input: { actor: Actor; intakeId: string; requestId: string }) {
    const intake = await this.repository.getIntake(input.intakeId);
    if (!intake) throw new DomainError('not_found', 'Intake not found.');
    assertOwnPatient(input.actor, intake.patientId);
    await this.repository.appendAudit({
      actorId: input.actor.id,
      actorRole: input.actor.role,
      action: 'intake.viewed',
      resourceType: 'intake',
      resourceId: intake.id,
      requestId: input.requestId,
      metadata: { version: intake.version },
    });
    return intake;
  }

  async saveDraft(input: {
    actor: Actor;
    intakeId: string;
    expectedVersion: number;
    profile: IntakeState['profile'];
    answers: IntakeState['answers'];
    requestId: string;
  }) {
    const current = await this.repository.getIntake(input.intakeId);
    if (!current) throw new DomainError('not_found', 'Intake not found.');
    assertOwnPatient(input.actor, current.patientId);
    if (current.version !== input.expectedVersion) {
      throw new DomainError('conflict', 'The intake was updated elsewhere. Reload before saving.');
    }

    return this.repository.saveIntake(
      { ...current, profile: input.profile, answers: input.answers, version: current.version + 1 },
      input.expectedVersion,
      {
        actorId: input.actor.id,
        actorRole: input.actor.role,
        action: 'intake.updated',
        resourceType: 'intake',
        resourceId: current.id,
        requestId: input.requestId,
        metadata: { fromVersion: current.version, toVersion: current.version + 1 },
      },
    );
  }

  async signConsent(input: {
    actor: Actor;
    patientId: string;
    intakeId?: string;
    type: string;
    version: string;
    documentSha256: string;
    accepted: boolean;
    signedBy: string;
    signerRole: 'patient' | 'caregiver';
    signedAt: string;
    requestId: string;
  }) {
    assertOwnPatient(input.actor, input.patientId);
    const document = await this.repository.getConsentDocument(input.type, input.version);
    if (!document) throw new DomainError('not_found', 'Consent document version not found.');
    if (document.contentSha256 !== input.documentSha256) {
      throw new DomainError('conflict', 'The consent document changed. Review the current version.');
    }
    if (document.required && !input.accepted) {
      throw new DomainError('invalid', 'Required consent must be accepted before signing.');
    }
    if (!input.signedBy.trim()) throw new DomainError('invalid', 'Signer name is required.');

    return this.repository.appendConsent({
      ...input,
      document,
      audit: {
        actorId: input.actor.id,
        actorRole: input.actor.role,
        action: input.accepted ? 'consent.signed' : 'consent.declined',
        resourceType: 'consent',
        resourceId: document.id,
        requestId: input.requestId,
        metadata: { documentVersion: document.version, consentType: document.type },
      },
    });
  }
}
