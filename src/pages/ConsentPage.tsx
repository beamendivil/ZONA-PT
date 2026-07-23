import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { ConsentForm } from '@/components/ConsentForm';
import { useAuth } from '@/contexts/AuthContext';
import { getClientByEmail } from '@/data/exercises';
import { ConsentManager } from '@/services/ConsentManager';
import { ProfileManager } from '@/services/ProfileManager';
import type { ConsentType } from '@/types/consent';

export default function ConsentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [, refresh] = useState(0);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (!ProfileManager.get(user.id)) return <Navigate to="/onboarding" replace />;

  const client = getClientByEmail(user.email);
  const orderedTypes: ConsentType[] = [
    'consent-to-treat',
    ...(client?.dryNeedlingAssigned ? ['dry-needling' as const] : []),
    'ambient-recording',
  ];
  const nextType = orderedTypes.find((type) =>
    type === 'ambient-recording'
      ? !ConsentManager.getLatest(user.id, type)
      : !ConsentManager.getCurrent(user.id, type),
  );

  if (!nextType) return <Navigate to="/dashboard" replace />;
  const document = ConsentManager.getDocument(nextType);
  if (!document) return null;
  const currentStep = orderedTypes.indexOf(nextType) + 1;

  return (
    <main className="min-h-screen bg-[#F7F9FC] px-4 py-10">
      <div className="surface-card mx-auto max-w-2xl p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-2 text-base font-semibold text-emerald-800">
          <CheckCircle2 size={18} />
          Secure demo consent workflow
        </div>
        <p className="font-bold text-blue-800">Consent {currentStep} of {orderedTypes.length}</p>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label="Consent progress" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={orderedTypes.length}>
          <div className="h-full rounded-full bg-blue-700" style={{ width: `${(currentStep / orderedTypes.length) * 100}%` }} />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">{document.title.en}</h1>
        <h2 lang="es" className="mt-1 text-lg font-medium text-slate-500">{document.title.es}</h2>
        <p className="my-5 text-slate-600">Please review each form separately. / Revise cada formulario por separado.</p>
        <ConsentForm
          document={document}
          showCaregiver={ProfileManager.get(user.id)?.role === 'caregiver'}
          onSubmit={(record) => {
            ConsentManager.save(user.id, record);
            refresh((value) => value + 1);
            const remaining = orderedTypes.some((type) =>
              type === 'ambient-recording'
                ? !ConsentManager.getLatest(user.id, type)
                : !ConsentManager.getCurrent(user.id, type),
            );
            if (!remaining) navigate('/dashboard');
          }}
        />
      </div>
    </main>
  );
}
