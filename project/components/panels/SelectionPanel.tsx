'use client';

import { useTrafficStore } from '@/store/trafficStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

function RoadInfo({ road }: { road: any }) {
  const congestionColor = useMemo(() => {
    switch (road.congestion) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'heavy': return 'text-orange-400';
      case 'blocked': return 'text-red-500';
      default: return 'text-gray-400';
    }
  }, [road.congestion]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{road.name}</h3>
        <span className="text-xs text-gray-500 capitalize px-2 py-1 rounded bg-white/5">
          {road.type}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass-light rounded-lg p-3">
          <div className="text-xs text-gray-400">Traffic Density</div>
          <div className="text-xl font-bold text-cyan-400">
            {Math.round(road.trafficDensity * 100)}%
          </div>
          <div className="mt-1 h-1 bg-gray-700 rounded overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${road.trafficDensity * 100}%` } }
              className="h-full bg-cyan-400"
            />
          </div>
        </div>

        <div className="glass-light rounded-lg p-3">
          <div className="text-xs text-gray-400">Average Speed</div>
          <div className="text-xl font-bold text-blue-400">
            {road.averageSpeed.toFixed(1)} km/h
          </div>
          <div className="text-xs text-gray-500">Limit: {road.speedLimit} km/h</div>
        </div>

        <div className="glass-light rounded-lg p-3">
          <div className="text-xs text-gray-400">Vehicle Count</div>
          <div className="text-xl font-bold text-purple-400">
            {road.vehicleCount}
          </div>
          <div className="text-xs text-gray-500">{road.lanes} lanes</div>
        </div>

        <div className="glass-light rounded-lg p-3">
          <div className="text-xs text-gray-400">Predicted Delay</div>
          <div className={`text-xl font-bold ${congestionColor}`}>
            {road.predictedDelay.toFixed(1)} min
          </div>
          <div className={`text-xs capitalize ${congestionColor}`}>
            {road.congestion} congestion
          </div>
        </div>
      </div>

      <div className="p-3 glass-light rounded-lg">
        <div className="text-xs text-gray-400 mb-2">AI Suggestion</div>
        <p className="text-sm text-gray-300">
          {road.congestion === 'heavy'
            ? 'Consider routing traffic through alternate roads. Expected clearance in 45 minutes.'
            : road.congestion === 'medium'
            ? 'Moderate traffic. Consider slightly increasing signal cycle time.'
            : 'Traffic flowing normally. No action needed.'
          }
        </p>
      </div>
    </div>
  );
}

