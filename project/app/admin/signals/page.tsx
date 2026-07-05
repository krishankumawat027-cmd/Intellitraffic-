'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/auth';
import { useTrafficStore } from '@/store/trafficStore';

export default function TrafficSignalsPage() {
  const { signals: gameSignals } = useTrafficStore();
  const [dbSignals, setDbSignals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSignal, setSelectedSignal] = useState<any | null>(null);

  useEffect(() => {
    loadSignals();

    const channel = supabase
      .channel('signals-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'signal_management' }, () => {
        loadSignals();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadSignals() {
    try {
      const { data, error } = await supabase
        .from('signal_management')
        .select('*')
        .order('signal_id');

      if (error) throw error;

      if (!data || data.length === 0) {
        // Initialize from game signals
        const initialSignals = gameSignals.map((s, i) => ({
          signal_id: s.id,
          name: `Intersection ${i + 1}`,
          current_state: s.state,
          cycle_time_green: 25,
          cycle_time_red: 30,
          congestion_level: s.congestion,
          ai_recommendation: null,
        }));

        await supabase.from('signal_management').insert(initialSignals);
        setDbSignals(initialSignals);
      } else {
        setDbSignals(data);
      }
    } catch (error) {
      // Use game signals as fallback
      setDbSignals(gameSignals.map((s, i) => ({
        id: i,
        signal_id: s.id,
        name: `Intersection ${i + 1}`,
        current_state: s.state,
        cycle_time_green: 25,
        cycle_time_red: 30,
        congestion_level: s.congestion,
        ai_recommendation: null,
      })));
    } finally {
      setIsLoading(false);
    }
  }

  async function updateSignalState(id: string, state: string) {
    try {
      await supabase
        .from('signal_management')
        .update({ current_state: state, last_updated: new Date().toISOString() })
        .eq('id', id);
    } catch (error) {
      console.error('Error updating signal:', error);
    }
  }

  async function toggleEmergencyCorridor(id: string, value: boolean) {
    try {
      await supabase
        .from('signal_management')
        .update({ is_emergency_corridor: value, last_updated: new Date().toISOString() })
        .eq('id', id);
    } catch (error) {
      console.error('Error updating corridor:', error);
    }
  }

  async function updateCycleTimes(id: string, green: number, red: number) {
    try {
      await supabase
        .from('signal_management')
        .update({
          cycle_time_green: green,
          cycle_time_red: red,
          last_updated: new Date().toISOString(),
        })
        .eq('id', id);
    } catch (error) {
      console.error('Error updating cycle times:', error);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Traffic Signals Management</h1>
          <p className="text-gray-400">Monitor and control traffic signals across the city</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium"
          onClick={() => {/* Create green corridor modal */}}
        >
          🚨 Create Green Corridor
        </motion.button>
      </div>

      {/* Signal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {dbSignals.map((signal, idx) => (
          <motion.div
            key={signal.id || idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass rounded-xl p-4 ${signal.is_emergency_corridor ? 'ring-2 ring-red-500' : ''}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-medium">{signal.name || `Signal ${idx + 1}`}</h3>
                <p className="text-xs text-gray-400">{signal.signal_id}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  signal.current_state === 'green' ? 'bg-green-500' :
                  signal.current_state === 'yellow' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`}>
                  {signal.current_state === 'green' ? 'G' : signal.current_state === 'yellow' ? 'Y' : 'R'}
                </div>
              </div>
            </div>

            {/* Congestion Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400">Congestion</span>
                <span className="text-white">{Math.round((signal.congestion_level || 0) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    signal.congestion_level > 0.7 ? 'bg-red-500' :
                    signal.congestion_level > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(signal.congestion_level || 0) * 100}%` }}
                />
              </div>
            </div>

            {/* Cycle Times */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-2 rounded bg-white/5 text-center">
                <p className="text-xs text-gray-400">Green</p>
                <p className="text-lg font-bold text-green-400">{signal.cycle_time_green || 25}s</p>
              </div>
              <div className="p-2 rounded bg-white/5 text-center">
                <p className="text-xs text-gray-400">Red</p>
                <p className="text-lg font-bold text-red-400">{signal.cycle_time_red || 45}s</p>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => updateSignalState(signal.id, 'green')}
                  className="flex-1 py-1.5 text-xs rounded bg-green-500/20 text-green-400 hover:bg-green-500/30"
                >
                  Force Green
                </button>
                <button
                  onClick={() => updateSignalState(signal.id, 'red')}
                  className="flex-1 py-1.5 text-xs rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                >
                  Force Red
                </button>
              </div>

              {signal.is_emergency_corridor && (
                <div className="p-2 rounded bg-red-500/20 text-red-400 text-xs text-center">
                  🚨 Emergency Corridor Active
                </div>
              )}
            </div>

            {/* AI Recommendation */}
            {signal.ai_recommendation && (
              <div className="mt-3 p-2 rounded bg-cyan-500/10 text-cyan-400 text-xs">
                💡 AI: {signal.ai_recommendation}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
