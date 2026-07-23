import { z } from 'zod';

const approvalSchema = z.object({
  PHI_PRODUCTION_ENABLED: z.enum(['true', 'false']).default('false'),
  CLINIC_APPROVAL_ID: z.string().min(8).optional(),
  VENDOR_BAA_REVIEW_ID: z.string().min(8).optional(),
  RESTORE_TEST_EVIDENCE_ID: z.string().min(8).optional(),
  SECURITY_RISK_REVIEW_ID: z.string().min(8).optional(),
});

export function productionReadiness(input: Record<string, unknown>) {
  const env = approvalSchema.parse(input);
  const evidence = [env.CLINIC_APPROVAL_ID, env.VENDOR_BAA_REVIEW_ID, env.RESTORE_TEST_EVIDENCE_ID, env.SECURITY_RISK_REVIEW_ID];
  const ready = env.PHI_PRODUCTION_ENABLED === 'true' && evidence.every(Boolean);
  if (env.PHI_PRODUCTION_ENABLED === 'true' && !ready) throw new Error('PHI production enablement requires all approval evidence IDs.');
  return { phiEnabled: ready, mode: ready ? 'approved-pilot' as const : 'synthetic-only' as const };
}