function VehicleInfo({ vehicle }: { vehicle: any }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
        </h3>
        <span
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: vehicle.color + '20',
            color: vehicle.color,
          }}
        >
          {vehicle.license}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass-light rounded-lg p-3">
          <div className="text-xs text-gray-400">Current Speed</div>
          <div className="text-xl font-bold text-cyan-400">
            {vehicle.speed.toFixed(1)} km/h
          </div>
        </div>

        <div className="glass-light rounded-lg p-3">
          <div className="text-xs text-gray-400">Destination</div>
          <div className="text-xl font-bold text-purple-400">
            {vehicle.destination || 'N/A'}
          </div>
        </div>

        <div className="glass-light rounded-lg p-3">
          <div className="text-xs text-gray-400">Status</div>
          <div className={`text-lg font-semibold ${
            vehicle.status === 'moving' ? 'text-green-400' :
            vehicle.status === 'stopped' ? 'text-yellow-400' :
            vehicle.status === 'emergency' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
          </div>
        </div>

        <div className="glass-light rounded-lg p-3">
          <div className="text-xs text-gray-400">ETA</div>
          <div className="text-xl font-bold text-blue-400">
            {vehicle.eta ? `${vehicle.eta} min` : 'N/A'}
          </div>
        </div>
      </div>

      {vehicle.type === 'emergency' && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="text-xs text-red-400 mb-1">Emergency Vehicle</div>
          <p className="text-sm text-gray-300">
            Priority routing active. Other vehicles should yield.
          </p>
        </div>
      )}
    </div>
  );
}

function SignalInfo({ signal }: { signal: any }) {
  const stateColors: Record<string, { bg: string; text: string; glow: string }> = {
    green: { bg: 'bg-green-500/20', text: 'text-green-400', glow: 'shadow-green-500/50' },
    yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', glow: 'shadow-yellow-500/50' },
    red: { bg: 'bg-red-500/20', text: 'text-red-400', glow: 'shadow-red-500/50' },
  };

  const colors = stateColors[signal.state] || stateColors.red;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Traffic Signal</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text} shadow-lg ${colors.glow}`}>
          {signal.state.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass-light rounded-lg p-3">
          <div className="text-xs text-gray-400">Timer</div>
          <div className="text-2xl font-bold text-white font-mono">
            {signal.timer}s
          </div>
        </div>

        <div className="glass-light rounded-lg p-3">
          <div className="text-xs text-gray-400">Cycle Time</div>
          <div className="text-xl font-bold text-gray-300">
            {signal.cycleTime}s
          </div>
        </div>

        <div className="col-span-2 glass-light rounded-lg p-3">
          <div className="text-xs text-gray-400">Congestion Level</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-2 bg-gray-700 rounded overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${signal.congestion * 100}%` }}
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
              />
            </div>
            <span className="text-sm text-gray-300">
              {Math.round(signal.congestion * 100)}%
            </span>
          </div>
        </div>
      </div>

      {signal.aiRecommendation && (
        <div className="p-3 glass-light rounded-lg">
          <div className="text-xs text-cyan-400 mb-1">AI Recommendation</div>
          <p className="text-sm text-gray-300">{signal.aiRecommendation}</p>
        </div>
      )}
    </div>
  );
}

function AccidentInfo({ accident }: { accident: any }) {
  const severityColors = {
    minor: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Minor' },
    moderate: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Moderate' },
    severe: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Severe' },
  };

  const colors = severityColors[accident.severity as keyof typeof severityColors];
  const formattedTime = new Date(accident.timestamp).toLocaleTimeString();
  const clearTime = accident.estimatedClearTime
    ? new Date(accident.estimatedClearTime).toLocaleTimeString()
    : 'Unknown';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          {accident.type.charAt(0).toUpperCase() + accident.type.slice(1)}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
          {colors.label}
        </span>
      </div>

      <div className="p-3 glass-light rounded-lg">
        <p className="text-sm text-gray-300">{accident.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass-light rounded-lg p-3">
          <div className="text-xs text-gray-400">Reported</div>
          <div className="text-sm text-white">{formattedTime}</div>
        </div>

        <div className="glass-light rounded-lg p-3">
          <div className="text-xs text-gray-400">Est. Clear</div>
          <div className="text-sm text-white">{clearTime}</div>
        </div>

        <div className="glass-light rounded-lg p-3">
          <div className="text-xs text-gray-400">Status</div>
          <div className={`text-sm font-medium ${
            accident.status === 'active' ? 'text-red-400' :
            accident.status === 'responding' ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {accident.status.charAt(0).toUpperCase() + accident.status.slice(1)}
          </div>
        </div>

        <div className="glass-light rounded-lg p-3">
          <div className="text-xs text-gray-400">Responders</div>
          <div className="text-sm text-white">{accident.responders?.join(', ') || 'None'}</div>
        </div>
      </div>

      {accident.status === 'active' && (
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
          <div className="text-xs text-cyan-400 mb-1">Suggested Routes</div>
          <p className="text-sm text-gray-300">Use Park Lane as alternate. Avoid Main Boulevard between Commerce and Industrial.</p>
        </div>
      )}
    </div>
  );
}

export function SelectionPanel() {
  const { selectedObject, selectedType, clearSelection } = useTrafficStore();

  if (!selectedObject || !selectedType) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className="fixed right-4 top-24 z-30 w-80"
      >
        <div className="glass rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs text-gray-400 capitalize">{selectedType}</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearSelection}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>

          <div className="p-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
            {selectedType === 'road' && <RoadInfo road={selectedObject} />}
            {selectedType === 'vehicle' && <VehicleInfo vehicle={selectedObject} />}
            {selectedType === 'signal' && <SignalInfo signal={selectedObject} />}
            {selectedType === 'accident' && <AccidentInfo accident={selectedObject} />}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
