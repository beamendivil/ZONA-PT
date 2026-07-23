# Data Retention and Deletion Policy Template

Status: **not approved — synthetic data only**

The clinic must have this schedule reviewed for its state, specialty, payer
contracts, patient ages, malpractice coverage, and litigation-hold duties.

| Record | Proposed period | End-of-period action |
| --- | --- | --- |
| Abandoned intake draft | Clinic decision required | Secure deletion |
| Submitted intake | Clinic decision required | Archive or secure deletion |
| Consent document version | Permanent while referenced | Never mutate; retire only |
| Consent signature/revocation | Clinic decision required | Archive with medical record |
| Audit event | Clinic decision required | Secure deletion after approved period |
| Patient export | 24 hours by default | Delete generated export; retain audit event |

Rules:

- Deletion is a two-step, authorized operation with an audit event.
- A legal hold prevents deletion regardless of the normal schedule.
- Revocation appends evidence; it never erases the original signature.
- Backups follow a separately documented expiration schedule.
- Exports are encrypted in transit, time limited, and access logged.
- Production stays disabled until the clinic marks this document approved with
  an owner, effective date, and review date.
