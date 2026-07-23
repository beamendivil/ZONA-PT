import { createHmac, timingSafeEqual } from 'node:crypto';
import { DomainError, type Actor } from './intake-consent';

export interface Slot { id: string; clinicianId: string; startsAt: string; endsAt: string; format: 'in-person' | 'virtual'; status: 'available' | 'held' | 'booked' | 'unavailable' }
export interface SchedulingRepository {
  listAvailable(from: string, to: string): Promise<Slot[]>;
  hold(input: { slotId: string; patientId: string; idempotencyKey: string; expiresAt: string }): Promise<{ holdId: string; expiresAt: string; duplicate: boolean }>;
  book(input: { holdId: string; patientId: string; idempotencyKey: string; reminder?: { channel: 'email' | 'sms'; destination: string } }): Promise<{ appointmentId: string; duplicate: boolean }>;
  changeStatus(input: { appointmentId: string; actorId: string; patientId?: string; toStatus: 'cancelled'; reason?: string }): Promise<void>;
  reschedule(input: { appointmentId: string; patientId: string; newHoldId: string; idempotencyKey: string; actorId: string }): Promise<{ appointmentId: string; duplicate: boolean }>;
}

function patientId(actor: Actor) {
  if (actor.role !== 'patient' || !actor.patientId) throw new DomainError('forbidden', 'Patient authentication is required.');
  return actor.patientId;
}

export class SchedulingService {
  constructor(private readonly repository: SchedulingRepository) {}
  availability(input: { from: string; to: string }) { return this.repository.listAvailable(input.from, input.to); }
  hold(input: { actor: Actor; slotId: string; idempotencyKey: string; now: Date }) {
    const expiresAt = new Date(input.now.getTime() + 5 * 60_000).toISOString();
    return this.repository.hold({ slotId: input.slotId, patientId: patientId(input.actor), idempotencyKey: input.idempotencyKey, expiresAt });
  }
  book(input: { actor: Actor; holdId: string; idempotencyKey: string; reminder?: { channel: 'email' | 'sms'; destination: string } }) {
    return this.repository.book({ holdId: input.holdId, patientId: patientId(input.actor), idempotencyKey: input.idempotencyKey, reminder: input.reminder });
  }
  cancel(input: { actor: Actor; appointmentId: string; reason?: string }) {
    return this.repository.changeStatus({ appointmentId: input.appointmentId, actorId: input.actor.id, patientId: input.actor.role === 'patient' ? patientId(input.actor) : undefined, toStatus: 'cancelled', reason: input.reason });
  }
  reschedule(input: { actor: Actor; appointmentId: string; newHoldId: string; idempotencyKey: string }) {
    return this.repository.reschedule({ appointmentId: input.appointmentId, patientId: patientId(input.actor), newHoldId: input.newHoldId, idempotencyKey: input.idempotencyKey, actorId: input.actor.id });
  }
}

export function verifyWebhookSignature(input: { rawBody: string; signature: string; timestamp: string; secret: string; nowSeconds: number; toleranceSeconds?: number }) {
  const timestamp = Number(input.timestamp);
  if (!Number.isInteger(timestamp) || Math.abs(input.nowSeconds - timestamp) > (input.toleranceSeconds ?? 300)) return false;
  const expected = createHmac('sha256', input.secret).update(`${input.timestamp}.${input.rawBody}`).digest('hex');
  if (!/^[a-f0-9]{64}$/i.test(input.signature)) return false;
  return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(input.signature, 'hex'));
}
