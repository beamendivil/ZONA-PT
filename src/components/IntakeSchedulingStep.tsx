import { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Video } from 'lucide-react';
import { SchedulingService } from '@/services/SchedulingService';
import type { IntakeAppointment, IntakeDraft } from '@/types/intake';

export function IntakeSchedulingStep({ draft, onConfirm, onBack }: {
  draft: IntakeDraft;
  onConfirm: (appointment: IntakeAppointment) => void;
  onBack: () => void;
}) {
  const slots = useMemo(() => SchedulingService.getAvailableSlots(), []);
  const [format, setFormat] = useState<'in-person' | 'virtual'>('in-person');
  const [slotId, setSlotId] = useState('');
  const telehealthAccepted = draft.submissions.telehealth?.accepted === true;
  const visibleSlots = slots.filter((slot) => slot.formats.includes(format));

  const confirm = () => {
    const slot = slots.find((item) => item.id === slotId);
    if (!slot) return;
    onConfirm({
      type: 'initial-assessment',
      format,
      slotId,
      startsAt: slot.startsAt,
      confirmedAt: new Date().toISOString(),
    });
  };

  return (
    <section className="surface-card p-6 sm:p-8">
      <p className="eyebrow">First appointment</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Schedule your initial assessment</h1>
      <p className="mt-3 text-slate-600">Choose how you would like to meet, then select an available time.</p>

      <fieldset className="mt-7">
        <legend className="font-medium text-slate-900">Appointment format</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <FormatButton selected={format === 'in-person'} onClick={() => { setFormat('in-person'); setSlotId(''); }} icon={CalendarDays} label="In person" />
          <FormatButton
            selected={format === 'virtual'}
            disabled={!telehealthAccepted}
            onClick={() => { setFormat('virtual'); setSlotId(''); }}
            icon={Video}
            label="Virtual"
          />
        </div>
        {!telehealthAccepted ? <p className="mt-2 text-sm text-slate-500">Accept the optional telehealth form to unlock virtual appointments.</p> : null}
      </fieldset>

      <fieldset className="mt-7">
        <legend className="font-medium text-slate-900">Available times</legend>
        <div className="mt-3 grid gap-3">
          {visibleSlots.map((slot) => {
            const date = new Date(slot.startsAt);
            return (
              <label key={slot.id} className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors ${slotId === slot.id ? 'border-[#2459D3] bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                <input type="radio" name="appointment-slot" checked={slotId === slot.id} onChange={() => setSlotId(slot.id)} />
                <span className="flex-1">
                  <span className="block font-semibold">{date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                  <span className="mt-1 block text-sm text-slate-500">{date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} · {slot.clinician}</span>
                </span>
                {slotId === slot.id ? <CheckCircle2 className="text-[#2459D3]" size={20} aria-hidden="true" /> : null}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button type="button" onClick={onBack} className="secondary-action">Back</button>
        <button type="button" disabled={!slotId} onClick={confirm} className="primary-action disabled:cursor-not-allowed disabled:opacity-40">Confirm appointment</button>
      </div>
    </section>
  );
}

function FormatButton({ selected, disabled, onClick, icon: Icon, label }: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: typeof CalendarDays;
  label: string;
}) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} aria-pressed={selected} className={`flex min-h-16 items-center gap-3 rounded-xl border p-4 text-left disabled:cursor-not-allowed disabled:opacity-40 ${selected ? 'border-[#2459D3] bg-indigo-50 text-[#2459D3]' : 'border-slate-200 bg-white text-slate-700'}`}>
      <Icon size={20} aria-hidden="true" /><span className="font-semibold">{label}</span>
    </button>
  );
}
