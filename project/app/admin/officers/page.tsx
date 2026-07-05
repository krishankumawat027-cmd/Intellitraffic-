'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';

interface Officer {
  id: string;
  name: string;
  badge_number: string;
  rank: string;
  status: string;
  assigned_area: string | null;
  contact_number: string | null;
  profile_image: string | null;
  location_lat: number | null;
  location_lng: number | null;
  user_id: string | null;
  created_at: string;
}

const ranks = ['officer', 'senior_officer', 'supervisor', 'commander'];
const statuses = ['available', 'on_duty', 'off_duty', 'break', 'emergency'];

export default function OfficersManagementPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    badge_number: '',
    rank: 'officer',
    status: 'available',
    assigned_area: '',
    contact_number: '',
  });
  const { profile } = useAuthStore();

  useEffect(() => {
    loadOfficers();

    const channel = supabase
      .channel('officers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'officers' }, () => {
        loadOfficers();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadOfficers() {
    try {
      const { data, error } = await supabase
        .from('officers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOfficers(data || []);
    } catch (error) {
      console.error('Error loading officers:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    try {
      if (editingOfficer) {
        const { error } = await supabase
          .from('officers')
          .update({
            name: formData.name,
            badge_number: formData.badge_number,
            rank: formData.rank,
            status: formData.status,
            assigned_area: formData.assigned_area || null,
            contact_number: formData.contact_number || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingOfficer.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('officers')
          .insert({
            name: formData.name,
            badge_number: formData.badge_number,
            rank: formData.rank,
            status: formData.status,
            assigned_area: formData.assigned_area || null,
            contact_number: formData.contact_number || null,
          });

        if (error) throw error;
      }

      setShowForm(false);
      setEditingOfficer(null);
      setFormData({ name: '', badge_number: '', rank: 'officer', status: 'available', assigned_area: '', contact_number: '' });
      loadOfficers();
    } catch (error) {
      console.error('Error saving officer:', error);
    }
  }

  async function deleteOfficer(id: string) {
    if (!confirm('Are you sure you want to remove this officer?')) return;

    try {
      const { error } = await supabase.from('officers').delete().eq('id', id);
      if (error) throw error;
      loadOfficers();
    } catch (error) {
      console.error('Error deleting officer:', error);
    }
  }

  function startEdit(officer: Officer) {
    setEditingOfficer(officer);
    setFormData({
      name: officer.name,
      badge_number: officer.badge_number,
      rank: officer.rank,
      status: officer.status,
      assigned_area: officer.assigned_area || '',
      contact_number: officer.contact_number || '',
    });
    setShowForm(true);
  }

  async function updateStatus(id: string, status: string) {
    try {
      const { error } = await supabase
        .from('officers')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      loadOfficers();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  const stats = {
    total: officers.length,
    available: officers.filter(o => o.status === 'available').length,
    onDuty: officers.filter(o => o.status === 'on_duty').length,
    offDuty: officers.filter(o => o.status === 'off_duty').length,
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
          <h1 className="text-2xl font-bold text-white">Officer Management</h1>
          <p className="text-gray-400">Manage traffic officers and their assignments</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setShowForm(true); setEditingOfficer(null); }}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium"
        >
          + Add Officer
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Officers', value: stats.total, color: 'cyan' },
          { label: 'Available', value: stats.available, color: 'green' },
          { label: 'On Duty', value: stats.onDuty, color: 'yellow' },
          { label: 'Off Duty', value: stats.offDuty, color: 'gray' },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4 text-center">
            <p className="text-xs text-gray-400">{stat.label}</p>
            <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Officer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {officers.map((officer) => (
          <motion.div
            key={officer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-5"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-medium">
                {officer.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-medium">{officer.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    officer.status === 'available' ? 'bg-green-500/20 text-green-400' :
                    officer.status === 'on_duty' ? 'bg-yellow-500/20 text-yellow-400' :
                    officer.status === 'emergency' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {officer.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Badge: {officer.badge_number}</p>
                <p className="text-xs text-cyan-400 capitalize">{officer.rank.replace('_', ' ')}</p>
                {officer.assigned_area && (
                  <p className="text-xs text-gray-500 mt-1">📍 {officer.assigned_area}</p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <select
                value={officer.status}
                onChange={(e) => updateStatus(officer.id, e.target.value)}
                className="px-2 py-1 text-xs rounded bg-white/5 border border-white/10 text-white focus:outline-none"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(officer)}
                  className="px-3 py-1 text-xs rounded bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteOfficer(officer.id)}
                  className="px-3 py-1 text-xs rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
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
              className="glass rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">
                {editingOfficer ? 'Edit Officer' : 'Add New Officer'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Badge Number</label>
                  <input
                    type="text"
                    value={formData.badge_number}
                    onChange={(e) => setFormData({ ...formData, badge_number: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Rank</label>
                    <select
                      value={formData.rank}
                      onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none"
                    >
                      {ranks.map((r) => (
                        <option key={r} value={r}>{r.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Assigned Area</label>
                  <input
                    type="text"
                    value={formData.assigned_area}
                    onChange={(e) => setFormData({ ...formData, assigned_area: e.target.value })}
                    placeholder="e.g., Downtown, Highway 101"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Contact Number</label>
                  <input
                    type="tel"
                    value={formData.contact_number}
                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
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
                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium"
                  >
                    {editingOfficer ? 'Update' : 'Add Officer'}
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
