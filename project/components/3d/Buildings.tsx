'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useTrafficStore } from '@/store/trafficStore';
import type { Building } from '@/types/traffic';

const buildingMaterials: Record<string, THREE.MeshStandardMaterial> = {
  commercial: new THREE.MeshStandardMaterial({ color: '#2a3f5f', roughness: 0.6, metalness: 0.4 }),
  residential: new THREE.MeshStandardMaterial({ color: '#3d4f5f', roughness: 0.7, metalness: 0.2 }),
  industrial: new THREE.MeshStandardMaterial({ color: '#4a4a4a', roughness: 0.9, metalness: 0.1 }),
  landmark: new THREE.MeshStandardMaterial({ color: '#4a5f7f', roughness: 0.4, metalness: 0.6 }),
  parking: new THREE.MeshStandardMaterial({ color: '#353535', roughness: 0.8, metalness: 0.2 }),
};

function BuildingMesh({ building }: { building: Building }) {
  const ref = useRef<THREE.Mesh>(null);
  const material = buildingMaterials[building.type] || buildingMaterials.commercial;

  return (
    <group position={[building.position.x, 0, building.position.z]}>
      <mesh
        ref={ref}
        position={[0, building.size.height / 2, 0]}
        castShadow
        receiveShadow
        material={material}
      >
        <boxGeometry args={[building.size.width, building.size.height, building.size.depth]} />
      </mesh>

      {building.size.height > 15 && (
        <mesh position={[0, building.size.height + 0.5, 0]}>
          <boxGeometry args={[building.size.width * 0.8, 1, building.size.depth * 0.8]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
      )}

      {building.hasHelipad && (
        <mesh position={[0, building.size.height + 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[4, 32]} />
          <meshStandardMaterial color="#ff4444" />
        </mesh>
      )}

      <pointLight
        position={[0, building.size.height / 2, 0]}
        intensity={0.1}
        distance={30}
        color="#ffd700"
      />
    </group>
  );
}

export function Buildings() {
  const buildings = useTrafficStore((state) => state.buildings);

  return (
    <group>
      {buildings.map((building) => (
        <BuildingMesh key={building.id} building={building} />
      ))}
    </group>
  );
}
