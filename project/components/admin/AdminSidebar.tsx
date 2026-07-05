'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  Map,
  AlertTriangle,
  FileText,
  X,
  Signal,
  Users,
  Car,
  BarChart3,
  Settings,
  Bell,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
  Shield,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & Metrics' },
  { href: '/admin/map', label: 'Live Map', icon: Map, description: 'Real-time Traffic' },
  { href: '/admin/incidents', label: 'Incidents', icon: AlertTriangle, description: 'Active Events', badge: 3 },
  { href: '/admin/reports', label: 'Reports', icon: FileText, description: 'Citizen Reports', badge: 12 },
  { href: '/admin/closures', label: 'Road Closures', icon: X, description: 'Manage Closures' },
  { href: '/admin/signals', label: 'Traffic Signals', icon: Signal, description: 'Signal Control' },
  { href: '/admin/officers', label: 'Officers', icon: Users, description: 'Team Management' },
  { href: '/admin/parking', label: 'Parking', icon: Car, description: 'Parking Management' },
  { href: '/admin/alerts', label: 'Alerts', icon: Bell, description: 'Emergency Alerts' },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, description: 'Traffic Insights' },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
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
          width: isCollapsed ? 80 : 280,
          x: isOpen ? 0 : -280,
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
            <Link href="/admin" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg glow-primary">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
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
                    <p className="text-[10px] text-gray-400 -mt-0.5 whitespace-nowrap">Command Center</p>
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

        {/* Status Card */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex-shrink-0 px-4 pt-4 overflow-hidden"
            >
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-400">System Online</span>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-gray-400">
                  <span>1,247 vehicles</span>
                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                  <span>3 active</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-premium py-4 px-3">
          <div className="space-y-1">
            {adminNavItems.map((item, idx) => {
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
                        ? 'bg-primary/10 text-white border border-primary/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5',
                      isCollapsed && 'justify-center px-2'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}

                    <Icon className={cn(
                      'w-5 h-5 flex-shrink-0 relative z-10',
                      isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400'
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
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                              {item.badge}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isCollapsed && item.badge && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                        {item.badge}
                      </div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-6 pt-4 border-t border-white/5"
              >
                <p className="px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Quick Actions
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-medium">Emergency</span>
                  </button>
                  <button className="flex items-center gap-2 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors">
                    <Signal className="w-4 h-4" />
                    <span className="text-xs font-medium">All Green</span>
                  </button>
                </div>
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
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-white">
                {profile?.name?.[0]?.toUpperCase() || 'A'}
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
                  <p className="text-sm font-medium text-white truncate">{profile?.name || 'Admin'}</p>
                  <p className="text-[10px] text-gray-400 truncate">Administrator</p>
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
