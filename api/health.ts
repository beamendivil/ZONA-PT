import { productionReadiness } from '../server/config/production-readiness';

export default function handler() {
  try {
    const readiness = productionReadiness(process.env);
    return Response.json({ status: 'ok', service: 'zona-pt', mode: readiness.mode, release: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local', timestamp: new Date().toISOString() }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    console.error('Production readiness configuration failed', { error });
    return Response.json({ status: 'misconfigured', service: 'zona-pt' }, { status: 503, headers: { 'cache-control': 'no-store' } });
  }
}
