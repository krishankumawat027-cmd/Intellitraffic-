'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useTrafficStore } from '@/store/trafficStore';
import type { Road } from '@/types/traffic';

const congestionColors: Record<string, THREE.Color> = {
  low: new THREE.Color('#22c55e'),
  medium: new THREE.Color('#f59e0b'),
  heavy: new THREE.Color('#ef4444'),
  blocked: new THREE.Color('#991b1b'),
};

function RoadSegment({ road }: { road: Road }) {
  const ref = useRef<THREE.Mesh>(null);
  const isSelected = useTrafficStore((s) => s.selectedObject?.id === road.id);

  const [start, end] = road.points;
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);

  const centerX = (start.x + end.x) / 2;
  const centerZ = (start.z + end.z) / 2;

  const roadColor = useMemo(() => {
    return congestionColors[road.congestion] || congestionColors.low;
  }, [road.congestion]);

  const laneWidth = road.lanes * 3.5;

  const handleClick = (e: any) => {
    e.stopPropagation();
    useTrafficStore.getState().selectObject(road, 'road');
  };

  return (
    <group>
      <mesh
        ref={ref}
        position={[centerX, 0.05, centerZ]}
        rotation={[-Math.PI / 2, 0, angle]}
        onClick={handleClick}
      >
        <planeGeometry args={[length, laneWidth]} />
        <meshStandardMaterial
          color={isSelected ? '#3b82f6' : '#2d3748'}
          roughness={0.9}
          metalness={0.1}
          transparent
          opacity={isSelected ? 0.95 : 0.85}
        />
      </mesh>

      {road.lanes > 1 && Array.from({ length: road.lanes - 1 }).map((_, i) => {
        const offset = (i - (road.lanes - 2) / 2) * 3.5;
        return (
          <mesh
            key={`lane-${i}`}
            position={[centerX, 0.06, centerZ + Math.cos(angle) * offset]}
            rotation={[-Math.PI / 2, 0, angle]}
          >
            <planeGeometry args={[length * 0.95, 0.1]} />
            <meshStandardMaterial color="#ffffff" opacity={0.4} transparent />
          </mesh>
        );
      })}

      <mesh
        position={[centerX, 0.07, centerZ]}
        rotation={[-Math.PI / 2, 0, angle]}
      >
        <planeGeometry args={[length, laneWidth * 1.05]} />
        <meshStandardMaterial
          color={roadColor}
          opacity={0.2 + road.trafficDensity * 0.3}
          transparent
        />
      </mesh>

      {isSelected && (
        <mesh
          position={[centerX, 0.08, centerZ]}
          rotation={[-Math.PI / 2, 0, angle]}
        >
          <planeGeometry args={[length + 2, laneWidth + 2]} />
          <meshStandardMaterial color="#3b82f6" opacity={0.5} transparent />
        </mesh>
      )}
    </group>
  );
}

export function Roads() {
  const roads = useTrafficStore((state) => state.roads);

  return (
    <group>
      {roads.map((road) => (
        <RoadSegment key={road.id} road={road} />
      ))}
    </group>
  );
}
