import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './index.css';

import { useAuth } from '@/contexts/AuthContext';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import { getClientByEmail } from '@/data/exercises';
import { ConsentManager } from '@/services/ConsentManager';
import { ProfileManager } from '@/services/ProfileManager';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'));
const ConsentPage = lazy(() => import('@/pages/ConsentPage'));
const ClientDashboard = lazy(() => import('@/pages/ClientDashboard'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const ClientPortalPage = lazy(() => import('@/pages/ClientPortalPage'));
const PilotReadinessPage = lazy(() => import('@/pages/PilotReadinessPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const AccountSecurityPage = lazy(() => import('@/pages/AccountSecurityPage'));

function ProtectedRoute({ children, requireAdmin = false }: { children: ReactNode; requireAdmin?: boolean }) {
  const { isAuthenticated, isAdmin, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />;

  if (!requireAdmin && user && !isAdmin) {
    if (!ProfileManager.get(user.id)) return <Navigate to="/onboarding" replace />;
    const client = getClientByEmail(user.email);
    if (ConsentManager.missing(user.id, client?.dryNeedlingAssigned ?? false).length > 0) {
      return <Navigate to="/consent" replace />;
    }
    if (!ConsentManager.getLatest(user.id, 'ambient-recording')) {
      return <Navigate to="/consent" replace />;
    }
  }

  return children;
}

function RouteLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-sky-50" role="status">
      <p className="text-lg font-semibold text-slate-800">Loading…</p>
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/client-portal" element={<ClientPortalPage />} />
            <Route path="/intake" element={<Navigate to="/client-portal" replace />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/consent" element={<ConsentPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/pilot-readiness" element={<ProtectedRoute requireAdmin><PilotReadinessPage /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><AccountSecurityPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}
