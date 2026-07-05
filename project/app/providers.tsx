'use client';

import { useTrafficSimulation } from '@/hooks/useTrafficSimulation';
import { TrafficScene } from '@/components/3d';
import { TopBar } from '@/components/panels/TopBar';
import { Controls } from '@/components/panels/Controls';
import { LayersPanel } from '@/components/panels/LayersPanel';
import { SelectionPanel } from '@/components/panels/SelectionPanel';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { AnalyticsPanel } from '@/components/analytics/AnalyticsPanel';
import { useTrafficStore } from '@/store/trafficStore';
import { motion } from 'framer-motion';

function AnalyticsButton() {
  const { toggleAnalytics, showAnalytics } = useTrafficStore();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleAnalytics}
      className={`fixed bottom-4 left-4 z-20 px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
        showAnalytics
          ? 'bg-cyan-500/20 text-cyan-400'
          : 'glass text-gray-300 hover:bg-white/10'
      }`}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <span className="text-sm font-medium">Analytics</span>
    </motion.button>
  );
}

export default function HomePage() {
  useTrafficSimulation();

  return (
    <main className="w-screen h-screen overflow-hidden bg-slate-900">
      <TrafficScene />

      <TopBar />

      <Controls />

      <LayersPanel />

      <SelectionPanel />

      <ChatPanel />

      <AnalyticsPanel />

      <AnalyticsButton />
    </main>
  );
}
