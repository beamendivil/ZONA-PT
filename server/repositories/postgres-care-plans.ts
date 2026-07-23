import postgres from 'postgres';
import type { CarePlanRepository } from '../domain/care-plans';

export function createCarePlanRepository(databaseUrl: string): CarePlanRepository {
  const sql = postgres(databaseUrl, { max: 5, idle_timeout: 20, prepare: false });
  return {
    async getAssignment(id) {
      const [row] = await sql`SELECT a.id, a.status, p.id AS care_plan_id, p.patient_id, p.clinician_id
        FROM exercise_assignments a JOIN care_plans p ON p.id = a.care_plan_id
        WHERE a.id = ${id} AND p.status = 'active' LIMIT 1`;
      return row ? { id: String(row.id), patientId: String(row.patient_id), carePlanId: String(row.care_plan_id), clinicianId: String(row.clinician_id), status: row.status as 'active' | 'paused' | 'completed' | 'cancelled' } : null;
    },
    async appendCompletion(input) {
      let duplicate = false;
      await sql.begin(async (tx) => {
        const rows = await tx`INSERT INTO completion_events
          (id, assignment_id, patient_id, performed_at, source, idempotency_key)
          VALUES (${input.id}, ${input.assignment.id}, ${input.assignment.patientId}, ${input.performedAt}, ${input.source}, ${input.idempotencyKey})
          ON CONFLICT (patient_id, idempotency_key) DO NOTHING RETURNING id`;
        duplicate = rows.length === 0;
        if (!duplicate) await tx`INSERT INTO audit_events
          (actor_id, actor_role, action, resource_type, resource_id, request_id, metadata)
          VALUES (${input.audit.actorId}, ${input.audit.actorRole}, ${input.audit.action}, ${input.audit.resourceType}, ${input.audit.resourceId}, ${input.audit.requestId}, ${tx.json(input.audit.metadata)})`;
      });
      return { id: input.id, duplicate };
    },
    async appendPain(input) {
      let duplicate = false;
      let reviewTaskCreated = false;
      await sql.begin(async (tx) => {
        const rows = await tx`INSERT INTO pain_entries
          (id, patient_id, assignment_id, score, recorded_at, idempotency_key)
          VALUES (${input.id}, ${input.assignment.patientId}, ${input.assignment.id}, ${input.score}, ${input.recordedAt}, ${input.idempotencyKey})
          ON CONFLICT (patient_id, idempotency_key) DO NOTHING RETURNING id`;
        duplicate = rows.length === 0;
        if (!duplicate && input.createReviewTask) {
          const tasks = await tx`INSERT INTO review_tasks
            (patient_id, care_plan_id, source_type, source_id, reason, priority, assigned_clinician_id)
            VALUES (${input.assignment.patientId}, ${input.assignment.carePlanId}, 'pain_entry', ${input.id},
              'Review patient-reported high pain score', 'prompt', ${input.assignment.clinicianId})
            ON CONFLICT (source_type, source_id, reason) DO NOTHING RETURNING id`;
          reviewTaskCreated = tasks.length === 1;
        }
        if (!duplicate) await tx`INSERT INTO audit_events
          (actor_id, actor_role, action, resource_type, resource_id, request_id, metadata)
          VALUES (${input.audit.actorId}, ${input.audit.actorRole}, ${input.audit.action}, ${input.audit.resourceType}, ${input.audit.resourceId}, ${input.audit.requestId}, ${tx.json(input.audit.metadata)})`;
      });
      return { id: input.id, duplicate, reviewTaskCreated };
    },
  };
}
