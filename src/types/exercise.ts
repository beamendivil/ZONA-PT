export interface Exercise {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  duration?: string;
  reps?: string;
  sets?: string;
  frequency: string;
  category: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface ExerciseAssignment {
  id: string;
  exerciseId: string;
  clientId: string;
  assignedDate: string;
  dueDate?: string;
  notes?: string;
  completed: boolean;
  completedDate?: string;
  exercise: Exercise;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  condition?: string;
  assignedExercises: ExerciseAssignment[];
}
