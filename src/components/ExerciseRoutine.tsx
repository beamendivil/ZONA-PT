import { useState } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle2, HelpCircle, HeartPulse, Users } from 'lucide-react';
import { CountdownTimer } from '@/components/CountdownTimer';
import { PainCheckIn } from '@/components/PainCheckIn';
import type { PainEntry } from '@/services/PatientProgress';
import type { ExerciseAssignment, LanguageMode } from '@/types/exercise';

interface ExerciseRoutineProps {
  assignments: ExerciseAssignment[];
  language: LanguageMode;
  userId: string;
  caregiverMode: boolean;
  painEntries: PainEntry[];
  onPainSaved: (entry: PainEntry) => void;
  onComplete: (assignment: ExerciseAssignment) => void;
  onExit: () => void;
}

export function ExerciseRoutine({
  assignments,
  language,
  userId,
  caregiverMode,
  painEntries,
  onPainSaved,
  onComplete,
  onExit,
}: ExerciseRoutineProps) {
  const [index, setIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [hurts, setHurts] = useState(false);
  const assignment = assignments[index];

  if (!assignment) {
    return (
      <section className="surface-card mx-auto max-w-2xl p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50"><CheckCircle2 className="text-emerald-600" size={28} /></span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Routine complete</h1>
        <p className="mt-3 text-slate-600">Nice work. Comfortable practice helps everyday movement feel easier.</p>
        <button onClick={onExit} className="primary-action mt-7">Back to my exercises</button>
      </section>
    );
  }

  const exercise = assignment.exercise;
  const progress = ((index + 1) / assignments.length) * 100;
  const goNext = () => {
    onComplete(assignment);
    setShowHelp(false);
    setHurts(false);
    setIndex((value) => value + 1);
  };

  return (
    <section className="mx-auto max-w-2xl">
      <button onClick={onExit} className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-medium text-slate-600 hover:text-slate-950">
        <ArrowLeft aria-hidden="true" /> Back to exercises
      </button>
      <div className="surface-card p-5 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <p className="eyebrow">Exercise {index + 1} of {assignments.length}</p>
          {caregiverMode ? <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800"><Users size={15} /> Helper mode</span> : null}
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label="Routine progress" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={assignments.length}>
          <div className="h-full rounded-full bg-[#2459D3] transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>

        <h1 className="mt-7 text-3xl font-semibold tracking-tight">{language !== 'spanish' ? exercise.name : exercise.spanishName}</h1>
        {language === 'bilingual' ? <p lang="es" className="mt-2 font-medium text-slate-500">{exercise.spanishName}</p> : null}
        <p className="mt-4 leading-relaxed text-slate-600">{exercise.description}</p>

        <div className="mt-7 rounded-2xl bg-slate-50 p-5">
          <h2 className="font-semibold">How to do it</h2>
          <ol className="mt-4 space-y-4">
            {(language === 'spanish' ? exercise.spanishInstructions : exercise.instructions).map((instruction, step) => (
              <li key={instruction} className="flex gap-3 leading-relaxed text-slate-700">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-xs font-semibold text-[#2459D3] shadow-sm">{step + 1}</span>
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold">Form cues</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
            {exercise.formCues.map((cue) => <li key={cue}>{cue}</li>)}
          </ul>
        </div>

        <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm leading-relaxed text-amber-950">
          <AlertTriangle className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
          <p><strong>Stop if pain is more than 3 out of 10.</strong> {exercise.painWarning}</p>
        </div>

        {exercise.holdDurationSeconds ? <div className="mt-5"><CountdownTimer seconds={exercise.holdDurationSeconds} /></div> : null}

        {showHelp ? (
          <div role="status" className="mt-5 rounded-2xl bg-violet-50 p-5 text-sm leading-relaxed text-violet-950">
            <p className="font-semibold">Try this</p>
            <p className="mt-2">{exercise.equipmentSubstitute}</p>
            <p className="mt-2">A caregiver can read each step aloud and stay nearby for balance. If you are still unsure, pause and call your clinic.</p>
          </div>
        ) : null}

        {hurts ? (
          <div className="mt-5">
            <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
              <strong>Routine paused.</strong> Do not push through pain. Save your pain score below.
            </div>
            <PainCheckIn userId={userId} exerciseId={exercise.id} existingEntries={painEntries} onSaved={onPainSaved} />
          </div>
        ) : null}

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button onClick={() => setShowHelp((value) => !value)} className="secondary-action gap-2">
            <HelpCircle aria-hidden="true" /> I need help
          </button>
          <button onClick={() => setHurts(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            <HeartPulse aria-hidden="true" /> This hurts
          </button>
        </div>
        <button disabled={hurts} onClick={goNext} className="primary-action mt-3 w-full disabled:bg-slate-300">
          Done — next exercise
        </button>
      </div>
    </section>
  );
}
