'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars, Grid } from '@react-three/drei';
import { Suspense, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Ground } from './Ground';
import { Buildings } from './Buildings';
import { Roads } from './Roads';
import { Vehicles } from './Vehicles';
import { TrafficSignals } from './TrafficSignals';
import { Accidents } from './Accidents';
import { WeatherEffects } from './WeatherEffects';
import { Lighting } from './Lighting';
import { useTrafficStore } from '@/store/trafficStore';
import { Effects } from './Effects';

function CameraController() {
  const { flyoverActive, cameraTarget, viewMode } = useTrafficStore();
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const angleRef = useRef(0);

  useFrame((state, delta) => {
    if (flyoverActive && cameraRef.current) {
      angleRef.current += delta * 0.1;
      const radius = 120;
      const x = Math.cos(angleRef.current) * radius;
      const z = Math.sin(angleRef.current) * radius;

      cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, x, delta * 0.5);
      cameraRef.current.position.z = THREE.MathUtils.lerp(cameraRef.current.position.z, z, delta * 0.5);
      cameraRef.current.lookAt(0, 0, 0);
    }

    if (cameraTarget && cameraRef.current) {
      cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, cameraTarget.x + 30, delta * 2);
      cameraRef.current.position.z = THREE.MathUtils.lerp(cameraRef.current.position.z, cameraTarget.z + 30, delta * 2);
      cameraRef.current.lookAt(cameraTarget.x, cameraTarget.y, cameraTarget.z);
    }
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault position={[100, 80, 100]} fov={50} />;
}

export function TrafficScene() {
  const { layers, weather, timeOfDay } = useTrafficStore();

  const fogColor = useMemo(() => {
    return timeOfDay.isDay ? '#87CEEB' : '#0a1628';
  }, [timeOfDay.isDay]);

  return (
    <Canvas
      shadows
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      camera={{ position: [100, 80, 100], fov: 50 }}
    >
      <color attach="background" args={[fogColor]} />
      <fog attach="fog" args={[fogColor, 50, 300]} />

      <Suspense fallback={null}>
        <CameraController />

        <Lighting timeOfDay={timeOfDay} />

        {timeOfDay.isDay ? null : <Stars radius={150} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />}

        <Ground weather={weather} />

        {layers.buildings && <Buildings />}
        {layers.traffic && <Roads />}
        {layers.traffic && <Vehicles />}
        {layers.incidents && <TrafficSignals />}
        {layers.incidents && <Accidents />}

        <WeatherEffects weather={weather} />

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          maxPolarAngle={Math.PI / 2.2}
          minDistance={20}
          maxDistance={250}
          dampingFactor={0.05}
          rotateSpeed={0.5}
        />

        <Effects />
      </Suspense>
    </Canvas>
  );
}
