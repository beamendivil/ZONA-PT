CREATE TABLE exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'retired')),
  content jsonb NOT NULL,
  category text NOT NULL,
  body_area text NOT NULL,
  media jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (content ? 'en')
);

CREATE TABLE care_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  clinician_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  title text NOT NULL,
  starts_on date NOT NULL,
  ends_on date,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_on IS NULL OR ends_on >= starts_on)
);

CREATE INDEX care_plans_patient_status_idx ON care_plans (patient_id, status);

CREATE TABLE exercise_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_plan_id uuid NOT NULL REFERENCES care_plans(id) ON DELETE RESTRICT,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  prescription jsonb NOT NULL,
  due_on date,
  position integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  assigned_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX exercise_assignments_plan_idx ON exercise_assignments (care_plan_id, position);

-- Completion is an event stream; repeating an exercise inserts another event.
CREATE TABLE completion_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES exercise_assignments(id) ON DELETE RESTRICT,
  patient_id uuid NOT NULL,
  performed_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'patient' CHECK (source IN ('patient', 'caregiver', 'clinician')),
  idempotency_key text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (patient_id, idempotency_key)
);

CREATE INDEX completion_events_assignment_time_idx
  ON completion_events (assignment_id, performed_at DESC);

CREATE TABLE pain_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  assignment_id uuid REFERENCES exercise_assignments(id) ON DELETE RESTRICT,
  score smallint NOT NULL CHECK (score BETWEEN 0 AND 10),
  recorded_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  idempotency_key text NOT NULL,
  UNIQUE (patient_id, idempotency_key)
);

CREATE INDEX pain_entries_patient_time_idx ON pain_entries (patient_id, recorded_at DESC);

CREATE TABLE clinician_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  care_plan_id uuid NOT NULL REFERENCES care_plans(id) ON DELETE RESTRICT,
  assignment_id uuid REFERENCES exercise_assignments(id) ON DELETE RESTRICT,
  author_id uuid NOT NULL,
  visibility text NOT NULL DEFAULT 'patient' CHECK (visibility IN ('patient', 'clinician')),
  body text NOT NULL CHECK (length(trim(body)) > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  amended_at timestamptz
);

CREATE TABLE review_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  care_plan_id uuid REFERENCES care_plans(id) ON DELETE RESTRICT,
  source_type text NOT NULL,
  source_id uuid NOT NULL,
  reason text NOT NULL,
  priority text NOT NULL DEFAULT 'routine' CHECK (priority IN ('routine', 'prompt')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'closed')),
  assigned_clinician_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz,
  closed_at timestamptz,
  UNIQUE (source_type, source_id, reason)
);

CREATE INDEX review_tasks_clinician_status_idx
  ON review_tasks (assigned_clinician_id, status, created_at DESC);

CREATE OR REPLACE FUNCTION reject_progress_event_change()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'progress events are append-only';
END;
$$;

CREATE TRIGGER completion_events_append_only BEFORE UPDATE OR DELETE ON completion_events
FOR EACH ROW EXECUTE FUNCTION reject_progress_event_change();
CREATE TRIGGER pain_entries_append_only BEFORE UPDATE OR DELETE ON pain_entries
FOR EACH ROW EXECUTE FUNCTION reject_progress_event_change();
