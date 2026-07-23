import { useState } from 'react';
import { ArrowLeft, CalendarCheck, LockKeyhole } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IntakeFormStep } from '@/components/IntakeFormStep';
import { IntakeSchedulingStep } from '@/components/IntakeSchedulingStep';
import { IntakeManager } from '@/services/IntakeManager';
import type { IntakeDraft, IntakeProfile } from '@/types/intake';

export default function ClientPortalPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<IntakeDraft>(() =>
    IntakeManager.getLatestDraft() ?? IntakeManager.createDraft(),
  );
  const forms = IntakeManager.getApplicableForms(draft);
  const maxStep = forms.length + 1;
  const step = Math.min(draft.currentStep, maxStep);
  const currentForm = step > 0 && step <= forms.length ? forms[step - 1] : undefined;

  const saveDraft = (next: IntakeDraft) => {
    const saved = IntakeManager.save(next);
    setDraft(saved);
  };

  const goToStep = (nextStep: number) => saveDraft({ ...draft, currentStep: nextStep });

  if (draft.appointment) {
    const date = new Date(draft.appointment.startsAt);
    return (
      <PortalShell step={maxStep + 1} total={maxStep + 1}>
        <section className="surface-card p-7 text-center sm:p-10">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><CalendarCheck size={28} /></span>
          <p className="eyebrow mt-6">Appointment confirmed</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">You’re all set, {draft.profile.legalName.split(' ')[0]}.</h1>
          <p className="mt-3 text-slate-600">Your initial assessment is scheduled for:</p>
          <div className="mx-auto mt-6 max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="font-semibold">{date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
            <p className="mt-1 text-slate-600">{date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} · {draft.appointment.format === 'virtual' ? 'Virtual visit' : 'In-person visit'}</p>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-slate-500">This demo saves confirmation in this browser. The clinic will provide secure patient-app access separately.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={() => navigate('/')} className="secondary-action">Return home</button>
            <button onClick={() => navigate('/login')} className="primary-action">Existing client login</button>
          </div>
        </section>
      </PortalShell>
    );
  }

  return (
    <PortalShell step={step + 1} total={maxStep + 1}>
      {step === 0 ? (
        <WelcomeStep
          profile={draft.profile}
          onCancel={() => navigate('/')}
          onDraftChange={(profile) => saveDraft({ ...draft, profile })}
          onContinue={(profile) => saveDraft({ ...draft, profile, currentStep: 1 })}
        />
      ) : null}
      {currentForm ? (
        <IntakeFormStep
          key={currentForm.id}
          form={currentForm}
          language={draft.profile.preferredLanguage}
          existing={draft.submissions[currentForm.id]}
          defaultSignature={draft.profile.legalName}
          onBack={() => goToStep(step - 1)}
          onSaveProgress={(submission) => saveDraft({
            ...draft,
            submissions: { ...draft.submissions, [currentForm.id]: submission },
          })}
          onComplete={(submission) => saveDraft({
            ...draft,
            submissions: { ...draft.submissions, [currentForm.id]: submission },
            currentStep: step + 1,
          })}
        />
      ) : null}
      {step === forms.length + 1 ? (
        IntakeManager.isReadyToSchedule(draft) ? (
          <IntakeSchedulingStep
            draft={draft}
            onBack={() => goToStep(step - 1)}
            onConfirm={(appointment) => saveDraft({ ...draft, appointment, currentStep: step + 1 })}
          />
        ) : (
          <section className="surface-card p-7">
            <h1 className="text-2xl font-semibold">A few required forms are still missing.</h1>
            <p className="mt-3 text-slate-600">Return to complete them before choosing an appointment.</p>
            <button onClick={() => goToStep(1)} className="primary-action mt-6">Review forms</button>
          </section>
        )
      ) : null}
    </PortalShell>
  );
}

