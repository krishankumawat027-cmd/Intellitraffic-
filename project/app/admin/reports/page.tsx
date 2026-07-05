'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';

interface CitizenReport {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  image_url: string | null;
  location_address: string | null;
  status: string;
  priority: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  created_at: string;
  profiles?: { full_name: string; email: string } | null;
}

const reportTypes: Record<string, { label: string; icon: string; color: string }> = {
  accident: { label: 'Accident', icon: '🚨', color: 'red' },
  traffic_jam: { label: 'Traffic Jam', icon: '🚗', color: 'yellow' },
  broken_signal: { label: 'Broken Signal', icon: '🚦', color: 'orange' },
  road_damage: { label: 'Road Damage', icon: '🔧', color: 'gray' },
  illegal_parking: { label: 'Illegal Parking', icon: '🅿️', color: 'purple' },
  flood: { label: 'Flood', icon: '🌊', color: 'blue' },
  construction: { label: 'Construction', icon: '🏗️', color: 'amber' },
};

export default function CitizenReportsPage() {
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const { profile } = useAuthStore();

  useEffect(() => {
    loadReports();

    const channel = supabase
      .channel('reports-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'citizen_reports' }, () => {
        loadReports();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadReports() {
    try {
      const { data, error } = await supabase
        .from('citizen_reports')
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateReportStatus(id: string, status: string, notes?: string) {
    try {
      const updates: any = {
        status,
        reviewed_by: profile?.user_id,
        reviewed_at: new Date().toISOString(),
      };

      if (notes) updates.admin_notes = notes;

      const { error } = await supabase
        .from('citizen_reports')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setReports(reports.map(r => r.id === id ? { ...r, status, admin_notes: notes ?? null } : r));
      setSelectedReport(null);
    } catch (error) {
      console.error('Error updating report:', error);
    }
  }

  const filteredReports = reports.filter(r => filter === 'all' || r.status === filter);

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    approved: reports.filter(r => r.status === 'approved').length,
    rejected: reports.filter(r => r.status === 'rejected').length,
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
          <h1 className="text-2xl font-bold text-white">Citizen Reports</h1>
          <p className="text-gray-400">Review and manage incident reports from citizens</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'cyan' },
          { label: 'Pending', value: stats.pending, color: 'yellow' },
          { label: 'Approved', value: stats.approved, color: 'green' },
          { label: 'Rejected', value: stats.rejected, color: 'red' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass rounded-xl p-4 text-center cursor-pointer ${
              filter === stat.label.toLowerCase() ? 'ring-2 ring-cyan-500' : ''
            }`}
            onClick={() => setFilter(stat.label.toLowerCase() as any)}
          >
            <p className="text-2xl font-bold text-{stat.color}-400">{stat.value}</p>
            <p className="text-xs text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filteredReports.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center">
              <span className="text-4xl mb-4 block">📋</span>
              <p className="text-gray-400">No reports found</p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const typeInfo = reportTypes[report.type] || { label: report.type, icon: '📌', color: 'gray' };
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedReport(report)}
                  className={`glass rounded-xl p-4 cursor-pointer transition-all ${
                    selectedReport?.id === report.id ? 'ring-2 ring-cyan-500' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-{typeInfo.color}-500/20 flex items-center justify-center text-2xl">
                      {typeInfo.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium">{report.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          report.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          report.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          report.status === 'resolved' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {report.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          report.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                          report.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          report.priority === 'normal' ? 'bg-gray-500/20 text-gray-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {report.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">{report.description || 'No description'}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>👤 {report.profiles?.full_name || 'Anonymous'}</span>
                        <span>📍 {report.location_address || 'Location not specified'}</span>
                        <span>📅 {new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {report.image_url && (
                      <img src={report.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Detail Panel */}
        <div className="glass rounded-xl p-6 h-fit sticky top-6">
          {selectedReport ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Report Details</h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {selectedReport.image_url && (
                  <img src={selectedReport.image_url} alt="Report" className="w-full rounded-lg" />
                )}

                <div>
                  <p className="text-xs text-gray-400">Type</p>
                  <p className="text-white capitalize">{selectedReport.type.replace('_', ' ')}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Description</p>
                  <p className="text-white">{selectedReport.description || 'No description provided'}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Location</p>
                  <p className="text-white">{selectedReport.location_address || 'Not specified'}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Reported By</p>
                  <p className="text-white">{selectedReport.profiles?.full_name || 'Anonymous'}</p>
                  <p className="text-xs text-gray-400">{selectedReport.profiles?.email}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Created</p>
                  <p className="text-white">{new Date(selectedReport.created_at).toLocaleString()}</p>
                </div>

                {selectedReport.status === 'pending' && (
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <p className="text-sm text-gray-400 mb-2">Actions</p>
                    <div className="grid grid-cols-2 gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateReportStatus(selectedReport.id, 'approved')}
                        className="py-2 px-4 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-sm"
                      >
                        Approve
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateReportStatus(selectedReport.id, 'rejected')}
                        className="py-2 px-4 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm"
                      >
                        Reject
                      </motion.button>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateReportStatus(selectedReport.id, 'resolved')}
                      className="w-full py-2 px-4 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors text-sm"
                    >
                      Mark as Resolved
                    </motion.button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl block mb-4">📋</span>
              <p className="text-gray-400">Select a report to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
