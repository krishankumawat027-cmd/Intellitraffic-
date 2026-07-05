'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTrafficStore } from '@/store/trafficStore';
import type { Accident } from '@/types/traffic';

const severityColors = {
  minor: new THREE.Color('#f59e0b'),
  moderate: new THREE.Color('#f97316'),
  severe: new THREE.Color('#ef4444'),
};

const severitySizes = {
  minor: 2,
  moderate: 4,
  severe: 6,
};

function AccidentMarker({ accident }: { accident: Accident }) {
  const ref = useRef<THREE.Group>(null);
  const isSelected = useTrafficStore((s) => s.selectedObject?.id === accident.id);
  const size = severitySizes[accident.severity];
  const color = severityColors[accident.severity];

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
      ref.current.rotation.y = state.clock.elapsedTime;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    useTrafficStore.getState().selectObject(accident, 'accident');
  };

  return (
    <group
      ref={ref}
      position={[accident.position.x, 0.5, accident.position.z]}
      onClick={handleClick}
    >
      <mesh>
        <coneGeometry args={[size * 0.3, size * 0.6, 4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>

      <mesh rotation={[Math.PI, 0, 0]}>
        <ringGeometry args={[size * 0.5, size, 32]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      <pointLight
        position={[0, 2, 0]}
        color={color}
        intensity={2}
        distance={size * 2}
      />

      {isSelected && (
        <mesh position={[0, 2, 0]}>
          <sphereGeometry args={[size, 16, 16]} />
          <meshStandardMaterial color="#3b82f6" transparent opacity={0.3} wireframe />
        </mesh>
      )}
    </group>
  );
}

export function Accidents() {
  const accidents = useTrafficStore((state) => state.accidents);
  const activeAccidents = accidents.filter((a) => a.status !== 'cleared');

  return (
    <group>
      {activeAccidents.map((accident) => (
        <AccidentMarker key={accident.id} accident={accident} />
      ))}
    </group>
  );
}
