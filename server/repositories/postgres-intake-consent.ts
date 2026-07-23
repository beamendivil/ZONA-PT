import postgres, { type JSONValue } from 'postgres';
import { DomainError, type IntakeConsentRepository, type IntakeState } from '../domain/intake-consent';

export function createPostgresRepository(databaseUrl: string): IntakeConsentRepository {
  const sql = postgres(databaseUrl, { max: 5, idle_timeout: 20, prepare: false });

  return {
    async getIntake(id) {
      const [row] = await sql`SELECT id, patient_id, version, profile FROM intakes
        WHERE id = ${id} AND status <> 'deleted' LIMIT 1`;
      if (!row) return null;
      const answerRows = await sql`SELECT form_id, document_version, answers, completed
        FROM intake_answers WHERE intake_id = ${id}`;
      return {
        id: String(row.id), patientId: String(row.patient_id), version: Number(row.version),
        profile: row.profile as IntakeState['profile'],
        answers: Object.fromEntries(answerRows.map((answer) => [String(answer.form_id), {
          version: String(answer.document_version),
          answers: answer.answers as Record<string, unknown>,
          completed: Boolean(answer.completed),
        }])),
      };
    },

    async appendAudit(audit) {
      await sql`INSERT INTO audit_events
        (actor_id, actor_role, action, resource_type, resource_id, request_id, metadata)
        VALUES (${audit.actorId}, ${audit.actorRole}, ${audit.action}, ${audit.resourceType},
          ${audit.resourceId}, ${audit.requestId}, ${sql.json(audit.metadata)})`;
    },

    async saveIntake(next, expectedVersion, audit) {
      await sql.begin(async (tx) => {
        const updated = await tx`UPDATE intakes SET profile = ${tx.json(next.profile as JSONValue)},
          version = ${next.version}, updated_at = now()
          WHERE id = ${next.id} AND version = ${expectedVersion} AND status = 'draft'
          RETURNING id`;
        if (updated.length !== 1) throw new DomainError('conflict', 'The intake was updated elsewhere.');
        for (const [formId, submission] of Object.entries(next.answers)) {
          await tx`INSERT INTO intake_answers
            (intake_id, form_id, document_version, answers, completed, completed_at)
            VALUES (${next.id}, ${formId}, ${submission.version}, ${tx.json(submission.answers as JSONValue)},
              ${submission.completed}, ${submission.completed ? tx`now()` : null})
            ON CONFLICT (intake_id, form_id) DO UPDATE SET
              document_version = EXCLUDED.document_version, answers = EXCLUDED.answers,
              completed = EXCLUDED.completed, completed_at = EXCLUDED.completed_at, updated_at = now()`;
        }
        await tx`INSERT INTO audit_events
          (actor_id, actor_role, action, resource_type, resource_id, request_id, metadata)
          VALUES (${audit.actorId}, ${audit.actorRole}, ${audit.action}, ${audit.resourceType},
            ${audit.resourceId}, ${audit.requestId}, ${tx.json(audit.metadata)})`;
      });
      return next;
    },

    async getConsentDocument(type, version) {
      const [row] = await sql`SELECT id, consent_type, version, content_sha256, required
        FROM consent_documents WHERE consent_type = ${type} AND version = ${version}
        AND retired_at IS NULL ORDER BY locale = 'en' DESC LIMIT 1`;
      return row ? {
        id: String(row.id), type: String(row.consent_type), version: String(row.version),
        contentSha256: String(row.content_sha256), required: Boolean(row.required),
      } : null;
    },

    async appendConsent(input) {
      const id = crypto.randomUUID();
      await sql.begin(async (tx) => {
        await tx`INSERT INTO consent_records
          (id, patient_id, intake_id, document_id, accepted, signed_by, signer_role,
            document_sha256, signed_at)
          VALUES (${id}, ${input.patientId}, ${input.intakeId ?? null}, ${input.document.id},
            ${input.accepted}, ${input.signedBy}, ${input.signerRole},
            ${input.document.contentSha256}, ${input.signedAt})`;
        await tx`INSERT INTO audit_events
          (actor_id, actor_role, action, resource_type, resource_id, request_id, metadata)
          VALUES (${input.audit.actorId}, ${input.audit.actorRole}, ${input.audit.action},
            ${input.audit.resourceType}, ${id}, ${input.audit.requestId}, ${tx.json(input.audit.metadata)})`;
      });
      return { id };
    },
  };
}
