import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps protected routes. Redirects unauthenticated users to /login.
 * Shows nothing while the session is being determined.
 */
export function ProtectedRoute() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--hh-bg)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[var(--hh-accent)] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[var(--hh-muted)] text-sm">Loading session…</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