function PortalShell({ step, total, children }: { step: number; total: number; children: React.ReactNode }) {
  const percentage = Math.min(100, Math.round((step / total) * 100));
  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-950">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex min-h-16 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#2459D3] text-sm text-white">Z</span> Zona PT</div>
          <span className="flex items-center gap-2 text-xs font-medium text-slate-500"><LockKeyhole size={14} /> Intake portal</span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500"><span>Step {step} of {total}</span><span>Draft saves automatically</span></div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label="Intake progress" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-[#2459D3] transition-[width] duration-300" style={{ width: `${percentage}%` }} />
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

function WelcomeStep({ profile, onContinue, onCancel, onDraftChange }: {
  profile: IntakeProfile;
  onContinue: (profile: IntakeProfile) => void;
  onCancel: () => void;
  onDraftChange: (profile: IntakeProfile) => void;
}) {
  const [value, setValue] = useState(profile);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onContinue(value);
  };

  const update = <K extends keyof IntakeProfile>(field: K, next: IntakeProfile[K]) =>
    setValue((current) => {
      const updated = { ...current, [field]: next };
      onDraftChange(updated);
      return updated;
    });

  return (
    <form onSubmit={submit} className="surface-card p-6 sm:p-8">
      <button type="button" onClick={onCancel} className="mb-5 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-950"><ArrowLeft size={17} /> Back to website</button>
      <p className="eyebrow">New client intake</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Let’s prepare for your first visit.</h1>
      <p className="mt-3 leading-relaxed text-slate-600">You can stop and return on this device. Your progress will be saved automatically.</p>

      <fieldset className="mt-7">
        <legend className="font-medium">Who is completing these forms?</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <RoleChoice checked={value.completedBy === 'patient'} label="I am the patient" onChange={() => update('completedBy', 'patient')} />
          <RoleChoice checked={value.completedBy === 'caregiver'} label="Caregiver / family helper" onChange={() => update('completedBy', 'caregiver')} />
        </div>
      </fieldset>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <TextField label="Full legal name" value={value.legalName} onChange={(next) => update('legalName', next)} required />
        <TextField label="Date of birth" type="date" value={value.dateOfBirth} onChange={(next) => update('dateOfBirth', next)} required />
        <TextField label="Phone" type="tel" value={value.phone} onChange={(next) => update('phone', next)} required />
        <TextField label="Email" type="email" value={value.email} onChange={(next) => update('email', next)} required />
        <label className="block font-medium text-slate-900">
          Preferred language
          <select value={value.preferredLanguage} onChange={(event) => update('preferredLanguage', event.target.value as IntakeProfile['preferredLanguage'])} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4">
            <option value="english">English</option><option value="spanish">Español</option><option value="bilingual">English + Español</option>
          </select>
        </label>
        <div />
        <TextField label="Emergency contact name" value={value.emergencyContactName} onChange={(next) => update('emergencyContactName', next)} required />
        <TextField label="Emergency contact phone" type="tel" value={value.emergencyContactPhone} onChange={(next) => update('emergencyContactPhone', next)} required />
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <input type="checkbox" checked={value.requestingDryNeedling} onChange={(event) => update('requestingDryNeedling', event.target.checked)} className="mt-0.5 h-5 w-5" />
        <span><span className="block font-medium">Dry needling was assigned or requested</span><span className="mt-1 block text-sm text-slate-500">This adds a separate consent form.</span></span>
      </label>

      <button className="primary-action mt-8 w-full">Save and begin forms</button>
    </form>
  );
}

function TextField({ label, value, onChange, type = 'text', required }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block font-medium text-slate-900">
      {label}{required ? ' *' : ''}
      <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 focus:border-[#2459D3] focus:outline-none" />
    </label>
  );
}

function RoleChoice({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return <label className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-4 ${checked ? 'border-[#2459D3] bg-indigo-50' : 'border-slate-200'}`}><input type="radio" checked={checked} onChange={onChange} /><span className="font-medium">{label}</span></label>;
}
