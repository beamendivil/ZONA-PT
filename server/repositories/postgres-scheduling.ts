import postgres from 'postgres';
import { DomainError } from '../domain/intake-consent';
import type { SchedulingRepository } from '../domain/scheduling';

export function createSchedulingRepository(databaseUrl: string): SchedulingRepository {
  const sql = postgres(databaseUrl, { max: 5, idle_timeout: 20, prepare: false });
  return {
    async listAvailable(from, to) {
      const rows = await sql`SELECT s.id, c.clinician_id, s.starts_at, s.ends_at, s.format, s.status
        FROM availability_slots s JOIN provider_calendars c ON c.id = s.calendar_id
        WHERE s.starts_at >= ${from} AND s.starts_at < ${to}
          AND (s.status = 'available' OR (s.status = 'held' AND s.hold_expires_at < now()))
        ORDER BY s.starts_at LIMIT 100`;
      return rows.map((row) => ({ id: String(row.id), clinicianId: String(row.clinician_id), startsAt: new Date(row.starts_at as string).toISOString(), endsAt: new Date(row.ends_at as string).toISOString(), format: row.format as 'in-person' | 'virtual', status: 'available' as const }));
    },
    async hold(input) {
      let result!: { holdId: string; expiresAt: string; duplicate: boolean };
      await sql.begin(async (tx) => {
        const [existing] = await tx`SELECT id, expires_at FROM appointment_holds WHERE patient_id = ${input.patientId} AND idempotency_key = ${input.idempotencyKey}`;
        if (existing) { result = { holdId: String(existing.id), expiresAt: new Date(existing.expires_at as string).toISOString(), duplicate: true }; return; }
        const slot = await tx`UPDATE availability_slots SET status = 'held', hold_expires_at = ${input.expiresAt}, updated_at = now()
          WHERE id = ${input.slotId} AND (status = 'available' OR (status = 'held' AND hold_expires_at < now())) RETURNING id`;
        if (slot.length !== 1) throw new DomainError('conflict', 'This appointment time is no longer available.');
        const holdId = crypto.randomUUID();
        await tx`INSERT INTO appointment_holds (id, slot_id, patient_id, idempotency_key, expires_at)
          VALUES (${holdId}, ${input.slotId}, ${input.patientId}, ${input.idempotencyKey}, ${input.expiresAt})`;
        result = { holdId, expiresAt: input.expiresAt, duplicate: false };
      });
      return result;
    },
    async book(input) {
      let result!: { appointmentId: string; duplicate: boolean };
      await sql.begin(async (tx) => {
        const [existing] = await tx`SELECT id FROM appointments WHERE patient_id = ${input.patientId} AND idempotency_key = ${input.idempotencyKey}`;
        if (existing) { result = { appointmentId: String(existing.id), duplicate: true }; return; }
        const [hold] = await tx`SELECT h.slot_id, h.expires_at, h.released_at, s.starts_at, s.ends_at, s.format,
          c.clinician_id, c.provider FROM appointment_holds h
          JOIN availability_slots s ON s.id = h.slot_id JOIN provider_calendars c ON c.id = s.calendar_id
          WHERE h.id = ${input.holdId} AND h.patient_id = ${input.patientId} FOR UPDATE OF h, s`;
        if (!hold || hold.released_at || new Date(hold.expires_at as string) <= new Date()) throw new DomainError('conflict', 'The appointment hold expired.');
        const appointmentId = crypto.randomUUID();
        await tx`INSERT INTO appointments (id, slot_id, patient_id, clinician_id, provider, status, idempotency_key, starts_at, ends_at, format)
          VALUES (${appointmentId}, ${hold.slot_id}, ${input.patientId}, ${hold.clinician_id}, ${hold.provider}, 'booked', ${input.idempotencyKey}, ${hold.starts_at}, ${hold.ends_at}, ${hold.format})`;
        await tx`UPDATE availability_slots SET status = 'booked', hold_expires_at = NULL, updated_at = now() WHERE id = ${hold.slot_id}`;
        await tx`UPDATE appointment_holds SET released_at = now() WHERE id = ${input.holdId}`;
        await tx`INSERT INTO appointment_status_history (appointment_id, from_status, to_status, changed_by) VALUES (${appointmentId}, NULL, 'booked', ${input.patientId})`;
        if (input.reminder) await tx`INSERT INTO notification_jobs (appointment_id, channel, template_key, destination, scheduled_for)
          VALUES (${appointmentId}, ${input.reminder.channel}, 'appointment-reminder-v1', ${input.reminder.destination}, ${hold.starts_at}::timestamptz - interval '24 hours')`;
        result = { appointmentId, duplicate: false };
      });
      return result;
    },
    async changeStatus(input) {
      await sql.begin(async (tx) => {
        const rows = input.patientId
          ? await tx`UPDATE appointments SET status = 'cancelled', updated_at = now() WHERE id = ${input.appointmentId} AND patient_id = ${input.patientId} AND status = 'booked' RETURNING slot_id`
          : await tx`UPDATE appointments SET status = 'cancelled', updated_at = now() WHERE id = ${input.appointmentId} AND status = 'booked' RETURNING slot_id`;
        if (rows.length !== 1) throw new DomainError('not_found', 'Active appointment not found.');
        await tx`UPDATE availability_slots SET status = 'available', updated_at = now() WHERE id = ${rows[0].slot_id}`;
        await tx`UPDATE notification_jobs SET status = 'cancelled', updated_at = now() WHERE appointment_id = ${input.appointmentId} AND status = 'pending'`;
        await tx`INSERT INTO appointment_status_history (appointment_id, from_status, to_status, changed_by, reason)
          VALUES (${input.appointmentId}, 'booked', 'cancelled', ${input.actorId}, ${input.reason ?? null})`;
      });
    },
    async reschedule(input) {
      let result!: { appointmentId: string; duplicate: boolean };
      await sql.begin(async (tx) => {
        const [existing] = await tx`SELECT id FROM appointments WHERE patient_id = ${input.patientId} AND idempotency_key = ${input.idempotencyKey}`;
        if (existing) { result = { appointmentId: String(existing.id), duplicate: true }; return; }
        const [old] = await tx`SELECT slot_id FROM appointments WHERE id = ${input.appointmentId} AND patient_id = ${input.patientId} AND status = 'booked' FOR UPDATE`;
        const [hold] = await tx`SELECT h.slot_id, h.expires_at, h.released_at, s.starts_at, s.ends_at, s.format, c.clinician_id, c.provider
          FROM appointment_holds h JOIN availability_slots s ON s.id = h.slot_id JOIN provider_calendars c ON c.id = s.calendar_id
          WHERE h.id = ${input.newHoldId} AND h.patient_id = ${input.patientId} FOR UPDATE OF h, s`;
        if (!old) throw new DomainError('not_found', 'Active appointment not found.');
        if (!hold || hold.released_at || new Date(hold.expires_at as string) <= new Date()) throw new DomainError('conflict', 'The new appointment hold expired.');
        const appointmentId = crypto.randomUUID();
        await tx`INSERT INTO appointments (id, slot_id, patient_id, clinician_id, provider, status, idempotency_key, starts_at, ends_at, format)
          VALUES (${appointmentId}, ${hold.slot_id}, ${input.patientId}, ${hold.clinician_id}, ${hold.provider}, 'booked', ${input.idempotencyKey}, ${hold.starts_at}, ${hold.ends_at}, ${hold.format})`;
        await tx`UPDATE appointments SET status = 'cancelled', updated_at = now() WHERE id = ${input.appointmentId}`;
        await tx`UPDATE availability_slots SET status = 'available', updated_at = now() WHERE id = ${old.slot_id}`;
        await tx`UPDATE availability_slots SET status = 'booked', hold_expires_at = NULL, updated_at = now() WHERE id = ${hold.slot_id}`;
        await tx`UPDATE appointment_holds SET released_at = now() WHERE id = ${input.newHoldId}`;
        await tx`UPDATE notification_jobs SET status = 'cancelled', updated_at = now() WHERE appointment_id = ${input.appointmentId} AND status = 'pending'`;
        await tx`INSERT INTO appointment_status_history (appointment_id, from_status, to_status, changed_by, reason)
          VALUES (${input.appointmentId}, 'booked', 'cancelled', ${input.actorId}, ${`Rescheduled to ${appointmentId}`}),
                 (${appointmentId}, NULL, 'booked', ${input.actorId}, ${`Rescheduled from ${input.appointmentId}`})`;
        result = { appointmentId, duplicate: false };
      });
      return result;
    },
  };
}
