# ZONA PT Full-Stack Roadmap

## Goal

Move ZONA PT from a browser-only prototype to a secure, testable full-stack
application without stopping feature work or rewriting the current React UI.

The current app builds successfully and already has useful domain boundaries in
`src/services`. Those services should become API clients gradually. Until a
domain has been migrated, its existing demo implementation can remain available
behind a development-only adapter.

> This roadmap is an engineering plan, not a claim of HIPAA compliance. Before
> storing real patient information, the clinic must complete its legal, security,
> operational, vendor, and business-associate-agreement review.

## Proposed Architecture

```text
React + Vite SPA
      |
      | HTTPS, JSON, secure session cookie
      v
TypeScript API
      |
      +-- PostgreSQL (application data)
      +-- Object storage (documents, later)
      +-- Email/SMS provider (notifications, later)
      +-- Scheduling integration (later)
```

Recommended repository layout:

```text
apps/
  web/          Current React application
  api/          TypeScript HTTP API
packages/
  contracts/    Shared Zod schemas and API types
  database/     Schema, migrations, and seed data
```

Keep clinical rules on the server. The browser may validate for usability, but
authorization, consent requirements, assignment ownership, and completion
rules must be enforced by the API.

## Stage 0 — Stabilize the Prototype

Outcome: every later stage starts from a repeatable baseline.

- Make `build`, `typecheck`, `lint`, and automated tests pass in CI.
- Add environment validation and separate demo, test, and production settings.
- Add an error boundary, not-found page, and consistent loading/error states.
- Inventory every `localStorage` key and map it to its future database owner.
- Prevent demo credentials and seed patients from being enabled in production.
- Add dependency and secret scanning.

Exit criteria:

- A pull request cannot merge with failed checks.
- The production build contains no demo password authentication.
- A short architecture decision record identifies the selected API host,
  database host, and authentication approach.

## Stage 1 — Backend Foundation and Real Authentication

Outcome: a patient or clinician can sign in securely and load their own profile
from the database.

- Create the API, database package, migrations, and development seed command.
- Add `users`, `clinic_memberships`, `patient_profiles`, and `sessions` tables.
- Use passwordless email or a managed identity provider; use secure, HTTP-only,
  same-site cookies for the browser session.
- Enforce patient, clinician, and administrator permissions on the server.
- Add `/health`, `/auth/session`, and `/me` endpoints.
- Replace `DEMO_USERS` and `ProfileManager` with API-backed adapters.
- Add request IDs, structured logs, rate limits, and an append-only audit-event
  foundation. Never write clinical payloads or secrets to logs.

Exit criteria:

- Users cannot retrieve another patient's profile by changing an identifier.
- Session expiry, logout, unauthorized, and forbidden paths are tested.
- The web app survives refresh without losing a valid session.

## Stage 2 — Intake and Consent Vertical Slice

Outcome: a new patient can save an intake draft, sign versioned consent, and a
clinician can review the submission.

- Add `intakes`, `intake_answers`, `consent_documents`, and `consent_records`.
- Store immutable consent document versions and signature evidence.
- Autosave drafts through the API with optimistic concurrency/version checks.
- Record who created, viewed, changed, signed, or revoked sensitive records.
- Move applicability and required-form rules from `IntakeManager` and
  `ConsentManager` to server-side domain services.
- Add retention, export, and deletion policies approved by the clinic.

Exit criteria:

- Refreshing or using another authorized device restores the draft.
- A changed consent document requires acceptance of the new version.
- Concurrent edits cannot silently overwrite newer patient data.

## Stage 3 — Care Plans, Exercises, and Progress

Outcome: clinicians manage care plans and patients record exercise completion
against server-owned assignments.

- Add `exercises`, `care_plans`, `exercise_assignments`, `completion_events`,
  `pain_entries`, and clinician notes.
- Separate reusable exercise content from patient-specific prescriptions.
- Make completion history event-based instead of overwriting a counter.
- Add bilingual content fields and a clear fallback-language policy.
- Add clinician alerts as review tasks; do not represent automated pain checks
  as medical diagnosis or emergency monitoring.

Exit criteria:

- Patients only see assignments from their active care plans.
- Clinician changes and patient completion events have an audit trail.
- Time-zone handling is tested for due dates and completion dates.

## Stage 4 — Scheduling and Notifications

Outcome: appointment availability and booking are real, conflict-safe, and
observable.

- Replace generated slots with a scheduling provider or clinic calendar.
- Use server-side holds and idempotency keys to prevent double booking.
- Add appointment status history, cancellations, and rescheduling.
- Send minimum-necessary reminders through clinic-approved providers.
- Process provider webhooks with signature verification and retry handling.

Exit criteria:

- Simultaneous booking attempts cannot reserve the same slot.
- Webhook replay is safe and does not duplicate appointments or messages.

## Stage 5 — Production Readiness

Outcome: the system is supportable and ready for a controlled clinic pilot.

- Complete threat modeling, access review, vendor/BAA review, and a privacy risk
  assessment before any real PHI is entered.
- Encrypt transport and storage; establish key, backup, restore, and retention
  procedures.
- Add MFA for staff, account recovery, session/device management, and periodic
  access reviews.
- Add monitoring, alerting, incident response, disaster recovery, and tested
  database restores.
- Run accessibility, browser, performance, security, and end-to-end testing.
- Pilot with synthetic data first, then a small approved cohort.

Exit criteria:

- Restore and incident-response exercises have been completed.
- Critical user journeys pass end-to-end in the production environment.
- Clinic owners explicitly approve the controlled launch.

## Initial Data Ownership

| Current implementation | Future server owner | Migration stage |
| --- | --- | --- |
| `AuthContext` demo users | Identity/session service | 1 |
| `ProfileManager` | Patient profile service | 1 |
| `IntakeManager` | Intake service | 2 |
| `ConsentManager` | Consent service | 2 |
| Exercise assignments in static data | Care-plan service | 3 |
| `PatientProgress` | Progress service | 3 |
| `SchedulingService` generated slots | Scheduling service/provider | 4 |

## Delivery Rules for Every Stage

Each stage ships as one or more small vertical slices. A slice is complete only
when it includes:

- Database migration and rollback plan when data changes.
- API authorization and input validation.
- UI loading, empty, success, and error states.
- Unit/integration tests plus one end-to-end happy path.
- Audit/logging behavior reviewed for sensitive-data leakage.
- Updated setup notes and environment examples.

## Recommended First Implementation Slice

Start with Stage 0, then implement the smallest Stage 1 slice:

1. Add the monorepo folders and shared contract package.
2. Start PostgreSQL locally and create the first migration.
3. Implement `/health`, `/auth/session`, and `/me`.
4. Replace demo login with a development identity flow and production-safe
   provider boundary.
5. Load the patient profile through the API.
6. Add API integration tests and one browser sign-in test.

Do not migrate intake, consent, exercises, and scheduling simultaneously. The
authentication/profile slice establishes the patterns those domains will reuse.
