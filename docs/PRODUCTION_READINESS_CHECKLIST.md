# ZONA PT Controlled Pilot Readiness

Status: **Synthetic-data pilot only — real PHI is not approved**

This is a working checklist, not a certification or legal opinion. Replace every
`[CLINIC DECISION REQUIRED]` entry with an approved owner, decision, effective
date, and evidence link before enabling real patient information.

## Approval record

| Decision | Status | Owner | Evidence / date |
| --- | --- | --- | --- |
| Clinic legal name and privacy contact | [CLINIC DECISION REQUIRED] | [OWNER] | [LINK / DATE] |
| HIPAA covered-entity determination | [CLINIC DECISION REQUIRED] | [OWNER] | [LINK / DATE] |
| Security/privacy risk analysis | Not approved | [OWNER] | [LINK / DATE] |
| Production PHI authorization | **Blocked** | Clinician owner | [LINK / DATE] |
| Pilot cohort and success criteria | [CLINIC DECISION REQUIRED] | [OWNER] | [LINK / DATE] |

## Threat model

Protected assets: patient identity, intake answers, consent evidence, care plans,
pain entries, appointments, audit history, credentials, encryption keys, and
backups.

| Threat | Required control | Status |
| --- | --- | --- |
| Account takeover | Staff MFA, secure recovery, session revocation | Pending provider |
| Patient-to-patient access | Server authorization and ownership tests | Domain tests present; real auth pending |
| Staff over-access | Least privilege and quarterly access review | [CLINIC DECISION REQUIRED] |
| Data leaked to logs | Structured allowlisted metadata; no clinical payloads | Engineering review required |
| Double booking/replayed request | Atomic holds and idempotency keys | Implemented |
| Forged webhook | HMAC signature and timestamp verification | Implemented |
| Lost or corrupted database | Encrypted backup and tested restoration | Provider/runbook pending |
| Stolen device/session | Short staff sessions, device list, remote revocation | Pending real auth |
| Vendor compromise | BAA, security review, incident terms | Pending vendor selection |

## Vendor and BAA register

No vendor may receive PHI until its row is approved.

| Service | Proposed vendor/plan | PHI handled | BAA executed | Security owner |
| --- | --- | --- | --- | --- |
| Hosting/functions | [CLINIC DECISION REQUIRED] | Possibly | No | [OWNER] |
| PostgreSQL/backups | [CLINIC DECISION REQUIRED] | Yes | No | [OWNER] |
| Authentication/MFA | [CLINIC DECISION REQUIRED] | Identity | No | [OWNER] |
| Email/SMS reminders | [CLINIC DECISION REQUIRED] | Minimum necessary | No | [OWNER] |
| Calendar/scheduling | [CLINIC DECISION REQUIRED] | Appointment data | No | [OWNER] |
| Monitoring/error tracking | [CLINIC DECISION REQUIRED] | Metadata only | No | [OWNER] |

## Encryption, keys, backup, and restore

- TLS minimum/version and certificate owner: [CLINIC DECISION REQUIRED]
- Database encryption-at-rest evidence: [PROVIDER EVIDENCE REQUIRED]
- Backup encryption evidence: [PROVIDER EVIDENCE REQUIRED]
- Key manager and rotation interval: [CLINIC DECISION REQUIRED]
- Backup frequency and retention: [CLINIC DECISION REQUIRED]
- Recovery point objective (RPO): [CLINIC DECISION REQUIRED]
- Recovery time objective (RTO): [CLINIC DECISION REQUIRED]
- Last successful isolated restore test: **Never — BLOCKING**

Restore procedure: create an isolated recovery database, restore the selected
encrypted backup, run migrations in verification mode, compare row counts and
checksums, execute critical synthetic journeys, record evidence, then destroy
the isolated copy according to policy. Never test restoration over production.

## Identity and access

- Staff MFA: required before real PHI; provider pending.
- Recovery: identity-verified recovery with logged administrative action.
- Sessions: list active devices, revoke individual/all sessions, and use shorter
  staff inactivity/absolute timeouts than patient sessions.
- Access reviews: proposed quarterly; frequency requires clinic approval.
- Emergency access: [CLINIC DECISION REQUIRED], time limited and audited.
- Termination: same-day account and session revocation.

## Retention and deletion

The detailed schedule remains in `DATA_RETENTION_POLICY_TEMPLATE.md`. No
automated deletion job may run until it is approved. Legal holds override normal
deletion, consent revocation appends evidence, and deletion must be audited.

## Monitoring and incident response

Alert destinations and on-call owner: [CLINIC DECISION REQUIRED]

Minimum alerts: failed authentication spikes, authorization denials, webhook
signature failures, repeated job failures, database availability, backup
failure, elevated API errors, and expiring credentials.

Incident sequence: contain access, preserve evidence, rotate affected secrets,
assess scope, contact the clinic privacy/security owner, follow approved breach
assessment and notification procedures, restore safely, and document lessons.
Do not put PHI into tickets, chat, or alert payloads.

## Controlled pilot gates

1. Automated quality, accessibility, and end-to-end checks pass.
2. Synthetic-only staff walkthrough and restore exercise pass.
3. Every PHI-handling vendor and BAA row is approved.
4. Real MFA, recovery, session/device controls, and access review work.
5. Consent language, retention schedule, privacy notice, and incident contacts
   are approved.
6. The clinician signs the production-PHI authorization.
7. Start with a small approved cohort, publish support hours, measure task
   completion/errors, and define an immediate rollback trigger.
