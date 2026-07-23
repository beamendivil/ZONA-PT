import type { AppRole, ConditionFocus, LanguageMode } from '@/types/exercise';

export interface PatientProfile {
  role: AppRole;
  conditionFocus: ConditionFocus;
  language: LanguageMode;
}

const key = (userId: string) => `zona-pt-profile-${userId}`;

export const ProfileManager = {
  get(userId: string): PatientProfile | null {
    try {
      return JSON.parse(localStorage.getItem(key(userId)) ?? 'null') as PatientProfile | null;
    } catch {
      return null;
    }
  },
  save(userId: string, profile: PatientProfile) {
    localStorage.setItem(key(userId), JSON.stringify(profile));
  },
};
