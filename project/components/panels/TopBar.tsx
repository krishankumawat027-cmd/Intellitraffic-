'use client';

import { useTrafficStore } from '@/store/trafficStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

function StatCard({ label, value, unit, trend, color }: {
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    stable: 'text-gray-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-lg px-4 py-2 min-w-[140px]"
    >
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${color || 'text-white'}`}>
          {value}
        </span>
        {unit && <span className="text-xs text-gray-500">{unit}</span>}
        {trend && (
          <span className={`ml-2 text-xs ${trendColors[trend]}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function TopBar() {
  const { stats, timeOfDay, weather, toggleAnalytics } = useTrafficStore();

  const formattedTime = useMemo(() => {
    const hour = timeOfDay.hour.toString().padStart(2, '0');
    const minute = timeOfDay.minute.toString().padStart(2, '0');
    return `${hour}:${minute}`;
  }, [timeOfDay]);

  const congestionColor = useMemo(() => {
    if (stats.congestionIndex < 0.3) return 'text-green-400';
    if (stats.congestionIndex < 0.6) return 'text-yellow-400';
    return 'text-red-400';
  }, [stats.congestionIndex]);

  return (
    <div className="fixed top-0 left-0 right-0 z-20 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-xl px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">IntelliTraffic AI</h1>
                <p className="text-xs text-gray-400">Smart Traffic Intelligence</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center gap-3 flex-1 justify-center">
          <StatCard
            label="Active Vehicles"
            value={stats.totalVehicles}
            color="text-cyan-400"
          />
          <StatCard
            label="Avg Speed"
            value={stats.averageSpeed.toFixed(0)}
            unit="km/h"
            trend="stable"
            color="text-blue-400"
          />
          <StatCard
            label="Congestion"
            value={(stats.congestionIndex * 100).toFixed(0)}
            unit="%"
            trend={stats.congestionIndex > 0.5 ? 'up' : 'down'}
            color={congestionColor}
          />
          <StatCard
            label="Incidents"
            value={stats.incidents}
            color={stats.incidents > 0 ? 'text-orange-400' : 'text-green-400'}
          />
          <StatCard
            label="Flow Rate"
            value={stats.flowRate}
            unit="veh/h"
            color="text-purple-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-xl px-4 py-2"
          >
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-mono text-white">{formattedTime}</div>
                <div className="text-xs text-gray-400">{timeOfDay.isDay ? 'Day' : 'Night'}</div>
              </div>

              <div className="w-px h-8 bg-white/10" />

              <div className="text-center">
                <div className="flex items-center gap-1">
                  {weather.type === 'clear' && <span className="text-yellow-400">☀️</span>}
                  {weather.type === 'cloudy' && <span className="text-gray-400">☁️</span>}
                  {weather.type === 'rain' && <span className="text-blue-400">🌧️</span>}
                  {weather.type === 'fog' && <span className="text-gray-300">🌫️</span>}
                  {weather.type === 'storm' && <span className="text-purple-400">⛈️</span>}
                  <span className="text-sm text-white">{weather.temperature}°C</span>
                </div>
                <div className="text-xs text-gray-400 capitalize">{weather.type}</div>
              </div>
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {}}
            className="glass rounded-lg px-3 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
