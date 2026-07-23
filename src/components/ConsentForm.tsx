import { useState } from 'react';
import type { ConsentDocument, ConsentRecord } from '@/types/consent';

interface ConsentFormProps {
  document: ConsentDocument;
  initialRecord?: ConsentRecord;
  showCaregiver?: boolean;
  onSubmit: (record: ConsentRecord) => void;
}

export function ConsentForm({ document, initialRecord, showCaregiver, onSubmit }: ConsentFormProps) {
  const [fullName, setFullName] = useState(initialRecord?.signedBy ?? '');
  const [signature, setSignature] = useState(initialRecord?.signedBy ?? '');
  const [caregiver, setCaregiver] = useState(initialRecord?.caregiverSignedBy ?? '');
  const [accepted, setAccepted] = useState(initialRecord?.accepted ?? false);
  const [reviewed, setReviewed] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const signedAt = new Date().toISOString();
    onSubmit({
      consentType: document.type,
      version: document.version,
      accepted,
      signedAt,
      signedBy: signature || fullName,
      caregiverSignedBy: caregiver || undefined,
      revokedAt: null,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="rounded-2xl bg-indigo-50/60 p-5">
        <p className="leading-relaxed text-slate-800">{document.summary.en}</p>
        <p lang="es" className="mt-3 text-sm leading-relaxed text-slate-600">{document.summary.es}</p>
      </div>
      <details className="rounded-2xl border border-slate-300 bg-white p-4">
        <summary className="min-h-11 cursor-pointer text-lg font-bold text-blue-800">
          Read full consent / Leer el consentimiento completo
        </summary>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-lg text-slate-800">
          {document.points.en.map((point) => <li key={point}>{point}</li>)}
        </ul>
        <ul lang="es" className="mt-4 list-disc space-y-2 border-t border-slate-200 pt-4 pl-5 text-lg text-slate-800">
          {document.points.es.map((point) => <li key={point}>{point}</li>)}
        </ul>
      </details>
      <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
        Placeholder document version {document.version}. The clinic must replace this with approved legal language before production.
      </p>
      <label className="block text-base font-semibold text-slate-900">
        Full legal name / Nombre legal completo
        <input required value={fullName} onChange={(event) => setFullName(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 font-normal" />
      </label>
      <label className="block text-base font-semibold text-slate-900">
        Electronic signature / Firma electrónica
        <input
          required
          value={signature}
          onChange={(event) => setSignature(event.target.value)}
          placeholder="Type your full name / Escriba su nombre"
          className="mt-2 min-h-14 w-full rounded-xl border-2 border-slate-300 px-4 font-serif text-xl font-normal"
        />
      </label>
      {showCaregiver ? (
        <label className="block text-base font-semibold text-slate-900">
          Caregiver signature (optional) / Firma del cuidador (opcional)
          <input value={caregiver} onChange={(event) => setCaregiver(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 font-normal" />
        </label>
      ) : null}
      {document.type === 'ambient-recording' ? (
        <fieldset>
          <legend className="mb-2 font-bold">Your choice / Su elección</legend>
          <label className="mr-6 inline-flex min-h-12 items-center gap-2"><input type="radio" checked={accepted} onChange={() => setAccepted(true)} className="h-5 w-5" /> I agree / Acepto</label>
          <label className="inline-flex min-h-12 items-center gap-2"><input type="radio" checked={!accepted} onChange={() => setAccepted(false)} className="h-5 w-5" /> I decline / No acepto</label>
        </fieldset>
      ) : (
        <input type="hidden" value={String(accepted)} />
      )}
      <label className="flex min-h-14 items-start gap-3 rounded-xl border-2 border-slate-300 p-4 text-lg">
        <input
          required
          type="checkbox"
          checked={reviewed}
          onChange={(event) => {
            setReviewed(event.target.checked);
            if (document.type !== 'ambient-recording') setAccepted(event.target.checked);
          }}
          className="mt-1 h-6 w-6"
        />
        <span>I reviewed this consent and confirm my choice. / Revisé este consentimiento y confirmo mi elección.</span>
      </label>
      <button disabled={!reviewed || (!accepted && document.type !== 'ambient-recording')} className="min-h-14 w-full rounded-xl bg-blue-700 text-lg font-bold text-white disabled:opacity-40">
        Save choice / Guardar elección
      </button>
    </form>
  );
}
