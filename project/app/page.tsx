'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function HomePage() {
  const { isAuthenticated, profile, isLoading, checkSession } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && profile) {
        if (profile.role === 'admin' || profile.role === 'traffic_officer') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
    }
  }, [isLoading, isAuthenticated, profile, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="relative inline-flex mb-6">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">IntelliTraffic AI</h1>
        <p className="text-gray-400 mb-6">Smart Traffic Intelligence Platform</p>
        <div className="w-8 h-8 mx-auto border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </motion.div>
    </div>
  );
}
