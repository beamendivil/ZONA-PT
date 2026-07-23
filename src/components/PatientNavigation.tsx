import { ClipboardList, HeartPulse, Home, LifeBuoy, ShieldCheck, TrendingUp } from 'lucide-react';

export type PatientView = 'home' | 'exercises' | 'pain' | 'progress' | 'consents' | 'help';

const items: Array<{ id: PatientView; label: string; shortLabel: string; icon: typeof Home }> = [
  { id: 'home', label: 'Home', shortLabel: 'Home', icon: Home },
  { id: 'exercises', label: 'My Exercises', shortLabel: 'Exercises', icon: ClipboardList },
  { id: 'pain', label: 'Pain Check-In', shortLabel: 'Pain', icon: HeartPulse },
  { id: 'progress', label: 'Progress', shortLabel: 'Progress', icon: TrendingUp },
  { id: 'consents', label: 'Consents', shortLabel: 'Consents', icon: ShieldCheck },
  { id: 'help', label: 'Help / Caregiver', shortLabel: 'Help', icon: LifeBuoy },
];

export function PatientNavigation({ active, onChange }: { active: PatientView; onChange: (view: PatientView) => void }) {
  return (
    <>
      <nav aria-label="Patient sections" className="hidden border-b border-slate-200/80 bg-white md:block">
        <div className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-4">
          {items.map((item) => <NavButton key={item.id} item={item} active={active === item.id} onChange={onChange} />)}
        </div>
      </nav>
      <nav aria-label="Patient sections" className="fixed inset-x-3 bottom-3 z-40 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_10px_36px_rgba(15,23,42,0.16)] backdrop-blur-md md:hidden">
        <div className="grid grid-cols-6">
          {items.map((item) => <NavButton key={item.id} item={item} active={active === item.id} onChange={onChange} mobile />)}
        </div>
      </nav>
    </>
  );
}

function NavButton({ item, active, onChange, mobile = false }: {
  item: (typeof items)[number];
  active: boolean;
  onChange: (view: PatientView) => void;
  mobile?: boolean;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onChange(item.id)}
      aria-current={active ? 'page' : undefined}
      className={`${mobile ? 'min-h-[62px] px-1 text-[11px]' : 'min-h-14 border-b-2 px-1 text-sm'} flex flex-col items-center justify-center gap-1 whitespace-nowrap font-semibold transition-colors duration-150 focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2459D3] ${
        active
          ? mobile
            ? 'bg-indigo-50 text-[#2459D3]'
            : 'border-[#2459D3] text-[#2459D3]'
          : mobile
            ? 'text-slate-600'
            : 'border-transparent text-slate-600 hover:text-slate-950'
      }`}
    >
      <Icon size={mobile ? 21 : 19} aria-hidden="true" />
      <span>{mobile ? item.shortLabel : item.label}</span>
    </button>
  );
}
