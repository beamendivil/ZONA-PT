CREATE TABLE provider_calendars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinician_id uuid NOT NULL,
  provider text NOT NULL,
  external_calendar_id text NOT NULL,
  timezone text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disconnected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, external_calendar_id)
);

CREATE TABLE availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id uuid NOT NULL REFERENCES provider_calendars(id) ON DELETE RESTRICT,
  external_slot_id text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  format text NOT NULL CHECK (format IN ('in-person', 'virtual')),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'held', 'booked', 'unavailable')),
  hold_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (calendar_id, external_slot_id),
  CHECK (ends_at > starts_at)
);

CREATE INDEX availability_slots_open_idx ON availability_slots (starts_at) WHERE status = 'available';

CREATE TABLE appointment_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid NOT NULL REFERENCES availability_slots(id) ON DELETE RESTRICT,
  patient_id uuid NOT NULL,
  idempotency_key text NOT NULL,
  expires_at timestamptz NOT NULL,
  released_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (patient_id, idempotency_key)
);

CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid NOT NULL REFERENCES availability_slots(id) ON DELETE RESTRICT,
  patient_id uuid NOT NULL,
  clinician_id uuid NOT NULL,
  provider text NOT NULL,
  external_event_id text,
  status text NOT NULL CHECK (status IN ('booked', 'cancelled', 'completed', 'no-show')),
  idempotency_key text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  format text NOT NULL CHECK (format IN ('in-person', 'virtual')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (patient_id, idempotency_key)
);

CREATE UNIQUE INDEX appointments_one_active_per_slot ON appointments (slot_id) WHERE status = 'booked';

CREATE TABLE appointment_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE RESTRICT,
  from_status text,
  to_status text NOT NULL,
  changed_by uuid NOT NULL,
  reason text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notification_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE RESTRICT,
  channel text NOT NULL CHECK (channel IN ('email', 'sms')),
  template_key text NOT NULL,
  destination text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  provider_message_id text,
  attempt_count integer NOT NULL DEFAULT 0,
  last_error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (appointment_id, channel, template_key, scheduled_for)
);

CREATE TABLE provider_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  provider_event_id text NOT NULL,
  event_type text NOT NULL,
  payload_sha256 text NOT NULL CHECK (length(payload_sha256) = 64),
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'failed')),
  attempt_count integer NOT NULL DEFAULT 0,
  last_error_code text,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  UNIQUE (provider, provider_event_id)
);

CREATE OR REPLACE FUNCTION reject_appointment_history_change()
RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
  RAISE EXCEPTION 'appointment history is append-only';
END; $$;

CREATE TRIGGER appointment_history_append_only
BEFORE UPDATE OR DELETE ON appointment_status_history
FOR EACH ROW EXECUTE FUNCTION reject_appointment_history_change();
