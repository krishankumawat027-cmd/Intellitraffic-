'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { WeatherCondition } from '@/types/traffic';

interface WeatherEffectsProps {
  weather: WeatherCondition;
}

function Rain({ intensity }: { intensity: number }) {
  const particlesRef = useRef<THREE.Points>(null);
  const count = Math.floor(intensity * 2000);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 300;
      pos[i * 3 + 1] = Math.random() * 100;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 300;
    }
    return pos;
  }, [count]);

  useFrame((state, delta) => {
    if (particlesRef.current) {
      const pos = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < count; i++) {
        pos.array[i * 3 + 1] -= delta * 40;
        if (pos.array[i * 3 + 1] < 0) {
          pos.array[i * 3 + 1] = 100;
        }
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#6cb4ee"
        size={0.1}
        transparent
        opacity={0.6}
      />
    </points>
  );
}

function Fog({ intensity }: { intensity: number }) {
  return (
    <mesh position={[0, 2, 0]}>
      <sphereGeometry args={[200, 32, 32]} />
      <meshStandardMaterial
        color="#a0aec0"
        transparent
        opacity={intensity * 0.3}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

function Cloud({ position, scale }: { position: [number, number, number]; scale: number }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.x += 0.02;
      if (ref.current.position.x > 200) {
        ref.current.position.x = -200;
      }
    }
  });

  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[8, 16, 16]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.7} />
      </mesh>
      <mesh position={[5, -1, 0]}>
        <sphereGeometry args={[6, 16, 16]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.7} />
      </mesh>
      <mesh position={[-5, -1, 0]}>
        <sphereGeometry args={[7, 16, 16]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, -2, 5]}>
        <sphereGeometry args={[6, 16, 16]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

export function WeatherEffects({ weather }: WeatherEffectsProps) {
  const { type, intensity } = weather;

  return (
    <group>
      {(type === 'rain' || type === 'storm') && intensity > 0 && (
        <Rain intensity={intensity} />
      )}

      {type === 'fog' && intensity > 0 && (
        <Fog intensity={intensity} />
      )}

      {(type === 'cloudy' || type === 'rain') && (
        <>
          <Cloud position={[-50, 80, 30]} scale={1.5} />
          <Cloud position={[80, 85, -60]} scale={1.2} />
          <Cloud position={[-120, 90, -80]} scale={1.8} />
          <Cloud position={[150, 78, 50]} scale={1.3} />
        </>
      )}
    </group>
  );
}
