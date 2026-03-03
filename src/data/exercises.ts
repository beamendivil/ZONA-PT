import type { Exercise, Client } from '@/types/exercise';

export const EXERCISES: Exercise[] = [
  {
    id: 'ex-1',
    name: 'Neck Stretches',
    description: 'Gentle stretches to relieve neck tension and improve mobility.',
    instructions: [
      'Sit or stand with good posture',
      'Slowly tilt your head to the right, bringing ear toward shoulder',
      'Hold for 15-30 seconds',
      'Return to center and repeat on left side',
      'Do 3-5 repetitions per side',
    ],
    duration: '15-30 seconds',
    reps: '3-5 per side',
    frequency: '2-3 times daily',
    category: 'Neck & Shoulder',
  },
  {
    id: 'ex-2',
    name: 'Shoulder Rolls',
    description: 'Simple movement to release shoulder tension and improve circulation.',
    instructions: [
      'Sit or stand with arms relaxed at sides',
      'Roll shoulders forward in a circular motion',
      'Complete 10 rolls forward',
      'Reverse direction and roll backward 10 times',
      'Keep movements slow and controlled',
    ],
    reps: '10 each direction',
    frequency: '3-4 times daily',
    category: 'Neck & Shoulder',
  },
  {
    id: 'ex-3',
    name: 'Knee Extensions',
    description: 'Strengthen the quadriceps muscles to support knee joint.',
    instructions: [
      'Sit in a chair with feet flat on floor',
      'Slowly straighten one leg, lifting foot off ground',
      'Hold for 5 seconds at the top',
      'Lower leg back down slowly',
      'Repeat with other leg',
    ],
    sets: '2-3',
    reps: '10-15 per leg',
    frequency: 'Once daily',
    category: 'Knee Rehab',
  },
  {
    id: 'ex-4',
    name: 'Hamstring Stretch',
    description: 'Stretch the back of your thigh to improve flexibility.',
    instructions: [
      'Sit on the floor with one leg extended',
      'Bend the other leg with foot against inner thigh',
      'Reach toward toes of extended leg',
      'Hold stretch without bouncing',
      'Switch legs and repeat',
    ],
    duration: '30 seconds',
    reps: '2 per leg',
    frequency: '2 times daily',
    category: 'Lower Back & Hip',
  },
  {
    id: 'ex-5',
    name: 'Pelvic Tilts',
    description: 'Activate core muscles and relieve lower back tension.',
    instructions: [
      'Lie on your back with knees bent, feet flat',
      'Flatten your lower back against the floor',
      'Tighten abdominal muscles',
      'Hold for 5 seconds',
      'Relax and repeat',
    ],
    sets: '2',
    reps: '10-15',
    frequency: 'Twice daily',
    category: 'Lower Back & Hip',
  },
  {
    id: 'ex-6',
    name: 'Ankle Circles',
    description: 'Improve ankle mobility and reduce stiffness.',
    instructions: [
      'Sit with leg extended or elevated',
      'Rotate ankle in circular motion',
      'Make 10 circles clockwise',
      'Make 10 circles counterclockwise',
      'Repeat with other ankle',
    ],
    reps: '10 each direction',
    frequency: '3 times daily',
    category: 'Ankle & Foot',
  },
  {
    id: 'ex-7',
    name: 'Wall Push-ups',
    description: 'Build upper body strength with less strain on joints.',
    instructions: [
      'Stand arm\'s length from a wall',
      'Place palms flat against wall at shoulder height',
      'Bend elbows and lower chest toward wall',
      'Push back to starting position',
      'Keep body straight throughout',
    ],
    sets: '2-3',
    reps: '10-15',
    frequency: 'Once daily',
    category: 'Upper Body',
  },
  {
    id: 'ex-8',
    name: 'Seated Marching',
    description: 'Improve hip mobility and core stability.',
    instructions: [
      'Sit tall in a chair',
      'Lift one knee toward chest',
      'Lower and alternate with other leg',
      'Keep movements controlled',
      'Maintain good posture throughout',
    ],
    sets: '2',
    reps: '20 (10 per leg)',
    frequency: 'Twice daily',
    category: 'Lower Back & Hip',
  },
  {
    id: 'ex-9',
    name: 'Wrist Flexor Stretch',
    description: 'Relieve wrist and forearm tension.',
    instructions: [
      'Extend arm straight out, palm up',
      'Gently pull fingers back toward body with other hand',
      'Hold for 15-30 seconds',
      'Switch arms and repeat',
    ],
    duration: '15-30 seconds',
    reps: '2 per arm',
    frequency: 'Every 2-3 hours during work',
    category: 'Wrist & Hand',
  },
  {
    id: 'ex-10',
    name: 'Standing Calf Raises',
    description: 'Strengthen calf muscles and improve balance.',
    instructions: [
      'Stand with feet hip-width apart',
      'Rise up onto toes',
      'Hold for 2-3 seconds',
      'Lower heels back down slowly',
      'Use wall or chair for balance if needed',
    ],
    sets: '2-3',
    reps: '15-20',
    frequency: 'Once daily',
    category: 'Ankle & Foot',
  },
];

