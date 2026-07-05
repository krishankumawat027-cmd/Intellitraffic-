'use client';

import { useTrafficStore } from '@/store/trafficStore';
import { motion } from 'framer-motion';

const layerConfig = [
  { id: 'traffic' as const, label: 'Traffic', icon: '🚗' },
  { id: 'incidents' as const, label: 'Incidents', icon: '⚠️' },
  { id: 'parking' as const, label: 'Parking', icon: '🅿️' },
  { id: 'heatmap' as const, label: 'Heatmap', icon: '🔥' },
  { id: 'buildings' as const, label: 'Buildings', icon: '🏢' },
  { id: 'streetLights' as const, label: 'Street Lights', icon: '💡' },
  { id: 'pedestrians' as const, label: 'Pedestrians', icon: '🚶' },
];

export function LayersPanel() {
  const { layers, toggleLayer, showLayers, toggleLayers } = useTrafficStore();

  return (
    <div className="fixed right-4 bottom-24 z-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl overflow-hidden"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleLayers}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <span className="text-sm text-gray-300">Layers</span>
          <motion.span
            animate={{ rotate: showLayers ? 180 : 0 }}
            className="text-gray-400"
          >
            ▼
          </motion.span>
        </motion.button>

        <motion.div
          initial={false}
          animate={{
            height: showLayers ? 'auto' : 0,
            opacity: showLayers ? 1 : 0,
          }}
          className="overflow-hidden"
        >
          <div className="p-2 space-y-1 border-t border-white/5">
            {layerConfig.map((layer) => (
              <motion.button
                key={layer.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleLayer(layer.id)}
                className={`w-full px-3 py-2 rounded-lg text-left text-sm flex items-center gap-2 transition-colors ${
                  layers[layer.id]
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'hover:bg-white/5 text-gray-400'
                }`}
              >
                <span>{layer.icon}</span>
                <span>{layer.label}</span>
                <div className="ml-auto">
                  <div className={`w-8 h-4 rounded-full transition-colors ${
                    layers[layer.id] ? 'bg-cyan-500' : 'bg-gray-600'
                  }`}>
                    <motion.div
                      animate={{ x: layers[layer.id] ? 16 : 0 }}
                      className="w-4 h-4 rounded-full bg-white shadow-md"
                    />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
