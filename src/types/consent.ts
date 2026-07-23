export type ConsentType = 'consent-to-treat' | 'dry-needling' | 'ambient-recording';

export interface ConsentRecord {
  consentType: ConsentType;
  version: string;
  accepted: boolean;
  signedAt: string;
  signedBy: string;
  caregiverSignedBy?: string;
  revokedAt: string | null;
}

export interface ConsentDocument {
  type: ConsentType;
  version: string;
  required: boolean;
  title: { en: string; es: string };
  summary: { en: string; es: string };
  points: { en: string[]; es: string[] };
}
