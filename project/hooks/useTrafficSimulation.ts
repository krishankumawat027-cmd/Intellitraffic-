'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTrafficStore } from '@/store/trafficStore';
import type { Vehicle } from '@/types/traffic';

export function useTrafficSimulation() {
  const frameRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(Date.now());

  const updateVehicles = useCallback(() => {
    const state = useTrafficStore.getState();
    const vehicles = state.vehicles;
    const roads = state.roads;
    const signals = state.signals;

    const updatedVehicles: Vehicle[] = vehicles.map((vehicle) => {
      let { x, y, z } = vehicle.position;
      let rotation = vehicle.rotation;
      let speed = vehicle.speed;
      let status = vehicle.status;

      const road = roads[Math.floor(Math.random() * roads.length)];
      speed = vehicle.type === 'emergency' ? 60 : vehicle.type === 'truck' ? 30 : 35 + Math.random() * 15;

      const moveSpeed = (speed / 60) * 0.5;

      const forwardX = Math.sin(rotation) * moveSpeed;
      const forwardZ = Math.cos(rotation) * moveSpeed;

      x += forwardX;
      z += forwardZ;

      if (x > 140) {
        x = -140;
        rotation = rotation + Math.PI * (Math.random() - 0.5);
      }
      if (x < -140) {
        x = 140;
        rotation = rotation + Math.PI * (Math.random() - 0.5);
      }
      if (z > 140) {
        z = -140;
        rotation = rotation + Math.PI * (Math.random() - 0.5);
      }
      if (z < -140) {
        z = 140;
        rotation = rotation + Math.PI * (Math.random() - 0.5);
      }

      if (Math.random() < 0.002) {
        rotation += (Math.random() - 0.5) * Math.PI * 0.5;
      }

      const nearIntersection = Math.abs(x % 50) < 5 && Math.abs(z % 50) < 5;

      if (nearIntersection) {
        const nearestSignal = signals.find((s) => {
          const dx = s.position.x - x;
          const dz = s.position.z - z;
          return Math.sqrt(dx * dx + dz * dz) < 15;
        });

        if (nearestSignal && nearestSignal.state === 'red') {
          status = 'stopped';
          speed = 0;
        } else if (nearestSignal && nearestSignal.state === 'yellow') {
          status = 'yielding';
          speed = speed * 0.5;
        } else {
          status = 'moving';
        }
      } else {
        status = 'moving';
      }

      vehicles.forEach((other) => {
        if (other.id === vehicle.id) return;
        const dx = other.position.x - x;
        const dz = other.position.z - z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < 5) {
          status = 'stopped';
          speed = 0;
        } else if (distance < 10) {
          speed = speed * 0.7;
          status = 'yielding';
        }
      });

      return {
        ...vehicle,
        position: { x, y, z },
        rotation,
        speed,
        status,
      };
    });

    useTrafficStore.setState({ vehicles: updatedVehicles });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      useTrafficStore.getState().cycleSignals();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      updateVehicles();
    }, 50);

    return () => clearInterval(interval);
  }, [updateVehicles]);

  useEffect(() => {
    const interval = setInterval(() => {
      const state = useTrafficStore.getState();
      const vehicles = state.vehicles;

      const movingVehicles = vehicles.filter((v) => v.status === 'moving').length;
      const avgSpeed = vehicles.reduce((sum, v) => sum + v.speed, 0) / vehicles.length;

      state.updateStats({
        totalVehicles: vehicles.length,
        averageSpeed: avgSpeed,
        congestionIndex: 1 - movingVehicles / vehicles.length,
        flowRate: Math.floor(movingVehicles * 8),
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const state = useTrafficStore.getState();
    const unsub = useTrafficStore.subscribe(
      (state) => state.timeOfDay,
      (timeOfDay) => {
        document.documentElement.style.setProperty('--ambient-light', timeOfDay.ambientIntensity.toString());
      }
    );

    return () => unsub();
  }, []);

  return null;
}
