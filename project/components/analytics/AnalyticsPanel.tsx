'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrafficStore } from '@/store/trafficStore';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

function generateTimeSeriesData(hours: number = 24) {
  const data = [];
  const now = new Date();

  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();
    const isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);

    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hour: hour,
      vehicles: Math.floor(80 + Math.sin((hour / 24) * Math.PI * 2) * 50 + (isPeak ? 40 : 0) + Math.random() * 20),
      speed: Math.floor(35 + Math.cos((hour / 24) * Math.PI * 2) * 15 + Math.random() * 5),
      congestion: Math.max(0, Math.min(1, 0.3 + Math.sin((hour / 24) * Math.PI * 2) * 0.3 + (isPeak ? 0.2 : 0) + Math.random() * 0.1)),
    });
  }

  return data;
}

function generatePredictionData() {
  const data = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const time = new Date(now.getTime() + i * 30 * 60 * 1000);
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      predicted: Math.floor(100 + Math.random() * 50),
      actual: i === 0 ? Math.floor(100 + Math.random() * 50) : null,
      confidence: 0.95 - i * 0.05,
    });
  }

  return data;
}

function generateVehicleTypeData() {
  return [
    { name: 'Cars', value: 68, color: COLORS[0] },
    { name: 'Trucks', value: 12, color: COLORS[1] },
    { name: 'Buses', value: 8, color: COLORS[2] },
    { name: 'Motorcycles', value: 7, color: COLORS[3] },
    { name: 'Emergency', value: 5, color: COLORS[4] },
  ];
}

function AnimatedCounter({ value, duration = 1 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
}

export function AnalyticsPanel() {
  const { showAnalytics, toggleAnalytics } = useTrafficStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeData] = useState(generateTimeSeriesData);
  const [predictionData] = useState(generatePredictionData);
  const [vehicleData] = useState(generateVehicleTypeData);

  if (!showAnalytics) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        className="fixed bottom-0 left-0 right-0 z-40"
      >
        <div className="glass border-t border-white/10">
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
            <div className="flex items-center gap-6">
              <h2 className="text-lg font-semibold text-white">Traffic Analytics</h2>

              <div className="flex items-center gap-2">
                {['overview', 'predictions', 'breakdown'].map((tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleAnalytics}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>

          <div className="p-6 h-64">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-4 gap-6 h-full">
                <div className="col-span-3">
                  <h3 className="text-sm font-medium text-gray-400 mb-4">Traffic Flow (24h)</h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <AreaChart data={timeData}>
                      <defs>
                        <linearGradient id="colorVehicles" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="time" stroke="#6b7280" fontSize={10} />
                      <YAxis stroke="#6b7280" fontSize={10} />
                      <Tooltip
                        contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                        labelStyle={{ color: '#9ca3af' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="vehicles"
                        stroke="#06b6d4"
                        fillOpacity={1}
                        fill="url(#colorVehicles)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  <div className="glass-light rounded-lg p-4">
                    <div className="text-xs text-gray-400">Total Today</div>
                    <div className="text-2xl font-bold text-cyan-400">
                      <AnimatedCounter value={15420} />
                    </div>
                  </div>

                  <div className="glass-light rounded-lg p-4">
                    <div className="text-xs text-gray-400">Avg Wait Time</div>
                    <div className="text-2xl font-bold text-yellow-400">
                      <AnimatedCounter value={47} />
                      <span className="text-sm">s</span>
                    </div>
                  </div>

                  <div className="glass-light rounded-lg p-4">
                    <div className="text-xs text-gray-400">Incident Rate</div>
                    <div className="text-2xl font-bold text-green-400">
                      <AnimatedCounter value={2} />
                      <span className="text-sm">/hr</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'predictions' && (
              <div className="h-full">
                <h3 className="text-sm font-medium text-gray-400 mb-4">AI Predictions (Next 6 hours)</h3>
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={predictionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={10} />
                    <YAxis stroke="#6b7280" fontSize={10} />
                    <Tooltip
                      contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#22c55e"
                      strokeDasharray="5 5"
                      dot={{ fill: '#22c55e' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={{ fill: '#06b6d4' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeTab === 'breakdown' && (
              <div className="grid grid-cols-3 gap-6 h-full">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-4">Vehicle Types</h3>
                  <ResponsiveContainer width="100%" height="85%">
                    <PieChart>
                      <Pie
                        data={vehicleData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {vehicleData.map((entry, index) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-4">Speed Distribution</h3>
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={[
                      { range: '0-20', count: 12 },
                      { range: '20-40', count: 45 },
                      { range: '40-60', count: 78 },
                      { range: '60-80', count: 35 },
                      { range: '80+', count: 8 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="range" stroke="#6b7280" fontSize={10} />
                      <YAxis stroke="#6b7280" fontSize={10} />
                      <Tooltip
                        contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }}
                      />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-400 mb-4">Key Insights</h3>
                  <div className="glass-light rounded-lg p-3">
                    <div className="text-xs text-cyan-400">Peak Hour</div>
                    <div className="text-sm text-white">8:00 AM - 9:00 AM</div>
                  </div>
                  <div className="glass-light rounded-lg p-3">
                    <div className="text-xs text-green-400">Best Time</div>
                    <div className="text-sm text-white">11:00 AM - 3:00 PM</div>
                  </div>
                  <div className="glass-light rounded-lg p-3">
                    <div className="text-xs text-yellow-400">Hot Spot</div>
                    <div className="text-sm text-white">Main & Commerce</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
