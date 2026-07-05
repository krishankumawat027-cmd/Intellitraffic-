'use client';

import { useTrafficStore } from '@/store/trafficStore';
import { motion } from 'framer-motion';
import type { ViewMode, TimeSpeed, WeatherType } from '@/types/traffic';

const viewModes: { id: ViewMode; label: string; icon: string }[] = [
  { id: 'orbit', label: 'Orbit', icon: '🔄' },
  { id: 'flyover', label: 'Flyover', icon: '✈️' },
  { id: 'follow', label: 'Follow', icon: '🎯' },
  { id: 'free', label: 'Free', icon: '🎮' },
];

const timeSpeeds: TimeSpeed[] = [0.5, 1, 2, 5, 10];
const weatherTypes: { id: WeatherType; label: string; icon: string }[] = [
  { id: 'clear', label: 'Clear', icon: '☀️' },
  { id: 'cloudy', label: 'Cloudy', icon: '☁️' },
  { id: 'rain', label: 'Rain', icon: '🌧️' },
  { id: 'fog', label: 'Fog', icon: '🌫️' },
  { id: 'storm', label: 'Storm', icon: '⛈️' },
];

export function Controls() {
  const {
    viewMode, setViewMode,
    timeSpeed, setTimeSpeed,
    weather, updateWeather,
    toggleFlyover,
    flyoverActive,
  } = useTrafficStore();

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-20">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass rounded-xl p-3 space-y-4"
      >
        <div>
          <div className="text-xs text-gray-400 mb-2 px-1">View Mode</div>
          <div className="space-y-1">
            {viewModes.map((mode) => (
              <motion.button
                key={mode.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setViewMode(mode.id);
                  if (mode.id === 'flyover') toggleFlyover();
                }}
                className={`w-full px-3 py-2 rounded-lg text-left text-sm flex items-center gap-2 transition-colors ${
                  viewMode === mode.id
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'hover:bg-white/5 text-gray-300'
                }`}
              >
                <span>{mode.icon}</span>
                <span>{mode.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="h-px bg-white/10" />

        <div>
          <div className="text-xs text-gray-400 mb-2 px-1">Time Speed</div>
          <div className="flex gap-1">
            {timeSpeeds.map((speed) => (
              <motion.button
                key={speed}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTimeSpeed(speed)}
                className={`px-2 py-1 rounded text-xs ${
                  timeSpeed === speed
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'hover:bg-white/5 text-gray-300'
                }`}
              >
                {speed}x
              </motion.button>
            ))}
          </div>
        </div>

        <div className="h-px bg-white/10" />

        <div>
          <div className="text-xs text-gray-400 mb-2 px-1">Time of Day</div>
          <input
            type="range"
            min="0"
            max="23"
            value={useTrafficStore.getState().timeOfDay.hour}
            onChange={(e) => useTrafficStore.getState().updateTimeOfDay(parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-700"
          />
        </div>

        <div className="h-px bg-white/10" />

        <div>
          <div className="text-xs text-gray-400 mb-2 px-1">Weather</div>
          <div className="grid grid-cols-2 gap-1">
            {weatherTypes.map((w) => (
              <motion.button
                key={w.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateWeather({ type: w.id, intensity: w.id === 'clear' ? 0 : 0.5 })}
                className={`px-2 py-1.5 rounded-lg text-xs flex items-center gap-1 justify-center ${
                  weather.type === w.id
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'hover:bg-white/5 text-gray-300'
                }`}
              >
                <span>{w.icon}</span>
                <span className="hidden">{w.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