// Demo clients with assigned exercises
export const CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'John Smith',
    email: 'patient@example.com',
    phone: '(555) 123-4567',
    dateOfBirth: '1965-03-15',
    condition: 'Lower back pain, limited mobility',
    assignedExercises: [
      {
        id: 'assign-1',
        exerciseId: 'ex-5',
        clientId: 'client-1',
        assignedDate: '2024-03-01',
        dueDate: '2024-03-15',
        notes: 'Focus on controlled breathing while doing these. Stop if you feel sharp pain.',
        completed: false,
        exercise: EXERCISES.find(e => e.id === 'ex-5')!,
      },
      {
        id: 'assign-2',
        exerciseId: 'ex-4',
        clientId: 'client-1',
        assignedDate: '2024-03-01',
        dueDate: '2024-03-15',
        notes: 'Do not bounce during the stretch. Hold steady.',
        completed: true,
        completedDate: '2024-03-02',
        exercise: EXERCISES.find(e => e.id === 'ex-4')!,
      },
      {
        id: 'assign-3',
        exerciseId: 'ex-8',
        clientId: 'client-1',
        assignedDate: '2024-03-01',
        dueDate: '2024-03-15',
        notes: 'Keep your back straight throughout the exercise.',
        completed: false,
        exercise: EXERCISES.find(e => e.id === 'ex-8')!,
      },
    ],
  },
  {
    id: 'client-2',
    name: 'Mary Johnson',
    email: 'mary@example.com',
    phone: '(555) 987-6543',
    dateOfBirth: '1958-07-22',
    condition: 'Neck stiffness, shoulder strain',
    assignedExercises: [
      {
        id: 'assign-4',
        exerciseId: 'ex-1',
        clientId: 'client-2',
        assignedDate: '2024-03-01',
        dueDate: '2024-03-10',
        notes: 'Very gentle stretches. Do not force the movement.',
        completed: false,
        exercise: EXERCISES.find(e => e.id === 'ex-1')!,
      },
      {
        id: 'assign-5',
        exerciseId: 'ex-2',
        clientId: 'client-2',
        assignedDate: '2024-03-01',
        dueDate: '2024-03-10',
        notes: 'Good to do during work breaks.',
        completed: false,
        exercise: EXERCISES.find(e => e.id === 'ex-2')!,
      },
    ],
  },
];

// Helper functions
export function getClientById(id: string): Client | undefined {
  return CLIENTS.find(c => c.id === id);
}

export function getClientByEmail(email: string): Client | undefined {
  return CLIENTS.find(c => c.email.toLowerCase() === email.toLowerCase());
}

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find(e => e.id === id);
}

export function getExercisesByCategory(category: string): Exercise[] {
  return EXERCISES.filter(e => e.category === category);
}

export function getAllCategories(): string[] {
  return [...new Set(EXERCISES.map(e => e.category))];
}
