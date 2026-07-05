'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTrafficStore } from '@/store/trafficStore';
import type { Vehicle } from '@/types/traffic';

const vehicleColors = {
  car: new THREE.Color(0x3b82f6),
  truck: new THREE.Color(0x6b7280),
  bus: new THREE.Color(0xf59e0b),
  emergency: new THREE.Color(0xef4444),
  motorcycle: new THREE.Color(0x22c55e),
};

const vehicleSizes = {
  car: { width: 2, height: 1.2, length: 4 },
  truck: { width: 2.5, height: 2.5, length: 8 },
  bus: { width: 2.8, height: 2.8, length: 10 },
  emergency: { width: 2.5, height: 2, length: 5 },
  motorcycle: { width: 0.6, height: 1, length: 2 },
};

function VehicleMesh({ vehicle }: { vehicle: Vehicle }) {
  const ref = useRef<THREE.Group>(null);
  const targetPosition = useRef(new THREE.Vector3(vehicle.position.x, vehicle.position.y, vehicle.position.z));
  const targetRotation = useRef(vehicle.rotation);

  const size = vehicleSizes[vehicle.type];
  const color = useMemo(() => {
    return vehicle.type === 'car' && vehicle.color
      ? new THREE.Color(vehicle.color)
      : vehicleColors[vehicle.type];
  }, [vehicle.type, vehicle.color]);

  const isSelected = useTrafficStore((s) => s.selectedObject?.id === vehicle.id);

  useEffect(() => {
    targetPosition.current.set(vehicle.position.x, vehicle.position.y, vehicle.position.z);
    targetRotation.current = vehicle.rotation;
  }, [vehicle.position, vehicle.rotation]);

  useFrame((state, delta) => {
    if (!ref.current) return;

    const pos = ref.current.position;
    const speed = 5;
    const dx = targetPosition.current.x - pos.x;
    const dz = targetPosition.current.z - pos.z;

    if (Math.abs(dx) > 0.1 || Math.abs(dz) > 0.1) {
      pos.x += dx * delta * speed;
      pos.z += dz * delta * speed;
    }

    const targetQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, targetRotation.current, 0));
    ref.current.quaternion.slerp(targetQuat, delta * 3);
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    useTrafficStore.getState().selectObject(vehicle, 'vehicle');
  };

  return (
    <group ref={ref} onClick={handleClick}>
      <mesh position={[0, size.height / 2, 0]} castShadow>
        <boxGeometry args={[size.width, size.height, size.length]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
      </mesh>

      <mesh position={[0, size.height + 0.2, -size.length / 3]}>
        <boxGeometry args={[size.width * 0.8, size.height * 0.4, size.length * 0.3]} />
        <meshStandardMaterial color="#1a202c" roughness={0.8} metalness={0.2} />
      </mesh>

      {vehicle.type === 'emergency' && vehicle.status === 'emergency' && (
        <pointLight
          position={[0, size.height + 1, 0]}
          intensity={2}
          distance={15}
          color="#ff0000"
        />
      )}

      {isSelected && (
        <mesh position={[0, size.height / 2, 0]}>
          <boxGeometry args={[size.width + 1, size.height + 1, size.length + 1]} />
          <meshStandardMaterial color="#3b82f6" transparent opacity={0.3} wireframe />
        </mesh>
      )}
    </group>
  );
}

export function Vehicles() {
  const vehicles = useTrafficStore((state) => state.vehicles);

  return (
    <group>
      {vehicles.map((vehicle) => (
        <VehicleMesh key={vehicle.id} vehicle={vehicle} />
      ))}
    </group>
  );
}
