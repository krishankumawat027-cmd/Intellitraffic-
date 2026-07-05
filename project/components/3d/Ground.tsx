'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { WeatherCondition } from '@/types/traffic';

interface GroundProps {
  weather: WeatherCondition;
}

export function Ground({ weather }: GroundProps) {
  const groundRef = useRef<THREE.Mesh>(null);

  const groundMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: weather.type === 'rain' ? '#1a2836' : '#1a3a28',
      roughness: weather.type === 'rain' ? 0.2 : 0.8,
      metalness: weather.type === 'rain' ? 0.3 : 0,
    });
  }, [weather.type]);

  return (
    <mesh
      ref={groundRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.1, 0]}
      receiveShadow
      material={groundMaterial}
    >
      <planeGeometry args={[400, 400, 100, 100]} />
    </mesh>
  );
}
