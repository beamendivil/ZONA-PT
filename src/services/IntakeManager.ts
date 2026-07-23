import intakeForms from '@/data/intakeForms.json';
import type {
  IntakeDraft,
  IntakeFormDefinition,
  IntakeFormId,
  IntakeProfile,
} from '@/types/intake';

const STORAGE_KEY = 'zona-pt-intakes-v1';
export const VIRTUAL_VISITS_SUPPORTED = true;

const emptyProfile: IntakeProfile = {
  completedBy: 'patient',
  legalName: '',
  dateOfBirth: '',
  phone: '',
  email: '',
  preferredLanguage: 'bilingual',
  emergencyContactName: '',
  emergencyContactPhone: '',
  requestingDryNeedling: false,
};

function readAll(): IntakeDraft[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as IntakeDraft[];
  } catch {
    return [];
  }
}

function writeAll(drafts: IntakeDraft[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  window.dispatchEvent(new Event('zona-intake-change'));
}

export const IntakeManager = {
  forms: intakeForms as IntakeFormDefinition[],

  createDraft(): IntakeDraft {
    const now = new Date().toISOString();
    return {
      id: `intake-${crypto.randomUUID()}`,
      profile: { ...emptyProfile },
      submissions: {},
      appointment: null,
      currentStep: 0,
      createdAt: now,
      updatedAt: now,
    };
  },

  getAll() {
    return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  getById(id: string) {
    return readAll().find((draft) => draft.id === id);
  },

  getLatestDraft() {
    return this.getAll().find((draft) => !draft.appointment);
  },

  save(draft: IntakeDraft) {
    const drafts = readAll();
    const updated = { ...draft, updatedAt: new Date().toISOString() };
    const existingIndex = drafts.findIndex((item) => item.id === draft.id);
    if (existingIndex >= 0) drafts[existingIndex] = updated;
    else drafts.push(updated);
    writeAll(drafts);
    return updated;
  },

  getApplicableForms(draft: IntakeDraft) {
    return this.forms.filter((form) => {
      if (form.condition === 'dry-needling-requested') return draft.profile.requestingDryNeedling;
      if (form.condition === 'telehealth-supported') return VIRTUAL_VISITS_SUPPORTED;
      return true;
    });
  },

  getMissingRequiredForms(draft: IntakeDraft): IntakeFormId[] {
    return this.getApplicableForms(draft)
      .filter((form) => form.required && !draft.submissions[form.id]?.completed)
      .map((form) => form.id);
  },

  isReadyToSchedule(draft: IntakeDraft) {
    return this.getMissingRequiredForms(draft).length === 0;
  },
};
