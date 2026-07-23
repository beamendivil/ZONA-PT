import { createHmac } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { SchedulingService, verifyWebhookSignature, type SchedulingRepository } from './scheduling';

const actor = { id: '00000000-0000-4000-8000-000000000001', role: 'patient' as const, patientId: '00000000-0000-4000-8000-000000000001' };
function repo(): SchedulingRepository { return { listAvailable: vi.fn(async () => []), hold: vi.fn(async (x) => ({ holdId: 'h1', expiresAt: x.expiresAt, duplicate: false })), book: vi.fn(async () => ({ appointmentId: 'a1', duplicate: false })), changeStatus: vi.fn(async () => undefined), reschedule: vi.fn(async () => ({ appointmentId: 'a2', duplicate: false })) }; }

describe('scheduling domain', () => {
  it('creates a five-minute server-side hold', async () => {
    const repository = repo();
    await new SchedulingService(repository).hold({ actor, slotId: 's1', idempotencyKey: 'hold-key-1', now: new Date('2026-07-23T12:00:00Z') });
    expect(repository.hold).toHaveBeenCalledWith(expect.objectContaining({ expiresAt: '2026-07-23T12:05:00.000Z' }));
  });
  it('rejects forged and stale webhook signatures', () => {
    const body = '{"id":"evt_1"}', timestamp = '1000', secret = 'secret';
    const signature = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
    expect(verifyWebhookSignature({ rawBody: body, signature, timestamp, secret, nowSeconds: 1001 })).toBe(true);
    expect(verifyWebhookSignature({ rawBody: body, signature, timestamp, secret, nowSeconds: 2000 })).toBe(false);
    expect(verifyWebhookSignature({ rawBody: body, signature: '0'.repeat(64), timestamp, secret, nowSeconds: 1001 })).toBe(false);
  });
});
