import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ChevronRight, Heart, LogOut, Phone, User, Users } from 'lucide-react';
import { ExerciseRoutine } from '@/components/ExerciseRoutine';
import { PainCheckIn } from '@/components/PainCheckIn';
import { PatientNavigation, type PatientView } from '@/components/PatientNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { getClientByEmail } from '@/data/exercises';
import { ConsentManager } from '@/services/ConsentManager';
import { getPainEntries, type PainEntry } from '@/services/PatientProgress';
import { ProfileManager } from '@/services/ProfileManager';
import type { ExerciseAssignment } from '@/types/exercise';

const viewHeadings: Record<PatientView, { title: string; description: string }> = {
  home: { title: 'Welcome back', description: 'Choose one simple next step.' },
  exercises: { title: 'My Exercises', description: 'Work through one exercise at a time.' },
  pain: { title: 'Pain Check-In', description: 'Tell us how you feel today.' },
  progress: { title: 'My Progress', description: 'Small improvements are worth noticing.' },
  consents: { title: 'My Consents', description: 'Review your choices at any time.' },
  help: { title: 'Help and Caregiver Mode', description: 'Get support without taking over your care.' },
};

const functionalGoals = [
  'Picking up a grandchild with more confidence',
  'Kneeling to garden more comfortably',
  'Completing a daily task with less pain',
];

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const client = user ? getClientByEmail(user.email) : undefined;
  const profile = user ? ProfileManager.get(user.id) : null;
  const [activeView, setActiveView] = useState<PatientView>('home');
  const [routineActive, setRoutineActive] = useState(false);
  const [caregiverMode, setCaregiverMode] = useState(profile?.role === 'caregiver');
  const [assignments, setAssignments] = useState(() => client?.assignedExercises ?? []);
  const [painEntries, setPainEntries] = useState<PainEntry[]>(() => user ? getPainEntries(user.id) : []);
  const completed = assignments.filter((item) => item.completed).length;
  const latestPain = painEntries.at(-1)?.score;
  const language = profile?.language ?? 'bilingual';

  const sortedAssignments = useMemo(() => {
    if (!profile) return assignments;
    return [...assignments].sort((a, b) =>
      Number(b.exercise.conditionCategory === profile.conditionFocus) -
      Number(a.exercise.conditionCategory === profile.conditionFocus),
    );
  }, [assignments, profile]);

  if (!user || !client) return null;

  const completeExercise = (assignment: ExerciseAssignment) => {
    setAssignments((current) => current.map((item) =>
      item.id === assignment.id ? { ...item, completed: true, completedDate: new Date().toISOString() } : item,
    ));
  };

  const selectView = (view: PatientView) => {
    setRoutineActive(false);
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-24 text-slate-950 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-[#2459D3]"><User aria-hidden="true" size={19} /></span>
            <div><p className="font-semibold">{client.name}</p><p className="text-xs text-slate-500">My movement plan</p></div>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            aria-label="Sign out"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
          >
            <LogOut aria-hidden="true" size={20} /><span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {!routineActive ? <PatientNavigation active={activeView} onChange={selectView} /> : null}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        {routineActive ? (
          <ExerciseRoutine
            assignments={sortedAssignments}
            language={language}
            userId={user.id}
            caregiverMode={caregiverMode}
            painEntries={painEntries}
            onPainSaved={(entry) => setPainEntries((current) => [...current, entry])}
            onComplete={completeExercise}
            onExit={() => setRoutineActive(false)}
          />
        ) : (
          <>
            <header className="mb-7">
              <h1 className="text-3xl font-semibold tracking-[-0.025em]">{viewHeadings[activeView].title}</h1>
              <p className="mt-2 text-base text-slate-500">{viewHeadings[activeView].description}</p>
            </header>
            {activeView === 'home' ? (
              <HomeView
                completed={completed}
                total={assignments.length}
                latestPain={latestPain}
                caregiverMode={caregiverMode}
                onStart={() => setRoutineActive(true)}
                onNavigate={selectView}
              />
            ) : null}
            {activeView === 'exercises' ? (
              <ExercisesView assignments={sortedAssignments} language={language} onStart={() => setRoutineActive(true)} />
            ) : null}
            {activeView === 'pain' ? (
              <div className="max-w-2xl">
                <PainSafety />
                <div className="surface-card mt-5 p-5 sm:p-7">
                  <PainCheckIn userId={user.id} existingEntries={painEntries} onSaved={(entry) => setPainEntries((current) => [...current, entry])} />
                </div>
              </div>
            ) : null}
            {activeView === 'progress' ? <ProgressView completed={completed} total={assignments.length} painEntries={painEntries} /> : null}
            {activeView === 'consents' ? <ConsentsView userId={user.id} dryNeedling={client.dryNeedlingAssigned ?? false} /> : null}
            {activeView === 'help' ? (
              <HelpView caregiverMode={caregiverMode} onToggle={() => setCaregiverMode((value) => !value)} />
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}

function HomeView({ completed, total, latestPain, caregiverMode, onStart, onNavigate }: {
  completed: number;
  total: number;
  latestPain?: number;
  caregiverMode: boolean;
  onStart: () => void;
  onNavigate: (view: PatientView) => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <section className="surface-card relative overflow-hidden p-6 sm:p-8">
        <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-indigo-100/60 blur-3xl" aria-hidden="true" />
        {caregiverMode ? <p className="relative mb-5 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-800"><Users aria-hidden="true" size={15} /> Caregiver mode on</p> : null}
        <p className="eyebrow relative">Today’s plan</p>
        <h2 className="relative mt-3 text-2xl font-semibold tracking-tight">Complete your movement routine</h2>
        <p className="relative mt-3 max-w-xl text-base leading-relaxed text-slate-600">{completed} of {total} exercises checked off. Your daily goal is two comfortable routines.</p>
        <button onClick={onStart} className="primary-action relative mt-7">Start routine</button>
      </section>
      <div className="grid gap-4">
        <QuickLink title="Check my pain" detail={latestPain === undefined ? 'No pain score today' : `Last score: ${latestPain} out of 10`} onClick={() => onNavigate('pain')} />
        <QuickLink title="See my progress" detail="Notice everyday improvements" onClick={() => onNavigate('progress')} />
        <section className="surface-card p-5">
          <div className="flex gap-3"><Heart className="shrink-0 text-rose-500" size={20} aria-hidden="true" /><div><h2 className="font-semibold">Your real-life goal</h2><p className="mt-1 text-sm text-slate-600">{functionalGoals[completed % functionalGoals.length]}</p></div></div>
        </section>
      </div>
    </div>
  );
}

function ExercisesView({ assignments, language, onStart }: {
  assignments: ExerciseAssignment[];
  language: 'english' | 'spanish' | 'bilingual';
  onStart: () => void;
}) {
  return (
    <div className="max-w-3xl">
      <button onClick={onStart} className="primary-action">Start step-by-step routine</button>
      <div className="mt-5 space-y-3">
        {assignments.map((assignment, index) => (
          <article key={assignment.id} className="surface-card flex min-h-20 items-center gap-4 p-5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-sm font-semibold text-[#2459D3]">{index + 1}</span>
            <div className="flex-1">
              <h2 className="font-semibold">{language === 'spanish' ? assignment.exercise.spanishName : assignment.exercise.name}</h2>
              {language === 'bilingual' ? <p lang="es" className="mt-1 font-semibold text-slate-700">{assignment.exercise.spanishName}</p> : null}
              <p className="mt-1 text-slate-600">{assignment.exercise.sets} sets · {assignment.exercise.reps} reps</p>
            </div>
            {assignment.completed ? <CheckCircle2 className="shrink-0 text-emerald-700" aria-label="Completed" /> : <ChevronRight className="shrink-0 text-slate-500" aria-hidden="true" />}
          </article>
        ))}
      </div>
    </div>
  );
}

function PainSafety() {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-amber-950">
      <div className="flex gap-3"><AlertTriangle className="mt-0.5 shrink-0" size={20} aria-hidden="true" /><div><h2 className="font-semibold">Keep exercise discomfort at 3 out of 10 or lower.</h2><p className="mt-1 text-sm leading-relaxed">Pause above 3. If pain continues, contact your clinician. For pain at 9 or 10, contact your clinician promptly.</p></div></div>
    </section>
  );
}

function ProgressView({ completed, total, painEntries }: { completed: number; total: number; painEntries: PainEntry[] }) {
  const percentage = total ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="grid max-w-4xl gap-5 sm:grid-cols-2">
      <section className="surface-card p-6">
        <p className="text-sm font-medium text-slate-500">Routine completion</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-[#2459D3]">{completed} of {total}</p>
        <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label="Exercise completion" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-blue-700" style={{ width: `${percentage}%` }} />
        </div>
        <p className="mt-4 text-lg text-slate-700">No punishment and no lost progress. Come back when you are ready.</p>
      </section>
      <section className="surface-card p-6">
        <p className="text-sm font-medium text-slate-500">Recent pain check-ins</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{painEntries.length}</p>
        <p className="mt-4 text-lg text-slate-700">{painEntries.length ? `Latest score: ${painEntries.at(-1)?.score} out of 10.` : 'No scores saved yet.'}</p>
      </section>
      <section className="surface-card p-6 sm:col-span-2">
        <p className="eyebrow">Functional goal</p>
        <h2 className="mt-2 font-semibold text-slate-900">{functionalGoals[completed % functionalGoals.length]}</h2>
      </section>
    </div>
  );
}

function ConsentsView({ userId, dryNeedling }: { userId: string; dryNeedling: boolean }) {
  const [, refresh] = useState(0);
  return (
    <div className="max-w-2xl space-y-4">
      {ConsentManager.documents.map((document) => {
        if (document.type === 'dry-needling' && !dryNeedling) return null;
        const record = ConsentManager.getLatest(userId, document.type);
        return (
          <article key={document.type} className="surface-card p-5">
            <h2 className="font-semibold">{document.title.en}</h2>
            <p className="mt-2 text-sm font-medium text-slate-700">{record?.accepted ? 'Accepted' : record ? 'Declined or withdrawn' : 'Not completed'}</p>
            <p className="mt-1 text-sm text-slate-500">{record?.signedAt ? new Date(record.signedAt).toLocaleString() : 'No date recorded'}</p>
            {document.type === 'ambient-recording' && record?.accepted ? (
              <button onClick={() => { ConsentManager.revoke(userId, document.type); refresh((value) => value + 1); }} className="mt-4 min-h-12 rounded-xl border-2 border-red-600 px-4 font-bold text-red-800">Withdraw recording permission</button>
            ) : null}
          </article>
        );
      })}
      <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Declining or withdrawing audio recording does not affect your treatment. Your clinician can enter notes manually.</p>
    </div>
  );
}

function HelpView({ caregiverMode, onToggle }: { caregiverMode: boolean; onToggle: () => void }) {
  return (
    <div className="grid max-w-4xl gap-5 md:grid-cols-2">
      <section className="surface-card p-6">
        <Users className="text-violet-700" size={36} aria-hidden="true" />
        <h2 className="mt-4 text-xl font-semibold">Caregiver mode</h2>
        <p className="mt-3 leading-relaxed text-slate-600">Shows helper reminders during exercises. The patient remains in control and can pause at any time.</p>
        <button onClick={onToggle} aria-pressed={caregiverMode} className="primary-action mt-6">
          {caregiverMode ? 'Turn caregiver mode off' : 'Turn caregiver mode on'}
        </button>
      </section>
      <section className="surface-card p-6">
        <Phone className="text-blue-700" size={36} aria-hidden="true" />
        <h2 className="mt-4 text-xl font-semibold">Need more help?</h2>
        <p className="mt-3 text-slate-600">If instructions are unclear or pain continues, pause and contact your clinic.</p>
        <a href="tel:+19075550123" className="secondary-action mt-6">Call the clinic</a>
      </section>
    </div>
  );
}

function QuickLink({ title, detail, onClick }: { title: string; detail: string; onClick: () => void }) {
  return <button onClick={onClick} className="surface-card flex min-h-20 w-full items-center p-5 text-left transition-[border-color,box-shadow] duration-150 hover:border-slate-300 hover:shadow-md"><span className="flex-1"><span className="block font-semibold">{title}</span><span className="mt-1 block text-sm text-slate-500">{detail}</span></span><ChevronRight className="text-slate-400" size={18} aria-hidden="true" /></button>;
}
