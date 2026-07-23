CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE intakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'deleted')),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  submitted_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX intakes_patient_updated_idx ON intakes (patient_id, updated_at DESC);

CREATE TABLE intake_answers (
  intake_id uuid NOT NULL REFERENCES intakes(id) ON DELETE RESTRICT,
  form_id text NOT NULL,
  document_version text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (intake_id, form_id)
);

-- Published rows are immutable. A corrected document is a new version.
CREATE TABLE consent_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_type text NOT NULL,
  version text NOT NULL,
  locale text NOT NULL CHECK (locale IN ('en', 'es')),
  title text NOT NULL,
  body text NOT NULL,
  content_sha256 text NOT NULL CHECK (length(content_sha256) = 64),
  required boolean NOT NULL DEFAULT false,
  published_at timestamptz NOT NULL,
  retired_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (consent_type, version, locale)
);

CREATE TABLE consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  intake_id uuid REFERENCES intakes(id) ON DELETE RESTRICT,
  document_id uuid NOT NULL REFERENCES consent_documents(id) ON DELETE RESTRICT,
  accepted boolean NOT NULL,
  signed_by text NOT NULL,
  signer_role text NOT NULL CHECK (signer_role IN ('patient', 'caregiver')),
  signature_method text NOT NULL DEFAULT 'typed-name',
  document_sha256 text NOT NULL CHECK (length(document_sha256) = 64),
  signed_at timestamptz NOT NULL,
  revoked_at timestamptz,
  revoked_by uuid,
  revocation_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX consent_records_patient_signed_idx
  ON consent_records (patient_id, signed_at DESC);

-- Append-only security and clinical access history. Payloads must contain IDs and
-- action metadata only, never questionnaire answers or document bodies.
CREATE TABLE audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  actor_role text NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  request_id text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_events_resource_idx
  ON audit_events (resource_type, resource_id, occurred_at DESC);

CREATE OR REPLACE FUNCTION reject_immutable_consent_document_change()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'published consent documents are immutable; create a new version';
END;
$$;

CREATE TRIGGER consent_documents_immutable
BEFORE UPDATE OR DELETE ON consent_documents
FOR EACH ROW EXECUTE FUNCTION reject_immutable_consent_document_change();

CREATE OR REPLACE FUNCTION reject_audit_event_change()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit events are append-only';
END;
$$;

CREATE TRIGGER audit_events_append_only
BEFORE UPDATE OR DELETE ON audit_events
FOR EACH ROW EXECUTE FUNCTION reject_audit_event_change();
