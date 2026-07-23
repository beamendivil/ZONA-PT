import type { LanguageMode } from '@/types/exercise';

export type IntakeRole = 'patient' | 'caregiver';
export type IntakeFormId =
  | 'consent-to-treat'
  | 'hipaa-privacy'
  | 'initial-questionnaire'
  | 'medical-history'
  | 'pain-assessment'
  | 'fall-history'
  | 'emergency-contact'
  | 'dry-needling'
  | 'ambient-recording'
  | 'telehealth';

export interface IntakeProfile {
  completedBy: IntakeRole;
  legalName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  preferredLanguage: LanguageMode;
  emergencyContactName: string;
  emergencyContactPhone: string;
  requestingDryNeedling: boolean;
}

export interface IntakeField {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'radio' | 'checkbox';
  label: { en: string; es: string };
  required?: boolean;
  options?: Array<{ value: string; label: { en: string; es: string } }>;
}

export interface IntakeFormDefinition {
  id: IntakeFormId;
  version: string;
  title: { en: string; es: string };
  summary: { en: string; es: string };
  fullText: { en: string[]; es: string[] };
  required: boolean;
  kind: 'consent' | 'questionnaire';
  condition?: 'dry-needling-requested' | 'telehealth-supported';
  fields: IntakeField[];
}

export interface IntakeFormSubmission {
  formId: IntakeFormId;
  version: string;
  answers: Record<string, string | boolean>;
  signedBy: string;
  accepted: boolean;
  completed: boolean;
  completedAt: string;
}

export interface IntakeAppointment {
  type: 'initial-assessment';
  format: 'in-person' | 'virtual';
  slotId: string;
  startsAt: string;
  confirmedAt: string;
}

export interface IntakeDraft {
  id: string;
  profile: IntakeProfile;
  submissions: Partial<Record<IntakeFormId, IntakeFormSubmission>>;
  appointment: IntakeAppointment | null;
  currentStep: number;
  createdAt: string;
  updatedAt: string;
}
