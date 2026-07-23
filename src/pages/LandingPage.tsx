import { ArrowRight, CheckCircle2, HeartHandshake, Phone, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const careSteps = [
  ['We listen first', 'Tell us what hurts and what daily activity you want to get back to.'],
  ['You get a clear plan', 'Your exercises use simple words, timers, and safety reminders.'],
  ['We adjust together', 'Your pain and progress help your clinician update the plan.'],
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur-md">
        <nav aria-label="Main navigation" className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-4">
          <a href="#home" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#2459D3] text-sm font-bold text-white">Z</span>
            Zona PT
          </a>
          <div className="flex items-center gap-2">
            <a href="#how-it-works" className="hidden min-h-11 items-center px-4 font-semibold text-slate-700 sm:flex">How it works</a>
            <button onClick={() => navigate('/login')} className="primary-action">
              Patient login
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section id="home" className="relative mx-auto grid max-w-6xl gap-10 overflow-hidden px-4 py-14 md:grid-cols-[1.05fr_.95fr] md:items-center md:py-24">
          <div>
            <p className="eyebrow">Physical therapy, connected</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-6xl">Your recovery plan, made clear.</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">Guided exercises, thoughtful pain check-ins, and progress you can understand—between every visit.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => navigate('/client-portal')} className="primary-action gap-2">
                Start as a new client <ArrowRight aria-hidden="true" />
              </button>
              <a href="tel:+19075550123" className="secondary-action gap-2">
                <Phone aria-hidden="true" /> Call the clinic
              </a>
            </div>
          </div>
          <img
            src="/hero_bg.jpg"
            alt="A physical therapist helping a patient move safely"
            width="1200"
            height="800"
            fetchPriority="high"
            className="aspect-[4/3] w-full rounded-[28px] object-cover shadow-[0_24px_60px_rgba(15,23,42,0.16)]"
          />
        </section>

        <section id="how-it-works" className="border-y border-slate-200/80 bg-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <p className="eyebrow">Built around your care</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">From clinic visit to daily progress</h2>
            <p className="mt-3 text-base text-slate-600">A calm, connected experience without the paperwork shuffle.</p>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {careSteps.map(([title, description], index) => (
                <article key={title} className="surface-card p-6">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-sm font-semibold text-[#2459D3]">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 leading-relaxed text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-5 px-4 py-16 sm:grid-cols-3">
          <TrustItem icon={CheckCircle2} title="Plain language" text="Short, clear instructions you can follow." />
          <TrustItem icon={HeartHandshake} title="Caregiver friendly" text="A helper can follow along with you." />
          <TrustItem icon={ShieldCheck} title="Safety first" text="Clear pain guidance throughout your routine." />
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
        Zona PT supports your care plan. It does not replace advice from your clinician.
      </footer>
    </div>
  );
}

function TrustItem({ icon: Icon, title, text }: { icon: typeof CheckCircle2; title: string; text: string }) {
  return (
    <div className="surface-card p-6">
      <Icon className="text-[#2459D3]" size={22} aria-hidden="true" />
      <h2 className="mt-4 font-semibold">{title}</h2>
      <p className="mt-2 leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}
