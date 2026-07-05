'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { TimeOfDay } from '@/types/traffic';

interface LightingProps {
  timeOfDay: TimeOfDay;
}

export function Lighting({ timeOfDay }: LightingProps) {
  const sunRef = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    if (sunRef.current) {
      sunRef.current.position.set(
        timeOfDay.sunPosition.x,
        timeOfDay.sunPosition.y,
        timeOfDay.sunPosition.z
      );
    }
  });

  const sunColor = timeOfDay.isDay
    ? (timeOfDay.hour < 8 || timeOfDay.hour > 17 ? '#ff8c00' : '#ffffff')
    : '#1a365d';

  const ambientIntensity = timeOfDay.isDay ? 0.4 : 0.15;
  const sunIntensity = timeOfDay.isDay ? 1.2 : 0.1;

  return (
    <>
      <ambientLight intensity={ambientIntensity} color={timeOfDay.isDay ? '#e0e7ff' : '#1e3a5f'} />

      <directionalLight
        ref={sunRef}
        position={[timeOfDay.sunPosition.x, timeOfDay.sunPosition.y, timeOfDay.sunPosition.z]}
        intensity={sunIntensity}
        color={sunColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={300}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />

      {!timeOfDay.isDay && (
        <>
          <hemisphereLight
            args={['#0a1628', '#1e3a5f', 0.3]}
          />

          <pointLight position={[0, 50, 0]} intensity={0.2} color="#ffd700" distance={200} />
        </>
      )}
    </>
  );
}
