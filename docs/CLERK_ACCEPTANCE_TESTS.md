# Clerk acceptance tests

Run these against Clerk's development instance before production configuration,
then repeat against production with synthetic accounts. Record screenshots,
timestamps, Clerk event IDs, and API request IDs.

- **Suspension:** sign in, suspend the database user and then ban the Clerk user;
  verify every protected API returns 403 and active sessions lose access.
- **Recovery:** use “Forgot password” with a synthetic user, complete the verified
  recovery flow, verify the previous password fails, and review Clerk's audit
  event. Support staff must never see or choose the new credential.
- **Logout:** sign out from the application, revisit a protected route, and call a
  protected API; expect redirect plus 401. Also revoke the session from `/account`
  and verify the same result on that device.
- **Cross-patient denial:** authenticate as Patient A and request Patient B's
  intake, consent, care plan, completion, pain, and appointment IDs; every request
  must return 403 or 404 without revealing whether Patient B exists.
- **MFA:** invite a clinician without a second factor; verify Clerk keeps the
  session pending and the API additionally returns `mfa_required`. Complete TOTP
  enrollment and verify access succeeds.
