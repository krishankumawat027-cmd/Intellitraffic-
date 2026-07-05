'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  Map,
  AlertCircle,
  FileText,
  Navigation,
  Car,
  Bell,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Route,
  MapPin,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const citizenNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/map', label: 'Traffic Map', icon: Map },
  { href: '/dashboard/routes', label: 'Route Planner', icon: Route },
  { href: '/dashboard/report', label: 'Report Incident', icon: AlertCircle },
  { href: '/dashboard/parking', label: 'Parking', icon: Car },
  { href: '/dashboard/alerts', label: 'My Alerts', icon: Bell, badge: 2 },
  { href: '/dashboard/history', label: 'History', icon: Clock },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

interface CitizenSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CitizenSidebar({ isOpen, onClose }: CitizenSidebarProps) {
  const pathname = usePathname();
  const { profile, signOut } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 260,
          x: isOpen ? 0 : -260,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen z-50',
          'glass-sidebar backdrop-blur-xl',
          'flex flex-col',
          'border-r border-white/5',
          'lg:translate-x-0',
          !isOpen && '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo Section */}
        <div className="flex-shrink-0 p-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg glow-accent">
                  <Navigation className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse" />
              </motion.div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden"
                  >
                    <h1 className="text-lg font-bold text-white whitespace-nowrap">IntelliTraffic</h1>
                    <p className="text-[10px] text-emerald-400 -mt-0.5 whitespace-nowrap">Citizen Portal</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Location Card */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex-shrink-0 px-4 pt-4 overflow-hidden"
            >
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400">Current Location</span>
                </div>
                <p className="text-xs text-gray-300 truncate">Downtown District</p>
                <p className="text-[10px] text-gray-500">Updated 2 min ago</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-premium py-4 px-3">
          <div className="space-y-1">
            {citizenNavItems.map((item, idx) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-emerald-500/10 text-white border border-emerald-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5',
                      isCollapsed && 'justify-center px-2'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeCitizenNav"
                        className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}

                    <Icon className={cn(
                      'w-5 h-5 flex-shrink-0 relative z-10',
                      isActive ? 'text-emerald-400' : 'group-hover:text-emerald-400'
                    )} />

                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="flex items-center justify-between flex-1 overflow-hidden relative z-10"
                        >
                          <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                          {item.badge && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                              {item.badge}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isCollapsed && item.badge && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                        {item.badge}
                      </div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Emergency Contact */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-6 pt-4 border-t border-white/5"
              >
                <p className="px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Emergency
                </p>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors">
                  <Shield className="w-5 h-5" />
                  <div className="text-left">
                    <p className="text-sm font-semibold">Emergency</p>
                    <p className="text-[10px] text-red-400/70">Call 911</p>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* User Section */}
        <div className="flex-shrink-0 p-3 border-t border-white/5">
          <div className={cn(
            'flex items-center gap-3 p-2 rounded-xl bg-white/5',
            isCollapsed && 'justify-center'
          )}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-white">
                {profile?.name?.[0]?.toUpperCase() || 'C'}
              </span>
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 overflow-hidden"
                >
                  <p className="text-sm font-medium text-white truncate">{profile?.name || 'Citizen'}</p>
                  <p className="text-[10px] text-gray-400 truncate">Citizen Account</p>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSignOut}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-gray-400" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
