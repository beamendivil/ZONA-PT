# Clerk production setup

The code integration is complete, but these Clerk instance settings must be
configured before real accounts are invited.

## Required dashboard settings

1. Confirm the clinic's approved Clerk plan and executed BAA.
2. Disable public sign-up; create patients and staff by invitation only.
3. Enable authenticator-app MFA and backup codes.
4. Turn on **Require multi-factor authentication**. Clerk's prebuilt sign-in
   completes the `setup-mfa` task before a session becomes active.
5. Configure verified email recovery and compromised-password reset.
6. Set staff inactivity and maximum session lifetimes approved by the clinic.
7. Restrict allowed production origins to the clinic application domain.
8. Configure signed Clerk webhooks for user/session lifecycle synchronization.

## Environment

```text
VITE_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

The publishable key is browser-visible. The secret key is server-only and must
never use the `VITE_` prefix.

## Database provisioning

After accepting an invited Clerk user, create the corresponding `users` row and
either an active `clinic_memberships` or `patient_access` row. Clerk metadata is
used only for presentation; API authorization comes from PostgreSQL.

## Verification checklist

- Staff without a second factor receives `mfa_required`.
- Suspended/revoked database access is denied despite a valid Clerk session.
- Password/account recovery completes without support staff learning secrets.
- Signing out invalidates access and protected APIs return 401.
- Active sessions can be reviewed and revoked from `/account`.
- A patient cannot read or mutate another patient's records.
