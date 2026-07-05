'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/auth';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month'>('week');
  const [analytics, setAnalytics] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  async function loadAnalytics() {
    try {
      const hours = dateRange === 'day' ? 24 : dateRange === 'week' ? 168 : 720;
      const from = new Date(Date.now() - hours * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('analytics_log')
        .select('*')
        .gte('timestamp', from.toISOString())
        .order('timestamp', { ascending: true });

      if (error) throw error;
      setAnalytics(data || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  }

  const trafficData = analytics.filter(a => a.metric_type === 'vehicle_count').map(a => ({
    time: new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    value: a.metric_value,
  }));

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    vehicles: Math.floor(50 + Math.sin((i / 24) * Math.PI * 2) * 30 + Math.random() * 20),
    accidents: Math.floor(Math.random() * 5),
    congestion: Math.max(0, Math.min(100, 30 + Math.sin((i / 24) * Math.PI * 2) * 25 + Math.random() * 15)),
  }));

  const incidentData = [
    { name: 'Accidents', value: 45 },
    { name: 'Traffic Jams', value: 78 },
    { name: 'Broken Signals', value: 12 },
    { name: 'Road Damage', value: 23 },
    { name: 'Other', value: 34 },
  ];

  const weeklyData = [
    { day: 'Mon', traffic: 320, incidents: 12 },
    { day: 'Tue', traffic: 380, incidents: 15 },
    { day: 'Wed', traffic: 340, incidents: 10 },
    { day: 'Thu', traffic: 420, incidents: 18 },
    { day: 'Fri', traffic: 480, incidents: 25 },
    { day: 'Sat', traffic: 290, incidents: 8 },
    { day: 'Sun', traffic: 250, incidents: 6 },
  ];

  const kpis = [
    { label: 'Total Vehicles Today', value: '12,547', change: '+3.2%', positive: true },
    { label: 'Average Speed', value: '42 km/h', change: '-2.1%', positive: false },
    { label: 'Incidents Resolved', value: '89%', change: '+5.4%', positive: true },
    { label: 'Response Time', value: '8.5 min', change: '-12%', positive: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Traffic Analytics</h1>
          <p className="text-gray-400">Comprehensive traffic data analysis and insights</p>
        </div>
        <div className="flex items-center gap-2">
          {['day', 'week', 'month'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range as any)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                dateRange === range
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
          <button
            onClick={() => {/* Export report */}}
            className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10"
          >
            📊 Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass rounded-xl p-5"
          >
            <p className="text-sm text-gray-400">{kpi.label}</p>
            <div className="flex items-end gap-2 mt-1">
              <p className="text-2xl font-bold text-white">{kpi.value}</p>
              <span className={`text-xs ${kpi.positive ? 'text-green-400' : 'text-red-400'}`}>
                {kpi.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Flow */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Hourly Traffic Flow</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="hour" stroke="#6b7280" fontSize={10} />
              <YAxis stroke="#6b7280" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="vehicles" stroke="#06b6d4" fillOpacity={1} fill="url(#colorTraffic)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Incidents by Type */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Incidents by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={incidentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {incidentData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Comparison */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Traffic vs Incidents</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="day" stroke="#6b7280" fontSize={10} />
              <YAxis yAxisId="left" stroke="#6b7280" fontSize={10} />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Bar yAxisId="left" dataKey="traffic" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="incidents" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Congestion Trend */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Congestion Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="hour" stroke="#6b7280" fontSize={10} />
              <YAxis stroke="#6b7280" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="congestion" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">AI Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <p className="text-sm text-cyan-400 font-medium mb-1">Peak Hours Pattern</p>
            <p className="text-xs text-gray-400">Traffic peaks between 8-9 AM and 5-6 PM. Consider increasing signal cycle times during these periods.</p>
          </div>
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-sm text-yellow-400 font-medium mb-1">Incident Hotspot</p>
            <p className="text-xs text-gray-400">Main Boulevard & Commerce intersection shows 45% higher incident rate. Recommend traffic calming measures.</p>
          </div>
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-green-400 font-medium mb-1">Best Response Time</p>
            <p className="text-xs text-gray-400">Officer deployment during night hours (10PM-5AM) shows 35% faster incident resolution.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
