import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileManager } from '@/services/ProfileManager';
import type { AppRole, ConditionFocus, LanguageMode } from '@/types/exercise';

const roles: Array<{ value: AppRole; label: string }> = [
  { value: 'patient', label: 'Patient / Paciente' },
  { value: 'caregiver', label: 'Caregiver or family helper / Familiar o cuidador' },
  { value: 'clinician', label: 'Clinician / Profesional clínico' },
];
const conditions: Array<{ value: ConditionFocus; label: string }> = [
  { value: 'hip-knee-after-fall', label: 'Hip or knee pain after a fall / Dolor después de una caída' },
  { value: 'low-back-pain', label: 'Low back pain / Dolor de espalda baja' },
  { value: 'general-strength-mobility', label: 'General strength and movement / Fuerza y movimiento' },
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<AppRole>('patient');
  const [conditionFocus, setCondition] = useState<ConditionFocus>('low-back-pain');
  const [language, setLanguage] = useState<LanguageMode>('bilingual');

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    ProfileManager.save(user.id, { role, conditionFocus, language });
    navigate('/consent');
  };

  return (
    <main className="min-h-screen bg-[#F7F9FC] px-4 py-10">
      <form onSubmit={submit} className="surface-card mx-auto max-w-xl p-6 sm:p-8">
        <p className="eyebrow">Welcome / Bienvenido</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Personalize your care plan.</h1>
        <p className="mt-2 text-base text-slate-600">Choose what fits you. You can change these choices later.</p>
        <ChoiceGroup legend="Who is using the app?" value={role} options={roles} onChange={(value) => setRole(value as AppRole)} />
        <ChoiceGroup legend="What are you working on?" value={conditionFocus} options={conditions} onChange={(value) => setCondition(value as ConditionFocus)} />
        <ChoiceGroup
          legend="Language / Idioma"
          value={language}
          options={[
            { value: 'english', label: 'English' },
            { value: 'spanish', label: 'Español' },
            { value: 'bilingual', label: 'English + Español' },
          ]}
          onChange={(value) => setLanguage(value as LanguageMode)}
        />
        <button className="primary-action mt-8 w-full">Continue / Continuar</button>
      </form>
    </main>
  );
}

function ChoiceGroup({ legend, value, options, onChange }: {
  legend: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="mt-7">
      <legend className="mb-3 font-semibold text-slate-900">{legend}</legend>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.value} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${value === option.value ? 'border-[#2459D3] bg-indigo-50/60' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
            <input type="radio" checked={value === option.value} onChange={() => onChange(option.value)} className="h-5 w-5" />
            <span className="text-base text-slate-800">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
