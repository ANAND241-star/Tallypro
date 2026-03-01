import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const UserLogin: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const { login, signup, loginWithGoogle, resetPassword } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                if (!name.trim()) {
                    setError('Name is required for signup');
                    setLoading(false);
                    return;
                }
                const success = await signup(name, email, password);
                if (success) {
                    showToast('Account created successfully!', 'success');
                    navigate('/dashboard');
                } else {
                    setError('Email already in use or sign up failed.');
                }
            } else {
                const success = await login(email, password, 'customer');
                if (success) {
                    showToast('Login successful!', 'success');
                    navigate('/dashboard');
                } else {
                    setError('Invalid email or password.');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const success = await loginWithGoogle();
            if (success) {
                showToast('Google Login successful!', 'success');
                navigate('/dashboard');
            } else {
                setError('Google Login failed.');
            }
        } catch (err: any) {
            setError(err.message || 'Google Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!email.trim()) {
            setError("Please enter your email address to reset password.");
            return;
        }

        setError('');
        setLoading(true);
        try {
            await resetPassword(email);
            showToast("Password reset email sent! Check your inbox.", "success");
            setIsResetting(false);
        } catch (err: any) {
            setError(err.message || "Failed to send reset email. Make sure the email is registered.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center bg-slate-50 dark:bg-dark">
            <div className="w-full max-w-md glass-card p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl animate-fade-in-up">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        {isResetting ? 'Reset Password' : (isSignUp ? 'Create an Account' : 'Welcome Back')}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {isResetting ? 'Enter your email to receive a password reset link' : (isSignUp ? 'Sign up to purchase standard TDLs' : 'Log in to access your dashboard')}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
                    {isSignUp && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                placeholder="John Doe"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            placeholder="yourname@gmail.com"
                        />
                    </div>

                    {!isResetting && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Password
                                </label>
                                {!isSignUp && (
                                    <button
                                        type="button"
                                        onClick={() => setIsResetting(true)}
                                        className="text-xs text-blue-600 hover:text-blue-500 font-medium"
                                    >
                                        Forgot Password?
                                    </button>
                                )}
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    )}

                    {isResetting ? (
                        <button
                            type="button"
                            onClick={handleResetPassword}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
                        </button>
                    )}
                </form>

                {!isResetting && (
                    <>
                        <div className="relative flex items-center justify-center my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-300 dark:border-slate-700"></div>
                            </div>
                            <div className="relative bg-slate-50 dark:bg-slate-800 px-4 text-sm text-slate-500 dark:text-slate-400">
                                OR
                            </div>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            type="button"
                            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-medium py-3 rounded-xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                                <path fill="none" d="M1 1h22v22H1z" />
                            </svg>
                            Continue with Google
                        </button>
                    </>
                )}

                <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
                    {isResetting ? (
                        <button onClick={() => setIsResetting(false)} className="text-blue-600 font-semibold hover:underline bg-transparent border-none cursor-pointer">
                            Back to Login
                        </button>
                    ) : (
                        <>
                            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                            <button onClick={() => setIsSignUp(!isSignUp)} className="text-blue-600 font-semibold hover:underline bg-transparent border-none cursor-pointer">
                                {isSignUp ? 'Log In' : 'Sign Up'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserLogin;
