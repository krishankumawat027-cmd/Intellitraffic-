'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTrafficStore } from '@/store/trafficStore';
import type { TrafficSignal } from '@/types/traffic';

const signalColors = {
  red: new THREE.Color('#ef4444'),
  yellow: new THREE.Color('#f59e0b'),
  green: new THREE.Color('#22c55e'),
};

function SignalMesh({ signal }: { signal: TrafficSignal }) {
  const ref = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const colorRef = useRef<THREE.Mesh>(null);

  const isSelected = useTrafficStore((s) => s.selectedObject?.id === signal.id);
  const currentColor = useMemo(() => signalColors[signal.state], [signal.state]);

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = 1.5 + Math.sin(state.clock.elapsedTime * 4) * 0.5;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    useTrafficStore.getState().selectObject(signal, 'signal');
  };

  const getRedMaterial = () => ({
    color: signal.state === 'red' ? signalColors.red : '#331111',
    emissive: signal.state === 'red' ? signalColors.red : new THREE.Color(0),
    emissiveIntensity: signal.state === 'red' ? 2 : 0
  });

  const getYellowMaterial = () => ({
    color: signal.state === 'yellow' ? signalColors.yellow : '#333311',
    emissive: signal.state === 'yellow' ? signalColors.yellow : new THREE.Color(0),
    emissiveIntensity: signal.state === 'yellow' ? 2 : 0
  });

  const getGreenMaterial = () => ({
    color: signal.state === 'green' ? signalColors.green : '#113311',
    emissive: signal.state === 'green' ? signalColors.green : new THREE.Color(0),
    emissiveIntensity: signal.state === 'green' ? 2 : 0
  });

  return (
    <group ref={ref} position={[signal.position.x, 0, signal.position.z]} onClick={handleClick}>
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 6]} />
        <meshStandardMaterial color="#4a5568" roughness={0.8} metalness={0.5} />
      </mesh>

      <mesh position={[0, 6.5, 0]} castShadow>
        <boxGeometry args={[0.6, 2, 0.6]} />
        <meshStandardMaterial color="#1a202c" roughness={0.5} metalness={0.1} />
      </mesh>

      <group position={[0, 6.5, 0.35]}>
        <mesh position={[0, -0.6, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial {...getRedMaterial()} />
        </mesh>

        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial {...getYellowMaterial()} />
        </mesh>

        <mesh ref={colorRef} position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial {...getGreenMaterial()} />
        </mesh>
      </group>

      <pointLight
        ref={lightRef}
        position={[0, 6.5, 1.5]}
        color={currentColor}
        intensity={1.5}
        distance={20}
      />

      {isSelected && (
        <mesh position={[0, 3.5, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.5, 16]} />
          <meshStandardMaterial color="#3b82f6" transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
}

export function TrafficSignals() {
  const signals = useTrafficStore((state) => state.signals);

  return (
    <group>
      {signals.map((signal) => (
        <SignalMesh key={signal.id} signal={signal} />
      ))}
    </group>
  );
}
