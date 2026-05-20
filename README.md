# ZONA PT

ZONA PT is a physical therapy support app designed to help therapists guide patients through assigned recovery exercises in a clear, approachable, and patient friendly way.

The app gives patients a simple care plan dashboard where they can view their assigned exercises, review step by step instructions, understand how often to complete each movement, see therapist notes, and track their progress. It also includes an admin dashboard where a physical therapist can view clients, assign exercises, add due dates, and monitor completion.

## Project Purpose

Recovery does not stop when a physical therapy appointment ends. Many patients leave appointments with printed instructions, videos, or verbal guidance, but still struggle to remember what to do, when to do it, and how often to complete each exercise.

ZONA PT is intended to make recovery guidance easier to follow by giving patients one organized place to access their care plan.

The long term goal is to support bilingual patient education in English and Spanish so more patients can feel confident following their recovery plan at home.

## Current App Progress

The current version includes:

- A public landing page for the physical therapy practice
- A client portal button that routes users to login
- Demo authentication for therapist and patient users
- Protected routes for client and admin dashboards
- A patient dashboard with assigned exercises
- Progress tracking for completed exercises
- Exercise detail popups with instructions, sets, reps, duration, and frequency
- Therapist notes for individual assignments
- Due dates for assigned exercises
- An admin dashboard for managing clients
- Client search
- Exercise assignment workflow
- Demo exercise data for common recovery categories

## Existing Exercise Examples

The app currently includes sample exercises such as:

- Neck Stretches
- Shoulder Rolls
- Knee Extensions
- Hamstring Stretch
- Pelvic Tilts
- Ankle Circles
- Wall Push Ups
- Seated Marching
- Wrist Flexor Stretch
- Standing Calf Raises

Each exercise can include:

- Name
- Description
- Step by step instructions
- Duration
- Repetitions
- Sets
- Frequency
- Category
- Optional image or video URL

## Intended Users

ZONA PT is designed for:

- Physical therapists
- Physical therapy assistants
- Patients completing recovery exercises at home
- Clinics that want to improve patient education
- English and Spanish speaking patients who need clear recovery guidance

## Key User Roles

### Patient

Patients can log in to view their personal care plan. They can see assigned exercises, read instructions, review therapist notes, check due dates, and mark exercises as complete.

### Physical Therapist

Therapists can log in to an admin dashboard where they can view clients, search client records, assign exercises, add notes, set due dates, and monitor patient progress.

## Demo Login Credentials

This project currently uses demo users for testing.

### Admin

```txt
Email: admin@zonapt.com
Password: admin123
```

### Patient One

```txt
Email: patient@example.com
Password: patient123
```

### Patient Two

```txt
Email: mary@example.com
Password: mary123
```

These credentials are for demo purposes only and should be replaced with secure authentication before production use.

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Radix UI
- GSAP
- Lucide React
- React Hook Form
- Zod

## Getting Started

### Prerequisites

Make sure you have Node.js and npm installed.

### Installation

```bash
git clone https://github.com/beamendivil/ZONA-PT.git
cd ZONA-PT
npm install
```

### Run the Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Run Linting

```bash
npm run lint
```

## Current Routes

```txt
/             Landing page
/login        Login page
/dashboard    Patient dashboard
/admin        Physical therapist admin dashboard
```

The dashboard and admin routes are protected. Patients are routed to the patient dashboard, while admin users can access the therapist dashboard.

## Project Structure

```txt
ZONA-PT/
├── src/
│   ├── components/
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── data/
│   │   └── exercises.ts
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ClientDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── sections/
│   ├── types/
│   │   └── exercise.ts
│   ├── App.tsx
│   └── index.css
├── package.json
└── README.md
```

## Core Data Models

### Exercise

```ts
interface Exercise {
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
```

### Exercise Assignment

```ts
interface ExerciseAssignment {
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
```

### Client

```ts
interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  condition?: string;
  assignedExercises: ExerciseAssignment[];
}
```

## Bilingual Vision

The app is intended to become bilingual so patients can switch between English and Spanish instructions.

Planned bilingual improvements include:

- English and Spanish language toggle
- Spanish exercise names
- Spanish exercise descriptions
- Spanish step by step instructions
- Spanish therapist notes
- Spanish safety guidance
- Bilingual patient dashboard labels
- Bilingual admin workflow support

Example future structure:

```ts
{
  name: {
    en: "Knee Extensions",
    es: "Extensiones de rodilla"
  },
  description: {
    en: "Strengthen the quadriceps muscles to support the knee joint.",
    es: "Fortalece los músculos del cuádriceps para apoyar la articulación de la rodilla."
  },
  instructions: {
    en: [
      "Sit in a chair with feet flat on the floor",
      "Slowly straighten one leg",
      "Hold for 5 seconds",
      "Lower leg back down slowly"
    ],
    es: [
      "Siéntese en una silla con los pies apoyados en el piso",
      "Estire lentamente una pierna",
      "Mantenga la posición por 5 segundos",
      "Baje la pierna lentamente"
    ]
  }
}
```

## Future Features

Planned improvements may include:

- Persistent database storage
- Secure user authentication
- Patient profile creation
- Therapist generated care plans
- Bilingual exercise library
- Exercise images and video demonstrations
- Pain level check ins
- Daily reminders
- Progress history
- Mobile responsive improvements
- Calendar based recovery scheduling
- Clinic branding options
- Patient accessibility settings
- Printable care plan summaries

## Safety Disclaimer

ZONA PT is intended to support physical therapy education and at home exercise guidance. It is not a substitute for professional medical advice, diagnosis, or treatment.

Patients should follow the instructions provided by their licensed physical therapist or healthcare provider. If a patient experiences sharp pain, dizziness, numbness, swelling, or worsening symptoms, they should stop the exercise and contact their provider.

## Why This App Matters

Physical therapy can feel overwhelming when patients are expected to remember every instruction on their own. ZONA PT helps make recovery more approachable by organizing exercise guidance, frequency, due dates, and therapist notes in one place.

The goal is to help patients feel supported between appointments and help therapists communicate care plans more clearly.

## Author

Created by Bea Mendivil.

## License

This project is currently for educational and development purposes. Add a license before public production use.
