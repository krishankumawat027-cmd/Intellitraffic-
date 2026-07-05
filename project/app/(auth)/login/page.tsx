'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { MotionButton } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, resendConfirmation, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      await signIn(email, password);
      router.push('/admin');
    } catch (err: any) {
      setLocalError(err.message || 'Failed to sign in');
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setLocalError('Enter your email address first.');
      return;
    }

    setIsResending(true);
    try {
      await resendConfirmation(email);
      setLocalError('A new confirmation email has been sent.');
    } catch {
      setLocalError('We could not resend the confirmation email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.05))]" />

      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md px-6 z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg glow-primary mb-4">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to IntelliTraffic AI Command Center</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error */}
            {(error || localError) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error || localError}
              </motion.div>
            )}

            {(error || localError) && (String(error || localError).toLowerCase().includes('confirm') || String(error || localError).toLowerCase().includes('confirmed')) && (
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={isResending}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend confirmation email'}
              </button>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-premium pl-12"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium pl-12 pr-12"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="hidden peer" />
                <div className="w-5 h-5 rounded-lg border border-white/20 bg-white/5 peer-checked:bg-cyan-500 peer-checked:border-cyan-500 flex items-center justify-center transition-all group-hover:border-white/30">
                  <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <MotionButton
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              loadingText="Signing in..."
              className="w-full"
              rightIcon={!isLoading && <ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </MotionButton>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <p className="text-xs text-cyan-400 font-medium mb-2">Getting Started</p>
            <div className="space-y-1 text-xs text-gray-400">
              <p>No account? Register to create your first user.</p>
              <p className="text-gray-500 mt-2">After registering:</p>
              <p>• Admins access the Command Center</p>
              <p>• Citizens access the Citizen Portal</p>
            </div>
          </div>
        </motion.div>

        {/* Register Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6 text-gray-400"
        >
          Don't have an account?{' '}
          <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
            Create account
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
