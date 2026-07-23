import { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';

interface CountdownTimerProps {
  seconds: 5 | 10 | 30;
}

export function CountdownTimer({ seconds }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState<number>(seconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const timer = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [remaining, running]);

  const reset = () => {
    setRemaining(seconds);
    setRunning(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center" aria-live="polite">
      <p className="eyebrow">Hold timer</p>
      <p className="my-2 text-4xl font-semibold tabular-nums tracking-tight text-slate-900">{remaining}</p>
      <p className="mb-3 text-sm text-slate-600">seconds</p>
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setRunning((value) => !value)}
          className="primary-action gap-2"
        >
          {running ? <Pause size={20} /> : <Play size={20} />}
          {running ? 'Pause' : remaining === 0 ? 'Start again' : 'Start'}
        </button>
        <button
          type="button"
          onClick={reset}
          aria-label="Reset timer"
          className="min-h-12 rounded-xl border border-slate-300 px-4 text-slate-700"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
}
