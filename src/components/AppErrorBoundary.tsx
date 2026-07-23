import { Component, type ErrorInfo, type ReactNode } from 'react';

export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Application render failed', { error: error.message, componentStack: info.componentStack }); }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="grid min-h-screen place-items-center bg-slate-50 p-6"><section className="surface-card max-w-lg p-8 text-center" role="alert"><span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-blue-700 font-bold text-white">Z</span><h1 className="mt-5 text-2xl font-semibold text-slate-950">We couldn’t load this page</h1><p className="mt-3 text-slate-600">Your information was not submitted. Refresh the page or return home. If this continues, contact the clinic.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><button className="primary-action" onClick={() => window.location.reload()}>Try again</button><a className="secondary-action" href="/">Return home</a></div></section></main>;
  }
}
