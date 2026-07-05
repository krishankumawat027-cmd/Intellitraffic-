'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';

interface EmergencyAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  location_address: string | null;
  status: string;
  broadcast_sent: boolean;
  responders: string[] | null;
  created_at: string;
}

const alertTypes = [
  { id: 'accident', label: 'Accident', icon: '🚨' },
  { id: 'fire', label: 'Fire', icon: '🔥' },
  { id: 'medical', label: 'Medical', icon: '🚑' },
  { id: 'security', label: 'Security', icon: '🛡️' },
  { id: 'natural_disaster', label: 'Natural Disaster', icon: '🌊' },
];

const severityLevels = ['minor', 'moderate', 'severe', 'critical'];

export default function EmergencyAlertsPage() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { profile } = useAuthStore();

  const [formData, setFormData] = useState({
    type: 'accident',
    severity: 'moderate',
    title: '',
    description: '',
    location_address: '',
  });

  useEffect(() => {
    loadAlerts();

    const channel = supabase
      .channel('alerts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_alerts' }, () => {
        loadAlerts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadAlerts() {
    try {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('emergency_alerts')
        .insert({
          type: formData.type,
          severity: formData.severity,
          title: formData.title,
          description: formData.description,
          location_address: formData.location_address || null,
          status: 'active',
          created_by: profile.user_id,
        });

      if (error) throw error;

      setShowForm(false);
      setFormData({ type: 'accident', severity: 'moderate', title: '', description: '', location_address: '' });
      loadAlerts();
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const { error } = await supabase
        .from('emergency_alerts')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      loadAlerts();
    } catch (error) {
      console.error('Error updating alert:', error);
    }
  }

  async function broadcastAlert(id: string) {
    try {
      const { error } = await supabase
        .from('emergency_alerts')
        .update({ broadcast_sent: true })
        .eq('id', id);

      if (error) throw error;

      // Create notification for all users
      const alert = alerts.find(a => a.id === id);
      if (alert) {
        await supabase.from('notifications').insert({
          type: 'alert',
          title: `Emergency: ${alert.title}`,
          message: alert.description,
          target_role: 'all',
          priority: alert.severity === 'critical' ? 'critical' : 'high',
        });
      }

      loadAlerts();
    } catch (error) {
      console.error('Error broadcasting alert:', error);
    }
  }

  const stats = {
    active: alerts.filter(a => a.status === 'active').length,
    responding: alerts.filter(a => a.status === 'responding').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    critical: alerts.filter(a => a.severity === 'critical' && a.status === 'active').length,
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
          <h1 className="text-2xl font-bold text-white">Emergency Alerts</h1>
          <p className="text-gray-400">Manage and broadcast emergency alerts</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-600 text-white font-medium"
        >
          🚨 Create Alert
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active', value: stats.active, color: 'red' },
          { label: 'Responding', value: stats.responding, color: 'yellow' },
          { label: 'Resolved', value: stats.resolved, color: 'green' },
          { label: 'Critical', value: stats.critical, color: 'red' },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4 text-center">
            <p className="text-xs text-gray-400">{stat.label}</p>
            <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <span className="text-4xl block mb-4">🔔</span>
            <p className="text-gray-400">No emergency alerts</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const typeInfo = alertTypes.find(t => t.id === alert.type) || { icon: '⚠️' };
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass rounded-xl p-5 ${
                  alert.severity === 'critical' ? 'ring-2 ring-red-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                      alert.status === 'active' ? 'bg-red-500/20 animate-pulse' :
                      alert.status === 'responding' ? 'bg-yellow-500/20' :
                      'bg-gray-500/20'
                    }`}>
                      {typeInfo.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium">{alert.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          alert.severity === 'critical' ? 'bg-red-500 text-white' :
                          alert.severity === 'severe' ? 'bg-orange-500/20 text-orange-400' :
                          alert.severity === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          alert.status === 'active' ? 'bg-red-500/20 text-red-400' :
                          alert.status === 'responding' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {alert.status}
                        </span>
                        {alert.broadcast_sent && (
                          <span className="px-2 py-0.5 rounded text-xs bg-cyan-500/20 text-cyan-400">
                            Broadcasted
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{alert.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="capitalize">{alert.type.replace('_', ' ')}</span>
                        {alert.location_address && <span>📍 {alert.location_address}</span>}
                        <span>📅 {new Date(alert.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {alert.status === 'active' && (
                      <>
                        <button
                          onClick={() => broadcastAlert(alert.id)}
                          disabled={alert.broadcast_sent}
                          className="px-3 py-1 text-xs rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-50"
                        >
                          {alert.broadcast_sent ? 'Sent' : 'Broadcast'}
                        </button>
                        <button
                          onClick={() => updateStatus(alert.id, 'responding')}
                          className="px-3 py-1 text-xs rounded bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                        >
                          Responding
                        </button>
                      </>
                    )}
                    {alert.status === 'responding' && (
                      <button
                        onClick={() => updateStatus(alert.id, 'resolved')}
                        className="px-3 py-1 text-xs rounded bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create Form Modal */}
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
              <h2 className="text-xl font-bold text-white mb-4">Create Emergency Alert</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none"
                    >
                      {alertTypes.map((t) => (
                        <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Severity</label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none"
                    >
                      {severityLevels.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location_address}
                    onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-600 text-white font-medium"
                  >
                    Create Alert
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
