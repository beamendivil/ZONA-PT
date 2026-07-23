import { useEffect, useState } from 'react';
import { AlertCircle, CalendarCheck, CheckCircle2, ChevronDown, ClipboardList } from 'lucide-react';
import { IntakeManager } from '@/services/IntakeManager';
import type { IntakeDraft, IntakeFormId } from '@/types/intake';

export function IntakeDashboardSection() {
  const [intakes, setIntakes] = useState<IntakeDraft[]>(() => IntakeManager.getAll());

  useEffect(() => {
    const refresh = () => setIntakes(IntakeManager.getAll());
    window.addEventListener('zona-intake-change', refresh);
    return () => window.removeEventListener('zona-intake-change', refresh);
  }, []);

  return (
    <section className="info-card mb-8 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Intake queue</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">New clients</h2>
          <p className="mt-1 text-sm text-slate-500">Forms, risk flags, and first assessment scheduling.</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-[#2459D3]">{intakes.length}</span>
      </div>

      {intakes.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
          <ClipboardList className="mx-auto text-slate-400" aria-hidden="true" />
          <p className="mt-3 font-medium text-slate-700">No intake drafts on this device yet.</p>
          <p className="mt-1 text-sm text-slate-500">New client submissions from the intake portal will appear here.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {intakes.map((intake) => <IntakeRow key={intake.id} intake={intake} />)}
        </div>
      )}
    </section>
  );
}

function IntakeRow({ intake }: { intake: IntakeDraft }) {
  const forms = IntakeManager.getApplicableForms(intake);
  const completedCount = forms.filter((form) => intake.submissions[form.id]?.completed).length;
  const missing = IntakeManager.getMissingRequiredForms(intake);
  const pain = intake.submissions['pain-assessment']?.answers.painScore;
  const fell = intake.submissions['fall-history']?.answers.fellPastYear === 'yes';
  const consentForms = forms.filter((form) => form.kind === 'consent');
  const consentComplete = consentForms.filter((form) => intake.submissions[form.id]?.completed).length;

  return (
    <details className="group rounded-2xl border border-slate-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center gap-4 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 font-semibold text-[#2459D3]">
          {intake.profile.legalName ? intake.profile.legalName.charAt(0).toUpperCase() : 'N'}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-slate-950">{intake.profile.legalName || 'Unnamed draft'}</span>
          <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
            <span>{completedCount}/{forms.length} forms</span>
            <span>{consentComplete}/{consentForms.length} consents</span>
            <span>{intake.appointment ? 'Assessment scheduled' : missing.length ? `${missing.length} required missing` : 'Ready to schedule'}</span>
          </span>
        </span>
        <span className="hidden flex-wrap justify-end gap-2 sm:flex">
          {Number(pain) > 3 ? <StatusBadge alert label={`Pain ${pain}/10`} /> : pain !== undefined ? <StatusBadge label={`Pain ${pain}/10`} /> : null}
          {fell ? <StatusBadge alert label="Fall history" /> : null}
          {intake.appointment ? <StatusBadge success label={new Date(intake.appointment.startsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} /> : null}
        </span>
        <ChevronDown className="shrink-0 text-slate-400 transition-transform group-open:rotate-180" size={18} aria-hidden="true" />
      </summary>

      <div className="border-t border-slate-200 p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="Intake status" value={intake.appointment ? 'Complete' : missing.length ? 'In progress' : 'Forms complete'} icon={intake.appointment ? CheckCircle2 : AlertCircle} />
          <Metric label="Pain score" value={pain !== undefined ? `${pain} / 10` : 'Not submitted'} icon={AlertCircle} />
          <Metric label="First assessment" value={intake.appointment ? new Date(intake.appointment.startsAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Not scheduled'} icon={CalendarCheck} />
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Contact and flags</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <Detail label="Email" value={intake.profile.email || 'Not provided'} />
              <Detail label="Phone" value={intake.profile.phone || 'Not provided'} />
              <Detail label="Completed by" value={intake.profile.completedBy === 'caregiver' ? 'Caregiver / family helper' : 'Patient'} />
              <Detail label="Fall history" value={fell ? 'Yes — review recommended' : 'No fall reported'} />
              <Detail label="Missing forms" value={missing.length ? missing.map(readableFormName).join(', ') : 'None'} />
            </dl>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Submitted answers</h3>
            <div className="mt-3 max-h-56 space-y-3 overflow-y-auto pr-2 text-sm">
              {forms.flatMap((form) => {
                const submission = intake.submissions[form.id];
                if (!submission) return [];
                const answers = Object.entries(submission.answers);
                return (
                  <div key={form.id} className="rounded-xl bg-slate-50 p-3">
                    <p className="font-medium text-slate-800">{form.title.en}</p>
                    {answers.length ? answers.map(([key, value]) => <p key={key} className="mt-1 text-slate-600"><span className="font-medium">{humanize(key)}:</span> {String(value)}</p>) : <p className="mt-1 text-slate-500">{submission.accepted ? 'Accepted' : 'Declined'}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </details>
  );
}

function StatusBadge({ label, alert, success }: { label: string; alert?: boolean; success?: boolean }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${alert ? 'bg-red-50 text-red-700' : success ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{label}</span>;
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof AlertCircle }) {
  return <div className="rounded-xl bg-slate-50 p-4"><Icon size={17} className="text-slate-400" aria-hidden="true" /><p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value}</p></div>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4"><dt className="text-slate-500">{label}</dt><dd className="text-right font-medium text-slate-800">{value}</dd></div>;
}

function readableFormName(id: IntakeFormId) {
  return id.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function humanize(value: string) {
  return value.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
}
