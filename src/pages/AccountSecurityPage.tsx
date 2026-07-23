import { UserProfile } from '@clerk/react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { env } from '@/config/env';

export default function AccountSecurityPage() {
  return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-4xl"><Link to="/dashboard" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-600 hover:bg-white"><ArrowLeft size={18} /> Back to dashboard</Link><header className="mt-5"><p className="text-sm font-semibold uppercase tracking-widest text-blue-700">Account security</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Your sign-in and devices</h1><p className="mt-2 text-slate-600">Manage authentication methods, recovery options, and active sessions.</p></header><section className="mt-7">{env.clerkPublishableKey ? <UserProfile routing="hash" /> : <div className="surface-card p-7"><h2 className="font-semibold text-slate-950">Development authentication</h2><p className="mt-2 text-sm text-slate-600">Account recovery and device management become available after Clerk keys are configured.</p></div>}</section></div></main>;
}
