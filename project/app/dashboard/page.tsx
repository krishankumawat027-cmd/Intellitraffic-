'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Car,
  MapPin,
  AlertCircle,
  Navigation,
  Clock,
  TrendingUp,
  Route,
  Shield,
  ChevronRight,
  Zap,
  Eye,
  Bell,
} from 'lucide-react';
import { MotionButton } from '@/components/ui/button';

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

// Stat Card
function StatCard({
  title,
  value,
  label,
  icon: Icon,
  color,
  delay,
}: {
  title: string;
  value: number;
  label: string;
  icon: React.ElementType;
  color: 'emerald' | 'cyan' | 'amber' | 'violet';
  delay: number;
}) {
  const animatedValue = useAnimatedCounter(value, 1500);

  const colorClasses = {
    emerald: 'from-emerald-400 to-cyan-500',
    cyan: 'from-cyan-400 to-blue-600',
    amber: 'from-amber-400 to-orange-500',
    violet: 'from-violet-400 to-purple-600',
  };

  const bgClasses = {
    emerald: 'from-emerald-500/10 to-cyan-500/10 border-emerald-500/20',
    cyan: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20',
    amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20',
    violet: 'from-violet-500/10 to-purple-500/10 border-violet-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`dashboard-card p-6 bg-gradient-to-br ${bgClasses[color]}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <p className="text-sm text-gray-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">{animatedValue.toLocaleString()}</p>
    </motion.div>
  );
}

// Traffic Forecast Chart
function TrafficForecastChart() {
  const hours = ['6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm', '10pm'];
  const values = [30, 75, 90, 65, 55, 85, 95, 70, 45];

  const maxValue = Math.max(...values);

  return (
    <div className="flex items-end justify-between h-32 px-2">
      {hours.map((hour, idx) => (
        <motion.div
          key={hour}
          initial={{ height: 0 }}
          animate={{ height: `${values[idx]}%` }}
          transition={{ delay: idx * 0.05, duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center gap-2 flex-1"
        >
          <div className="relative w-full flex justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 + 0.3 }}
              className="w-3/4 max-w-[40px] rounded-t-lg bg-gradient-to-t from-emerald-500/50 to-cyan-500/50 hover:from-emerald-400 hover:to-cyan-400 transition-colors cursor-pointer"
              style={{ height: values[idx] }}
            />
          </div>
          <span className="text-[10px] text-gray-500">{hour}</span>
        </motion.div>
      ))}
    </div>
  );
}

// Recent Report Item
function RecentReportItem({
  type,
  status,
  location,
  time,
}: {
  type: string;
  status: 'pending' | 'reviewing' | 'resolved';
  location: string;
  time: string;
}) {
  const statusColors = {
    pending: 'badge-warning',
    reviewing: 'badge-info',
    resolved: 'badge-success',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
    >
      <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
        <AlertCircle className="w-4 h-4 text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white">{type}</p>
          <span className={`badge ${statusColors[status]}`}>{status}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{location}</span>
          <span className="w-1 h-1 rounded-full bg-gray-600" />
          <Clock className="w-3 h-3" />
          {time}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
    </motion.div>
  );
}

export default function CitizenDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { title: 'Current Speed', value: 45, label: 'km/h avg', icon: Car, color: 'emerald' as const },
    { title: 'Your ETA', value: 18, label: 'minutes', icon: Clock, color: 'cyan' as const },
    { title: 'Available Parking', value: 127, label: 'nearby', icon: MapPin, color: 'amber' as const },
    { title: 'Your Reports', value: 5, label: 'this month', icon: AlertCircle, color: 'violet' as const },
  ];

  const recentReports = [
    { type: 'Traffic Jam', status: 'reviewing' as const, location: 'Main Street & 5th Ave', time: '2 hours ago' },
    { type: 'Pothole', status: 'pending' as const, location: 'Commerce Street', time: '1 day ago' },
    { type: 'Broken Signal', status: 'resolved' as const, location: 'Highway 101 Exit', time: '3 days ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl overflow-hidden relative"
      >
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 rounded-full blur-2xl" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Good afternoon, Citizen!
            </h1>
            <p className="text-gray-400">
              Traffic is flowing smoothly in your area. No major incidents reported.
            </p>
          </div>
          <Link href="/dashboard/report">
            <MotionButton
              variant="success"
              size="lg"
              leftIcon={<AlertCircle className="w-5 h-5" />}
            >
              Report Incident
            </MotionButton>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <StatCard key={stat.title} {...stat} delay={idx * 0.1} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Traffic Map Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2 dashboard-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Traffic Map</h2>
              <p className="text-sm text-gray-400">Real-time road conditions</p>
            </div>
            <Link href="/dashboard/map">
              <MotionButton variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                Full Map
              </MotionButton>
            </Link>
          </div>
          <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden relative">
            {mounted && <TrafficScene />}
            {/* Location Overlay */}
            <div className="absolute bottom-4 left-4 glass rounded-lg px-3 py-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-white">Downtown District</span>
            </div>
          </div>
        </motion.div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="dashboard-card p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/dashboard/routes">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                    <Route className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Plan Route</p>
                    <p className="text-xs text-gray-400">Find optimal paths</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                </div>
              </Link>
              <Link href="/dashboard/parking">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                    <Car className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Find Parking</p>
                    <p className="text-xs text-gray-400">127 spots nearby</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                </div>
              </Link>
              <Link href="/dashboard/alerts">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
                  <div className="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
                    <Bell className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">My Alerts</p>
                    <p className="text-xs text-gray-400">2 new notifications</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                </div>
              </Link>
            </div>
          </motion.div>

          {/* Emergency Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Emergency?</p>
                <p className="text-xs text-gray-400">Call 911 for immediate help</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Traffic Forecast & Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Forecast */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="dashboard-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Traffic Forecast</h2>
              <p className="text-sm text-gray-400">Predicted congestion today</p>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium">
              <TrendingUp className="w-3 h-3" />
              Light traffic
            </div>
          </div>
          <TrafficForecastChart />
        </motion.div>

        {/* Recent Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="dashboard-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Your Reports</h2>
              <p className="text-sm text-gray-400">Recent incident reports</p>
            </div>
            <Link href="/dashboard/history">
              <MotionButton variant="ghost" size="sm">View All</MotionButton>
            </Link>
          </div>
          <div className="space-y-3">
            {recentReports.map((report, idx) => (
              <RecentReportItem key={idx} {...report} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
