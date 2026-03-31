import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Leaf, Eye, EyeOff, AlertCircle } from 'lucide-react';

type Mode = 'login' | 'signup';

export function AuthPage() {
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const [mode, setMode] = useState<Mode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setIsLoading(true);

        if (mode === 'login') {
            const { error } = await signIn(email, password);
            if (error) {
                setError(error.message);
            } else {
                navigate('/');
            }
        } else {
            const { error } = await signUp(email, password);
            if (error) {
                setError(error.message);
            } else {
                setSuccessMsg('Account created! Check your email to confirm your address, then log in.');
                setMode('login');
            }
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-[var(--hh-bg)] flex items-center justify-center p-4">
            {/* Ambient glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--hh-accent)]/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 bg-[var(--hh-accent)]/10 border border-[var(--hh-accent)]/30 rounded-2xl flex items-center justify-center mb-4">
                        <Leaf className="w-7 h-7 text-[var(--hh-accent)]" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Habit Hero</h1>
                    <p className="text-gray-500 text-sm mt-1">Build lasting habits, one day at a time</p>
                </div>

                {/* Card */}
                <div className="bg-[var(--hh-card)] border border-[var(--hh-border)] rounded-2xl p-8 shadow-2xl">
                    {/* Tab Toggle */}
                    <div className="flex bg-[var(--hh-sidebar)] rounded-xl p-1 mb-6">
                        {(['login', 'signup'] as const).map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => { setMode(m); setError(null); setSuccessMsg(null); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${mode === m
                                        ? 'bg-[var(--hh-nav-active)] text-[var(--hh-nav-active-text)] shadow-sm'
                                        : 'text-[var(--hh-muted)] hover:text-[var(--hh-text)]'
                                    }`}
                            >
                                {m === 'login' ? 'Sign In' : 'Create Account'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1.5">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-[var(--hh-bg)] border border-[var(--hh-border)] text-[var(--hh-text)] rounded-xl px-4 py-3 pr-11 text-sm placeholder-gray-600
                             focus:outline-none focus:border-[var(--hh-accent)] focus:ring-1 focus:ring-[var(--hh-accent)]/50 transition-colors"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-xl px-4 py-3 pr-11 text-sm placeholder-gray-600
                             focus:outline-none focus:border-[#4ADE80] focus:ring-1 focus:ring-[#4ADE80]/50 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {mode === 'signup' && (
                                <p className="text-xs text-gray-600 mt-1.5">Minimum 6 characters</p>
                            )}
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Success */}
                        {successMsg && (
                            <div className="bg-[var(--hh-accent)]/10 border border-[var(--hh-accent)]/20 text-[var(--hh-accent)] rounded-xl px-4 py-3 text-sm">
                                {successMsg}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            id="auth-submit-btn"
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[var(--hh-btn)] text-[var(--hh-btn-text)] font-semibold rounded-xl py-3 mt-2 text-sm
                         hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                                </>
                            ) : (
                                mode === 'login' ? 'Sign In' : 'Create Account'
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-600 text-xs mt-6">
                    Your habits are synced securely in the cloud.
                </p>
            </div>
        </div>
    );
}
