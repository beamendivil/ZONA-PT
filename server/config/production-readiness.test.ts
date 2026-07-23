import { describe, expect, it } from 'vitest';
import { productionReadiness } from './production-readiness';

describe('production readiness gate', () => {
  it('defaults to synthetic-only', () => expect(productionReadiness({}).mode).toBe('synthetic-only'));
  it('rejects PHI enablement without documented approvals', () => expect(() => productionReadiness({ PHI_PRODUCTION_ENABLED: 'true' })).toThrow('requires all approval evidence'));
  it('enables only when every approval is recorded', () => expect(productionReadiness({ PHI_PRODUCTION_ENABLED: 'true', CLINIC_APPROVAL_ID: 'clinic-approval', VENDOR_BAA_REVIEW_ID: 'vendor-review', RESTORE_TEST_EVIDENCE_ID: 'restore-test', SECURITY_RISK_REVIEW_ID: 'security-review' }).phiEnabled).toBe(true));
});
