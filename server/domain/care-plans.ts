import { DomainError, type Actor, type AuditEvent } from './intake-consent';

export type SupportedLocale = 'en' | 'es';
export interface LocalizedExercise {
  name: string;
  description: string;
  instructions: string[];
  warning: string;
}
export interface ExerciseContent { en: LocalizedExercise; es?: LocalizedExercise }
export interface AssignmentState {
  id: string; patientId: string; carePlanId: string; clinicianId: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
}

export interface CarePlanRepository {
  getAssignment(id: string): Promise<AssignmentState | null>;
  appendCompletion(input: { id: string; assignment: AssignmentState; performedAt: string; source: string; idempotencyKey: string; audit: AuditEvent }): Promise<{ id: string; duplicate: boolean }>;
  appendPain(input: { id: string; assignment: AssignmentState; score: number; recordedAt: string; idempotencyKey: string; audit: AuditEvent; createReviewTask: boolean }): Promise<{ id: string; duplicate: boolean; reviewTaskCreated: boolean }>;
}

export function resolveExerciseContent(content: ExerciseContent, locale: SupportedLocale) {
  return { content: content[locale] ?? content.en, locale: content[locale] ? locale : 'en' as const };
}

function assertPatientAssignment(actor: Actor, assignment: AssignmentState) {
  if (actor.role !== 'patient' || actor.patientId !== assignment.patientId) {
    throw new DomainError('forbidden', 'Only the assigned patient may record progress.');
  }
  if (assignment.status !== 'active') throw new DomainError('invalid', 'This assignment is not active.');
}

export class CarePlanService {
  constructor(private readonly repository: CarePlanRepository) {}

  async recordCompletion(input: { actor: Actor; assignmentId: string; performedAt: string; idempotencyKey: string; requestId: string }) {
    const assignment = await this.repository.getAssignment(input.assignmentId);
    if (!assignment) throw new DomainError('not_found', 'Assignment not found.');
    assertPatientAssignment(input.actor, assignment);
    const id = crypto.randomUUID();
    return this.repository.appendCompletion({ id, assignment, performedAt: input.performedAt, source: 'patient', idempotencyKey: input.idempotencyKey,
      audit: { actorId: input.actor.id, actorRole: input.actor.role, action: 'exercise.completed', resourceType: 'care_plan', resourceId: assignment.carePlanId, requestId: input.requestId, metadata: { assignmentId: assignment.id } } });
  }

  async recordPain(input: { actor: Actor; assignmentId: string; score: number; recordedAt: string; idempotencyKey: string; requestId: string }) {
    const assignment = await this.repository.getAssignment(input.assignmentId);
    if (!assignment) throw new DomainError('not_found', 'Assignment not found.');
    assertPatientAssignment(input.actor, assignment);
    if (!Number.isInteger(input.score) || input.score < 0 || input.score > 10) throw new DomainError('invalid', 'Pain score must be an integer from 0 to 10.');
    const id = crypto.randomUUID();
    return this.repository.appendPain({ id, assignment, score: input.score, recordedAt: input.recordedAt, idempotencyKey: input.idempotencyKey,
      createReviewTask: input.score >= 9,
      audit: { actorId: input.actor.id, actorRole: input.actor.role, action: 'pain.recorded', resourceType: 'care_plan', resourceId: assignment.carePlanId, requestId: input.requestId, metadata: { assignmentId: assignment.id, score: input.score } } });
  }
}
