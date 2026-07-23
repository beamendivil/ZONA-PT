import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { hasTwoDaySeverePain, savePainEntry, type PainEntry } from '@/services/PatientProgress';

interface PainCheckInProps {
  userId: string;
  exerciseId?: string;
  existingEntries: PainEntry[];
  onSaved: (entry: PainEntry) => void;
}

export function PainCheckIn({ userId, exerciseId, existingEntries, onSaved }: PainCheckInProps) {
  const [pain, setPain] = useState(0);
  const [saved, setSaved] = useState(false);
  const strongAlert = hasTwoDaySeverePain(existingEntries);

  const save = () => {
    const entry = { score: pain, recordedAt: new Date().toISOString(), exerciseId };
    savePainEntry(userId, entry);
    onSaved(entry);
    setSaved(true);
  };

  return (
    <section className="rounded-2xl border border-slate-200 p-4">
      <h3 className="text-lg font-bold text-slate-900">Pain check / Nivel de dolor</h3>
      <p className="mt-1 text-lg text-slate-700">0 means no pain. 10 means the worst pain.</p>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Pain score from 0 to 10">
        {Array.from({ length: 11 }, (_, score) => (
          <button
            type="button"
            key={score}
            onClick={() => {
              setPain(score);
              setSaved(false);
            }}
            aria-pressed={pain === score}
            className={`h-12 w-12 rounded-full text-lg font-bold focus-visible:outline focus-visible:outline-4 focus-visible:outline-blue-700 ${
              pain === score ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'
            }`}
          >
            {score}
          </button>
        ))}
      </div>
      {pain > 3 ? (
        <div role="alert" className="mt-4 flex gap-2 rounded-xl bg-red-50 p-3 text-red-800">
          <AlertTriangle className="mt-0.5 shrink-0" size={20} />
          <p>
            <strong>{pain >= 9 ? 'Contact your clinician promptly.' : 'Stop and pause your routine.'}</strong>{' '}
            {pain >= 9
              ? 'Pain at 9 or 10 needs urgent guidance from your care team.'
              : 'Your pain is above 3 out of 10. Contact your clinician if pain continues.'}
          </p>
        </div>
      ) : null}
      {strongAlert ? (
        <div role="alert" className="mt-3 rounded-xl border-2 border-red-500 bg-red-50 p-3 font-semibold text-red-900">
          You recorded pain of 9 or higher on two days in a row. Please contact your clinician.
        </div>
      ) : null}
      <button type="button" onClick={save} className="mt-4 min-h-14 w-full rounded-xl bg-blue-700 text-lg font-bold text-white">
        {saved ? 'Pain score saved' : 'Save pain score'}
      </button>
    </section>
  );
}
