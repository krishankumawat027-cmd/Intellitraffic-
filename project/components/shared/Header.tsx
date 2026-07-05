'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import {
  Search,
  Bell,
  Settings,
  ChevronDown,
  User,
  LogOut,
  LayoutDashboard,
  Sparkles,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuToggle?: () => void;
  isSidebarOpen?: boolean;
}

export function Header({ onMenuToggle, isSidebarOpen }: HeaderProps) {
  const { profile, signOut } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const roleLabel = profile?.role === 'admin' ? 'Administrator' :
                    profile?.role === 'traffic_officer' ? 'Traffic Officer' : 'Citizen';

  return (
    <header className="h-16 glass-sidebar border-b border-white/5 backdrop-blur-xl sticky top-0 z-50">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Menu className="w-5 h-5 text-white" />
          </motion.button>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg glow-primary">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-white">IntelliTraffic</h1>
              <p className="text-[10px] text-gray-400 -mt-0.5">Smart Traffic AI</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roads, incidents, signals..."
              className={cn(
                'w-full pl-11 pr-4 py-2.5 rounded-xl transition-all duration-300',
                'bg-white/5 border border-white/10 text-white placeholder-gray-500',
                'focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:bg-white/10',
                'hover:border-white/20'
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden group-focus-within:flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-white/10 rounded">⌘</kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-white/10 rounded">K</kbd>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Date & Time */}
          <div className="hidden xl:flex flex-col items-end mr-2">
            <span className="text-sm font-semibold text-white">{formatTime(currentTime)}</span>
            <span className="text-[10px] text-gray-400">{formatDate(currentTime)}</span>
          </div>

          {/* AI Assistant Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-500/30 hover:border-violet-500/50 transition-all group"
          >
            <Sparkles className="w-4 h-4 text-violet-400 group-hover:text-violet-300" />
            <span className="hidden lg:inline text-sm font-medium text-violet-300">AI Assist</span>
          </motion.button>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <Bell className="w-5 h-5 text-gray-300" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-slate-900">
                3
              </span>
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 glass-card rounded-xl overflow-hidden shadow-2xl"
                >
                  <div className="p-4 border-b border-white/10">
                    <h3 className="font-semibold text-white">Notifications</h3>
                    <p className="text-xs text-gray-400">3 unread</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto scrollbar-premium">
                    {[
                      { title: 'New incident reported', time: '2 min ago', type: 'alert' },
                      { title: 'Signal cycle optimized', time: '15 min ago', type: 'info' },
                      { title: 'Road closure alert', time: '1 hour ago', type: 'warning' },
                    ].map((notification, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                            notification.type === 'alert' ? 'bg-red-500' :
                            notification.type === 'warning' ? 'bg-yellow-500' : 'bg-cyan-500'
                          )} />
                          <div>
                            <p className="text-sm text-white">{notification.title}</p>
                            <p className="text-xs text-gray-500">{notification.time}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-white/10">
                    <button className="w-full text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settings */}
          <motion.button
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <Settings className="w-5 h-5 text-gray-300" />
          </motion.button>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-white leading-tight">{profile?.name || 'User'}</p>
                <p className="text-[10px] text-gray-400 leading-tight">{roleLabel}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden lg:block" />
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 glass-card rounded-xl overflow-hidden shadow-2xl"
                >
                  <div className="p-3 border-b border-white/10">
                    <p className="font-medium text-white">{profile?.name}</p>
                    <p className="text-xs text-gray-400">{profile?.email}</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 transition-colors">
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5 transition-colors">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                  </div>
                  <div className="p-2 border-t border-white/10">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
