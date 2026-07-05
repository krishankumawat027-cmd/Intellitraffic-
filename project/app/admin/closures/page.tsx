'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';

interface RoadClosure {
  id: string;
  road_name: string;
  reason: string;
  closure_type: string;
  start_time: string;
  end_time: string | null;
  status: string;
  location_x: number | null;
  location_z: number | null;
  affected_lanes: number;
  alternate_route: string | null;
  created_by: string | null;
  created_at: string;
}

export default function RoadClosuresPage() {
  const [closures, setClosures] = useState<RoadClosure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClosure, setEditingClosure] = useState<RoadClosure | null>(null);
  const { profile } = useAuthStore();

  const [formData, setFormData] = useState({
    road_name: '',
    reason: '',
    closure_type: 'full',
    start_time: '',
    end_time: '',
    affected_lanes: 0,
    alternate_route: '',
  });

  useEffect(() => {
    loadClosures();

    const channel = supabase
      .channel('closures-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'road_closures' }, () => {
        loadClosures();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadClosures() {
    try {
      const { data, error } = await supabase
        .from('road_closures')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClosures(data || []);
    } catch (error) {
      console.error('Error loading closures:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    try {
      if (editingClosure) {
        const { error } = await supabase
          .from('road_closures')
          .update({
            road_name: formData.road_name,
            reason: formData.reason,
            closure_type: formData.closure_type,
            start_time: formData.start_time,
            end_time: formData.end_time || null,
            affected_lanes: formData.affected_lanes,
            alternate_route: formData.alternate_route || null,
          })
          .eq('id', editingClosure.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('road_closures')
          .insert({
            road_name: formData.road_name,
            reason: formData.reason,
            closure_type: formData.closure_type,
            start_time: formData.start_time,
            end_time: formData.end_time || null,
            affected_lanes: formData.affected_lanes,
            alternate_route: formData.alternate_route || null,
            status: 'active',
            created_by: profile.user_id,
          });

        if (error) throw error;
      }

      setShowForm(false);
      setEditingClosure(null);
      resetForm();
      loadClosures();
    } catch (error) {
      console.error('Error saving closure:', error);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const { error } = await supabase
        .from('road_closures')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      loadClosures();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  function resetForm() {
    setFormData({
      road_name: '',
      reason: '',
      closure_type: 'full',
      start_time: '',
      end_time: '',
      affected_lanes: 0,
      alternate_route: '',
    });
  }

  const stats = {
    active: closures.filter(c => c.status === 'active').length,
    scheduled: closures.filter(c => c.status === 'scheduled').length,
    completed: closures.filter(c => c.status === 'completed').length,
  };

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
          <h1 className="text-2xl font-bold text-white">Road Closures</h1>
          <p className="text-gray-400">Manage road closures and restrictions</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setShowForm(true); setEditingClosure(null); resetForm(); }}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium"
        >
          + Add Closure
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active', value: stats.active, color: 'red' },
          { label: 'Scheduled', value: stats.scheduled, color: 'yellow' },
          { label: 'Completed', value: stats.completed, color: 'green' },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4 text-center">
            <p className="text-xs text-gray-400">{stat.label}</p>
            <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Closures List */}
      <div className="space-y-4">
        {closures.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <span className="text-4xl block mb-4">🚧</span>
            <p className="text-gray-400">No road closures found</p>
          </div>
        ) : (
          closures.map((closure) => (
            <motion.div
              key={closure.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center text-2xl">
                    🚧
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium">{closure.road_name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        closure.status === 'active' ? 'bg-red-500/20 text-red-400' :
                        closure.status === 'scheduled' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {closure.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        closure.closure_type === 'full' ? 'bg-red-500/30 text-red-300' :
                        closure.closure_type === 'partial' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {closure.closure_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{closure.reason}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>📅 Start: {new Date(closure.start_time).toLocaleString()}</span>
                      {closure.end_time && (
                        <span>⏰ End: {new Date(closure.end_time).toLocaleString()}</span>
                      )}
                      {closure.affected_lanes > 0 && (
                        <span>Lanes: {closure.affected_lanes}</span>
                      )}
                    </div>
                    {closure.alternate_route && (
                      <p className="text-xs text-cyan-400 mt-2">
                        ↪️ Alternate: {closure.alternate_route}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {closure.status === 'active' && (
                    <button
                      onClick={() => updateStatus(closure.id, 'completed')}
                      className="px-3 py-1 text-xs rounded bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    >
                      Reopen
                    </button>
                  )}
                  {closure.status === 'scheduled' && (
                    <button
                      onClick={() => updateStatus(closure.id, 'active')}
                      className="px-3 py-1 text-xs rounded bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                    >
                      Activate
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">
                {editingClosure ? 'Edit Closure' : 'Add Road Closure'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Road Name</label>
                  <input
                    type="text"
                    value={formData.road_name}
                    onChange={(e) => setFormData({ ...formData, road_name: e.target.value })}
                    placeholder="e.g., Main Boulevard"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Closure Type</label>
                  <select
                    value={formData.closure_type}
                    onChange={(e) => setFormData({ ...formData, closure_type: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="full">Full Closure</option>
                    <option value="partial">Partial Closure</option>
                    <option value="lane">Lane Closure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Reason</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Reason for closure..."
                    rows={2}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Start Time</label>
                    <input
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">End Time</label>
                    <input
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Affected Lanes</label>
                  <input
                    type="number"
                    value={formData.affected_lanes}
                    onChange={(e) => setFormData({ ...formData, affected_lanes: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Alternate Route</label>
                  <input
                    type="text"
                    value={formData.alternate_route}
                    onChange={(e) => setFormData({ ...formData, alternate_route: e.target.value })}
                    placeholder="e.g., Use Commerce Street"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium"
                  >
                    {editingClosure ? 'Update' : 'Create Closure'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
