import { describe, expect, it, vi } from 'vitest';
import { CarePlanService, resolveExerciseContent, type CarePlanRepository } from './care-plans';

function repo(): CarePlanRepository {
  return {
    getAssignment: vi.fn(async () => ({ id: 'a1', patientId: 'p1', carePlanId: 'c1', clinicianId: 'd1', status: 'active' as const })),
    appendCompletion: vi.fn(async ({ id }) => ({ id, duplicate: false })),
    appendPain: vi.fn(async ({ id, createReviewTask }) => ({ id, duplicate: false, reviewTaskCreated: createReviewTask })),
  };
}
const actor = { id: 'p1', role: 'patient' as const, patientId: 'p1' };

describe('care plan domain', () => {
  it('falls back to English when a Spanish translation is unavailable', () => {
    const result = resolveExerciseContent({ en: { name: 'Walk', description: 'Walk', instructions: ['Walk'], warning: 'Stop if needed' } }, 'es');
    expect(result.locale).toBe('en');
    expect(result.content.name).toBe('Walk');
  });
  it('records completion as a new event', async () => {
    const repository = repo();
    await new CarePlanService(repository).recordCompletion({ actor, assignmentId: 'a1', performedAt: new Date().toISOString(), idempotencyKey: 'device-1', requestId: 'r1' });
    expect(repository.appendCompletion).toHaveBeenCalledOnce();
  });
  it('rejects progress from another patient', async () => {
    await expect(new CarePlanService(repo()).recordCompletion({ actor: { ...actor, id: 'p2', patientId: 'p2' }, assignmentId: 'a1', performedAt: new Date().toISOString(), idempotencyKey: 'device-2', requestId: 'r2' })).rejects.toMatchObject({ code: 'forbidden' });
  });
  it('creates a clinician review task for a high score without diagnosing it', async () => {
    const repository = repo();
    const result = await new CarePlanService(repository).recordPain({ actor, assignmentId: 'a1', score: 9, recordedAt: new Date().toISOString(), idempotencyKey: 'pain-1', requestId: 'r3' });
    expect(result.reviewTaskCreated).toBe(true);
    expect(repository.appendPain).toHaveBeenCalledWith(expect.objectContaining({ createReviewTask: true }));
  });
});
