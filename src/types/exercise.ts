export interface Exercise {
  id: string;
  name: string;
  spanishName: string;
  description: string;
  bodyArea: string;
  conditionCategory: ConditionFocus;
  instructions: string[];
  spanishInstructions: string[];
  formCues: string[];
  equipmentSubstitute: string;
  holdDurationSeconds?: 5 | 10 | 30;
  duration?: string;
  reps?: string;
  sets?: string;
  setCount: number;
  frequency: string;
  category: string;
  painWarning: string;
  imageUrl?: string;
  videoUrl?: string;
}

export type ConditionFocus =
  | 'hip-knee-after-fall'
  | 'low-back-pain'
  | 'general-strength-mobility';

export type LanguageMode = 'english' | 'spanish' | 'bilingual';
export type AppRole = 'patient' | 'caregiver' | 'clinician';

export interface ExerciseAssignment {
  id: string;
  exerciseId: string;
  clientId: string;
  assignedDate: string;
  dueDate?: string;
  notes?: string;
  completed: boolean;
  completedDate?: string;
  dryNeedling?: boolean;
  exercise: Exercise;
}

export interface RecoveryData {
  routineCompletion: string;
  painScore: number;
  functionalOutcome:
    | 'Timed Up and Go'
    | '30 Second Chair Test'
    | 'Tinetti'
    | 'Lower Extremity Functional Scale';
  functionalOutcomeScore: string;
  reassessmentNotes: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  condition?: string;
  dryNeedlingAssigned?: boolean;
  recovery: RecoveryData;
  assignedExercises: ExerciseAssignment[];
}
