'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  Car,
  AlertTriangle,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MapPin,
  Navigation,
  ArrowRight,
  Zap,
  Shield,
} from 'lucide-react';
import { MotionButton } from '@/components/ui/button';
import Link from 'next/link';

// Dynamic import for 3D Scene
const TrafficScene = dynamic(
  () => import('@/components/3d/Scene').then((mod) => mod.TrafficScene),
  { ssr: false }
);

// Animated Counter Hook
function useAnimatedCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        ref.current = setTimeout(() => requestAnimationFrame(animate), 16);
      }
    };
    requestAnimationFrame(animate);
    return () => {
      if (ref.current) clearTimeout(ref.current);
    };
  }, [end, duration]);

  return count;
}

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  delay,
}: {
  title: string;
  value: number;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: 'cyan' | 'emerald' | 'violet' | 'amber' | 'red' | 'blue';
  delay: number;
}) {
  const animatedValue = useAnimatedCounter(value, 1500);
  const colorClasses = {
    cyan: 'from-cyan-400 to-blue-600',
    emerald: 'from-emerald-400 to-cyan-500',
    violet: 'from-violet-400 to-purple-600',
    amber: 'from-amber-400 to-orange-500',
    red: 'from-red-400 to-rose-600',
    blue: 'from-blue-400 to-indigo-600',
  };

  const bgClasses = {
    cyan: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20',
    emerald: 'from-emerald-500/10 to-cyan-500/10 border-emerald-500/20',
    violet: 'from-violet-500/10 to-purple-500/10 border-violet-500/20',
    amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20',
    red: 'from-red-500/10 to-rose-500/10 border-red-500/20',
    blue: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`dashboard-card p-6 bg-gradient-to-br ${bgClasses[color]}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            changeType === 'up' ? 'text-emerald-400' : changeType === 'down' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {changeType === 'up' ? <ArrowUpRight className="w-3 h-3" /> : changeType === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
            {change}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-white animate-count-up">
          {animatedValue.toLocaleString()}
        </p>
      </div>
      <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '75%' }}
          transition={{ delay: delay + 0.3, duration: 1, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${colorClasses[color]}`}
        />
      </div>
    </motion.div>
  );
}

// Quick Action Button
function QuickAction({
  icon: Icon,
  label,
  description,
  color,
  href,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  color: 'cyan' | 'emerald' | 'red' | 'violet';
  href: string;
}) {
  const colorClasses = {
    cyan: 'from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500',
    emerald: 'from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400',
    red: 'from-red-400 to-rose-600 hover:from-red-300 hover:to-rose-500',
    violet: 'from-violet-400 to-purple-600 hover:from-violet-300 hover:to-purple-500',
  };

  return (
    <Link href={href}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full p-4 rounded-xl bg-gradient-to-r ${colorClasses[color]} text-white text-left group`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">{label}</p>
            <p className="text-xs text-white/70">{description}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>
      </motion.button>
    </Link>
  );
}

// Alert Item
function AlertItem({
  type,
  title,
  location,
  time,
  severity,
}: {
  type: 'collision' | 'breakdown' | 'hazard';
  title: string;
  location: string;
  time: string;
  severity: 'low' | 'medium' | 'high';
}) {
  const severityColors = {
    low: 'badge-info',
    medium: 'badge-warning',
    high: 'badge-danger',
  };

  const typeIcons = {
    collision: AlertTriangle,
    breakdown: Car,
    hazard: Zap,
  };

  const Icon = typeIcons[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
    >
      <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
        <Icon className="w-5 h-5 text-red-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-white truncate">{title}</p>
          <span className={`badge ${severityColors[severity]}`}>{severity}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
          <MapPin className="w-3 h-3" />
          {location}
          <span className="w-1 h-1 rounded-full bg-gray-600" />
          <Clock className="w-3 h-3" />
          {time}
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { title: 'Active Vehicles', value: 1247, change: '12%', changeType: 'up' as const, icon: Car, color: 'cyan' as const },
    { title: 'Traffic Incidents', value: 23, change: '5%', changeType: 'down' as const, icon: AlertTriangle, color: 'red' as const },
    { title: 'Avg. Speed', value: 42, change: '8%', changeType: 'up' as const, icon: TrendingUp, color: 'emerald' as const },
    { title: 'Active Signals', value: 156, icon: Activity, color: 'violet' as const },
    { title: 'Peak Hours', value: 8, change: '-15 min', changeType: 'up' as const, icon: Clock, color: 'amber' as const },
    { title: 'Officers Online', value: 47, icon: Shield, color: 'blue' as const },
  ];

  const alerts = [
    { type: 'collision' as const, title: 'Vehicle Collision', location: 'Main Blvd & 5th Ave', time: '5 min ago', severity: 'high' as const },
    { type: 'breakdown' as const, title: 'Vehicle Breakdown', location: 'Highway 101', time: '12 min ago', severity: 'medium' as const },
    { type: 'hazard' as const, title: 'Road Hazard', location: 'Commerce Street', time: '25 min ago', severity: 'low' as const },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Command Center</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time traffic management dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/map">
            <MotionButton variant="outline" leftIcon={<Navigation className="w-4 h-4" />}>
              Live Map
            </MotionButton>
          </Link>
          <Link href="/admin/alerts">
            <MotionButton variant="danger" leftIcon={<AlertTriangle className="w-4 h-4" />}>
              Emergency
            </MotionButton>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, idx) => (
          <StatCard key={stat.title} {...stat} delay={idx * 0.1} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 3D Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2"
        >
          <div className="dashboard-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Live Traffic Map</h2>
                <p className="text-sm text-gray-400">Real-time 3D visualization</p>
              </div>
              <Link href="/admin/map">
                <MotionButton variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Full View
                </MotionButton>
              </Link>
            </div>
            <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden relative">
              {mounted && (
                <TrafficScene />
              )}
              {/* Overlay Stats */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                <div className="glass rounded-lg px-3 py-2 text-xs">
                  <p className="text-gray-400">Total Vehicles</p>
                  <p className="text-white font-bold">1,247</p>
                </div>
                <div className="glass rounded-lg px-3 py-2 text-xs">
                  <p className="text-gray-400">Avg Speed</p>
                  <p className="text-emerald-400 font-bold">42 km/h</p>
                </div>
                <div className="glass rounded-lg px-3 py-2 text-xs">
                  <p className="text-gray-400">Congestion</p>
                  <p className="text-amber-400 font-bold">Medium</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alerts Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="dashboard-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Active Alerts</h2>
              <span className="px-2 py-1 text-xs font-bold bg-red-500/20 text-red-400 rounded-full">
                3
              </span>
            </div>
            <div className="space-y-3">
              {alerts.map((alert, idx) => (
                <AlertItem key={idx} {...alert} />
              ))}
            </div>
            <Link href="/admin/incidents" className="block mt-4">
              <MotionButton variant="outline" className="w-full">
                View All Incidents
              </MotionButton>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickAction
          icon={Zap}
          label="Emergency Response"
          description="Dispatch first responders"
          color="red"
          href="/admin/alerts"
        />
        <QuickAction
          icon={Activity}
          label="Signal Override"
          description="Force green corridor"
          color="cyan"
          href="/admin/signals"
        />
        <QuickAction
          icon={AlertTriangle}
          label="Road Closure"
          description="Block road segment"
          color="violet"
          href="/admin/closures"
        />
        <QuickAction
          icon={Shield}
          label="Officer Dispatch"
          description="Assign officers"
          color="emerald"
          href="/admin/officers"
        />
      </div>
    </div>
  );
}
