import { useState } from 'react';
import { CheckCircle2, ChevronDown } from 'lucide-react';
import type { IntakeFormDefinition, IntakeFormSubmission } from '@/types/intake';
import type { LanguageMode } from '@/types/exercise';

interface IntakeFormStepProps {
  form: IntakeFormDefinition;
  language: LanguageMode;
  existing?: IntakeFormSubmission;
  defaultSignature: string;
  onComplete: (submission: IntakeFormSubmission) => void;
  onSaveProgress: (submission: IntakeFormSubmission) => void;
  onBack: () => void;
}

export function IntakeFormStep({
  form,
  language,
  existing,
  defaultSignature,
  onComplete,
  onSaveProgress,
  onBack,
}: IntakeFormStepProps) {
  const [answers, setAnswers] = useState<Record<string, string | boolean>>(existing?.answers ?? {});
  const [signedBy, setSignedBy] = useState(existing?.signedBy ?? defaultSignature);
  const [choice, setChoice] = useState<'accept' | 'decline' | ''>(
    existing?.completed
      ? (existing.accepted ? 'accept' : 'decline')
      : existing?.answers.__consentChoice === 'accept' || existing?.answers.__consentChoice === 'decline'
        ? existing.answers.__consentChoice
        : form.kind === 'questionnaire' ? 'accept' : '',
  );
  const [error, setError] = useState('');
  const useSpanish = language === 'spanish';
  const saveProgress = (
    nextAnswers = answers,
    nextSignedBy = signedBy,
    nextChoice = choice,
  ) => onSaveProgress({
    formId: form.id,
    version: form.version,
    answers: { ...nextAnswers, __consentChoice: nextChoice },
    signedBy: nextSignedBy,
    accepted: nextChoice !== 'decline',
    completed: false,
    completedAt: existing?.completedAt ?? '',
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const missingField = form.fields.find((field) => field.required && !answers[field.id]?.toString().trim());
    if (missingField) {
      setError(useSpanish ? 'Complete todos los campos obligatorios.' : 'Please complete all required fields.');
      return;
    }
    if (!signedBy.trim()) {
      setError(useSpanish ? 'Escriba su nombre para firmar.' : 'Type your name to sign.');
      return;
    }
    if (form.kind === 'consent' && !choice) {
      setError(useSpanish ? 'Seleccione aceptar o rechazar.' : 'Choose accept or decline.');
      return;
    }
    if (form.required && choice === 'decline') {
      setError(useSpanish ? 'Este formulario es obligatorio para continuar.' : 'This form must be accepted to continue.');
      return;
    }

    const submittedAnswers = { ...answers };
    delete submittedAnswers.__consentChoice;
    onComplete({
      formId: form.id,
      version: form.version,
      answers: submittedAnswers,
      signedBy: signedBy.trim(),
      accepted: choice !== 'decline',
      completed: true,
      completedAt: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={submit} className="surface-card p-6 sm:p-8">
      <p className="eyebrow">{form.kind === 'consent' ? 'Consent form' : 'Intake form'}</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
        {useSpanish ? form.title.es : form.title.en}
      </h1>
      {language === 'bilingual' ? <p lang="es" className="mt-1 font-medium text-slate-500">{form.title.es}</p> : null}
      <p className="mt-5 leading-relaxed text-slate-600">{useSpanish ? form.summary.es : form.summary.en}</p>
      {language === 'bilingual' ? <p lang="es" className="mt-2 text-sm leading-relaxed text-slate-500">{form.summary.es}</p> : null}

      <details className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <summary className="flex min-h-7 cursor-pointer list-none items-center justify-between font-medium text-slate-800">
          Read full document / Leer documento completo
          <ChevronDown size={18} aria-hidden="true" />
        </summary>
        <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 text-sm leading-relaxed text-slate-600">
          {(useSpanish ? form.fullText.es : form.fullText.en).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {language === 'bilingual' ? form.fullText.es.map((paragraph) => <p lang="es" key={paragraph}>{paragraph}</p>) : null}
        </div>
      </details>

      {form.fields.length > 0 ? (
        <div className="mt-6 space-y-5">
          {form.fields.map((field) => (
            <IntakeFieldControl
              key={field.id}
              field={field}
              language={language}
              value={answers[field.id] ?? ''}
              onChange={(value) => {
                const next = { ...answers, [field.id]: value };
                setAnswers(next);
                saveProgress(next);
              }}
            />
          ))}
        </div>
      ) : null}

      {form.kind === 'consent' ? (
        <fieldset className="mt-6">
          <legend className="font-medium text-slate-900">Your choice / Su elección</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <ChoiceCard checked={choice === 'accept'} label="I accept / Acepto" onChange={() => { setChoice('accept'); saveProgress(answers, signedBy, 'accept'); }} />
            <ChoiceCard checked={choice === 'decline'} label="I decline / No acepto" onChange={() => { setChoice('decline'); saveProgress(answers, signedBy, 'decline'); }} />
          </div>
          {!form.required ? <p className="mt-2 text-sm text-slate-500">Declining this optional consent will not prevent care.</p> : null}
        </fieldset>
      ) : null}

      <label className="mt-6 block font-medium text-slate-900">
        Type your full name to sign / Escriba su nombre completo
        <input
          required
          value={signedBy}
          onChange={(event) => {
            setSignedBy(event.target.value);
            saveProgress(answers, event.target.value);
          }}
          className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 font-serif text-lg focus:border-[#2459D3] focus:outline-none"
        />
      </label>
      <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
        <CheckCircle2 size={14} aria-hidden="true" /> Version {form.version}. A timestamp is added when you continue.
      </p>

      {error ? <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-800">{error}</p> : null}

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button type="button" onClick={onBack} className="secondary-action">Back</button>
        <button type="submit" className="primary-action">Save and continue</button>
      </div>
    </form>
  );
}

function IntakeFieldControl({ field, language, value, onChange }: {
  field: IntakeFormDefinition['fields'][number];
  language: LanguageMode;
  value: string | boolean;
  onChange: (value: string | boolean) => void;
}) {
  const label = language === 'spanish' ? field.label.es : field.label.en;
  const sharedClass = 'mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 focus:border-[#2459D3] focus:outline-none';

  if (field.type === 'radio') {
    return (
      <fieldset>
        <legend className="font-medium text-slate-900">{label}{field.required ? ' *' : ''}</legend>
        <div className="mt-2 flex gap-3">
          {field.options?.map((option) => (
            <ChoiceCard
              key={option.value}
              checked={value === option.value}
              label={language === 'spanish' ? option.label.es : option.label.en}
              onChange={() => onChange(option.value)}
            />
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <label className="block font-medium text-slate-900">
      {label}{field.required ? ' *' : ''}
      {field.type === 'textarea' ? (
        <textarea value={String(value)} onChange={(event) => onChange(event.target.value)} rows={3} className={`${sharedClass} py-3`} />
      ) : (
        <input
          type={field.type}
          min={field.id === 'painScore' ? 0 : undefined}
          max={field.id === 'painScore' ? 10 : undefined}
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          className={sharedClass}
        />
      )}
    </label>
  );
}

function ChoiceCard({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <label className={`flex min-h-12 flex-1 cursor-pointer items-center gap-3 rounded-xl border px-4 transition-colors ${checked ? 'border-[#2459D3] bg-indigo-50' : 'border-slate-200 bg-white'}`}>
      <input type="radio" checked={checked} onChange={onChange} className="h-4 w-4" />
      <span className="font-medium text-slate-800">{label}</span>
    </label>
  );
}
