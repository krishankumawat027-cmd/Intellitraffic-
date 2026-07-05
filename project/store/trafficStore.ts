import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  Vehicle, TrafficSignal, Road, Building, Accident,
  ParkingSpot, EmergencyVehicle, WeatherCondition,
  TimeOfDay, ChatMessage, TrafficStats, Prediction,
  ViewMode, TimeSpeed, AppState
} from '@/types/traffic';

const createInitialSignals = (): TrafficSignal[] => {
  const signals: TrafficSignal[] = [];
  const intersections = [
    { x: 0, z: 0 },
    { x: 0, z: 50 },
    { x: 0, z: -50 },
    { x: 50, z: 0 },
    { x: -50, z: 0 },
    { x: 50, z: 50 },
    { x: -50, z: 50 },
    { x: 50, z: -50 },
    { x: -50, z: -50 },
  ];

  intersections.forEach((pos, idx) => {
    const states: ('red' | 'yellow' | 'green')[] = ['red', 'yellow', 'green'];
    signals.push({
      id: `signal-${idx}`,
      position: { x: pos.x + 3, y: 0, z: pos.z + 3 },
      state: states[idx % 3],
      timer: Math.floor(Math.random() * 30) + 15,
      cycleTime: 45,
      congestion: Math.random(),
      roadId: `road-${idx}`,
    });
  });

  return signals;
};

const createInitialRoads = (): Road[] => {
  const roadNames = [
    'Main Boulevard', 'Commerce Street', 'Industrial Avenue',
    'Residential Drive', 'Highway 101', 'Central Avenue',
    'Park Lane', 'River Road', 'Downtown Express'
  ];

  const roads: Road[] = [];

  const mainRoads = [
    { id: 'road-0', name: roadNames[0], type: 'main' as const, points: [{ x: -150, z: 0 }, { x: 150, z: 0 }], lanes: 4, speedLimit: 50 },
    { id: 'road-1', name: roadNames[1], type: 'main' as const, points: [{ x: 0, z: -150 }, { x: 0, z: 150 }], lanes: 4, speedLimit: 50 },
    { id: 'road-2', name: roadNames[2], type: 'highway' as const, points: [{ x: -150, z: 50 }, { x: 150, z: 50 }], lanes: 6, speedLimit: 70 },
    { id: 'road-3', name: roadNames[3], type: 'highway' as const, points: [{ x: -150, z: -50 }, { x: 150, z: -50 }], lanes: 6, speedLimit: 70 },
    { id: 'road-4', name: roadNames[4], type: 'main' as const, points: [{ x: 50, z: -150 }, { x: 50, z: 150 }], lanes: 4, speedLimit: 50 },
    { id: 'road-5', name: roadNames[5], type: 'main' as const, points: [{ x: -50, z: -150 }, { x: -50, z: 150 }], lanes: 4, speedLimit: 50 },
    { id: 'road-6', name: roadNames[6], type: 'residential' as const, points: [{ x: -150, z: 100 }, { x: 150, z: 100 }], lanes: 2, speedLimit: 30 },
    { id: 'road-7', name: roadNames[7], type: 'residential' as const, points: [{ x: -150, z: -100 }, { x: 150, z: -100 }], lanes: 2, speedLimit: 30 },
    { id: 'road-8', name: roadNames[8], type: 'main' as const, points: [{ x: 100, z: -150 }, { x: 100, z: 150 }], lanes: 3, speedLimit: 40 },
  ];

  mainRoads.forEach(road => {
    const density = Math.random();
    roads.push({
      ...road,
      width: road.lanes * 3.5,
      trafficDensity: density,
      averageSpeed: road.speedLimit * (1 - density * 0.5),
      vehicleCount: Math.floor(density * 50),
      predictedDelay: density * 15,
      congestion: density < 0.3 ? 'low' : density < 0.6 ? 'medium' : density < 0.85 ? 'heavy' : 'blocked',
    });
  });

  return roads;
};

const createInitialBuildings = (): Building[] => {
  const buildings: Building[] = [];
  const types: Building['type'][] = ['commercial', 'residential', 'industrial', 'landmark', 'parking'];
  const names = [
    'Tech Tower', 'Commerce Plaza', 'Gateway Center', 'Innovation Hub',
    'Metro Mall', 'City Hall', 'Financial Tower', 'Research Complex',
    'Sunset Apartments', 'Harbor View', 'Parkside Residences', 'Downtown Lofts'
  ];

  const positions = [
    { x: 20, z: 20 }, { x: -20, z: 20 }, { x: 20, z: -20 }, { x: -20, z: -20 },
    { x: 70, z: 20 }, { x: -70, z: 20 }, { x: 70, z: -20 }, { x: -70, z: -20 },
    { x: 20, z: 70 }, { x: -20, z: 70 }, { x: 20, z: -70 }, { x: -20, z: -70 },
    { x: 70, z: 70 }, { x: -70, z: 70 }, { x: 70, z: -70 }, { x: -70, z: -70 },
    { x: 120, z: 20 }, { x: -120, z: 20 }, { x: 120, z: -20 }, { x: -120, z: -20 },
  ];

  positions.forEach((pos, idx) => {
    const type = types[idx % types.length];
    const height = 10 + Math.random() * 40;
    buildings.push({
      id: `building-${idx}`,
      position: { x: pos.x, y: height / 2, z: pos.z },
      size: {
        width: 8 + Math.random() * 12,
        height,
        depth: 8 + Math.random() * 12
      },
      type,
      name: names[idx % names.length],
      floors: Math.floor(height / 3),
      hasHelipad: type === 'landmark' || (type === 'commercial' && height > 35),
      rooftopAccess: Math.random() > 0.5,
    });
  });

  return buildings;
};

const createInitialVehicles = (): Vehicle[] => {
  const vehicles: Vehicle[] = [];
  const types: Vehicle['type'][] = ['car', 'car', 'car', 'car', 'truck', 'bus', 'motorcycle', 'emergency'];
  const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ffffff', '#1f2937'];
  const licenses = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (let i = 0; i < 60; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const isOnVertical = Math.random() > 0.5;
    const lane = Math.floor(Math.random() * 4) - 2;
    const pos = Math.random() * 200 - 100;
    const x = isOnVertical ? lane * 3.5 + (Math.random() - 0.5) : pos;
    const z = isOnVertical ? pos : lane * 3.5 + (Math.random() - 0.5);

    vehicles.push({
      id: `vehicle-${i}`,
      position: { x, y: 0.5, z },
      rotation: isOnVertical ? (lane > 0 ? 0 : Math.PI) : (lane > 0 ? Math.PI / 2 : -Math.PI / 2),
      speed: 15 + Math.random() * 25,
      type,
      color: type === 'emergency' ? '#ef4444' : colors[Math.floor(Math.random() * colors.length)],
      route: ['road-0', 'road-1', 'road-2'],
      status: 'moving',
      license: Array.from({ length: 6 }, () => licenses[Math.floor(Math.random() * licenses.length)]).join(''),
      destination: ['Downtown', 'Airport', 'Harbor', 'Station', 'Mall'][Math.floor(Math.random() * 5)],
      eta: Math.floor(Math.random() * 30) + 5,
    });
  }

  return vehicles;
};

const createInitialAccidents = (): Accident[] => {
  return [
    {
      id: 'accident-0',
      position: { x: 25, y: 0, z: 5 },
      severity: 'moderate',
      type: 'collision',
      status: 'active',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      description: 'Two-vehicle collision, right lane blocked',
      affectedLanes: 1,
      estimatedClearTime: new Date(Date.now() + 30 * 60 * 1000),
      responders: ['PD-42', 'AMB-7'],
      roadId: 'road-0',
    },
    {
      id: 'accident-1',
      position: { x: -60, y: 0, z: 50 },
      severity: 'minor',
      type: 'breakdown',
      status: 'responding',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      description: 'Vehicle breakdown on shoulder',
      affectedLanes: 0,
      estimatedClearTime: new Date(Date.now() + 15 * 60 * 1000),
      responders: ['TOW-12'],
      roadId: 'road-2',
    },
    {
      id: 'accident-2',
      position: { x: 50, y: 0, z: -35 },
      severity: 'minor',
      type: 'construction',
      status: 'active',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      description: 'Road maintenance, one lane closed',
      affectedLanes: 1,
      estimatedClearTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
      responders: ['CON-1', 'CON-2'],
      roadId: 'road-4',
    },
  ];
};

const createInitialParkingSpots = (): ParkingSpot[] => {
  const spots: ParkingSpot[] = [];
  const types: ParkingSpot['type'][] = ['street', 'lot', 'garage', 'vip'];

  for (let i = 0; i < 30; i++) {
    const angle = (i / 30) * Math.PI * 2;
    const radius = 80 + Math.random() * 20;
    spots.push({
      id: `parking-${i}`,
      position: {
        x: Math.cos(angle) * radius,
        y: 0,
        z: Math.sin(angle) * radius
      },
      status: Math.random() > 0.3 ? 'available' : Math.random() > 0.5 ? 'occupied' : 'reserved',
      type: types[Math.floor(Math.random() * types.length)],
      rate: 2 + Math.floor(Math.random() * 8),
      duration: Math.floor(Math.random() * 120),
    });
  }

  return spots;
};

const createInitialEmergencyVehicles = (): EmergencyVehicle[] => {
  return [
    { id: 'emv-0', type: 'police', position: { x: -100, y: 0.5, z: 0 }, status: 'enroute', destination: { x: 25, y: 0, z: 5 }, speed: 60, incident: 'accident-0' },
    { id: 'emv-1', type: 'ambulance', position: { x: 0, y: 0.5, z: 100 }, status: 'onsite', speed: 55, incident: 'accident-0' },
    { id: 'emv-2', type: 'fire', position: { x: -80, y: 0.5, z: -80 }, status: 'available', speed: 50 },
    { id: 'emv-3', type: 'tow', position: { x: 50, y: 0.5, z: 60 }, status: 'dispatched', destination: { x: -60, y: 0, z: 50 }, speed: 40, incident: 'accident-1' },
  ];
};

const createTimeOfDay = (hour: number = new Date().getHours()): TimeOfDay => {
  const isDay = hour >= 6 && hour < 20;
  const sunAngle = ((hour - 6) / 14) * Math.PI;

  return {
    hour,
    minute: new Date().getMinutes(),
    isDay,
    sunPosition: {
      x: Math.cos(sunAngle) * 100,
      y: Math.sin(sunAngle) * 100,
      z: 0,
    },
    ambientIntensity: isDay ? 0.8 : 0.2,
  };
};

export const useTrafficStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    vehicles: createInitialVehicles(),
    signals: createInitialSignals(),
    roads: createInitialRoads(),
    buildings: createInitialBuildings(),
    accidents: createInitialAccidents(),
    parkingSpots: createInitialParkingSpots(),
    emergencyVehicles: createInitialEmergencyVehicles(),

    weather: {
      type: 'clear',
      intensity: 0,
      visibility: 100,
      temperature: 22,
      humidity: 45,
      windSpeed: 12,
      windDirection: 270,
    },

    timeOfDay: createTimeOfDay(),
    timeSpeed: 1,

    viewMode: 'orbit',
    selectedObject: null,
    selectedType: null,

    cameraTarget: null,
    flyoverActive: false,

    chatMessages: [],
    isAIThinking: false,

    showAnalytics: false,
    showSettings: false,
    showLayers: false,

    stats: {
      totalVehicles: 156,
      averageSpeed: 42,
      congestionIndex: 0.35,
      incidents: 3,
      flowRate: 1250,
      peakHour: false,
    },

    predictions: [],

    layers: {
      traffic: true,
      incidents: true,
      parking: false,
      heatmap: true,
      buildings: true,
      streetLights: true,
      pedestrians: false,
    },

    // Actions
    updateVehicle: (id: string, updates: Partial<Vehicle>) => {
      set(state => ({
        vehicles: state.vehicles.map(v => v.id === id ? { ...v, ...updates } : v)
      }));
    },

    updateAllVehicles: (updatesFn: (vehicles: Vehicle[]) => Vehicle[]) => {
      set(state => ({ vehicles: updatesFn(state.vehicles) }));
    },

    updateSignal: (id: string, updates: Partial<TrafficSignal>) => {
      set(state => ({
        signals: state.signals.map(s => s.id === id ? { ...s, ...updates } : s)
      }));
    },

    cycleSignals: () => {
      set(state => ({
        signals: state.signals.map(signal => {
          let newState = signal.state;
          let newTimer = signal.timer - 1;

          if (newTimer <= 0) {
            switch (signal.state) {
              case 'green':
                newState = 'yellow';
                newTimer = 5;
                break;
              case 'yellow':
                newState = 'red';
                newTimer = 30;
                break;
              case 'red':
                newState = 'green';
                newTimer = 25;
                break;
            }
          }

          return { ...signal, state: newState, timer: newTimer };
        })
      }));
    },

    selectObject: (object: any, type: 'vehicle' | 'road' | 'accident' | 'signal' | null) => {
      set({ selectedObject: object, selectedType: type });
    },

    clearSelection: () => {
      set({ selectedObject: null, selectedType: null });
    },

    setCameraTarget: (target: { x: number; y: number; z: number } | null) => {
      set({ cameraTarget: target });
    },

    toggleFlyover: () => {
      set(state => ({ flyoverActive: !state.flyoverActive }));
    },

    setViewMode: (mode: ViewMode) => {
      set({ viewMode: mode });
    },

    addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
      const newMessage: ChatMessage = {
        ...message,
        id: `msg-${Date.now()}`,
        timestamp: new Date(),
      };
      set(state => ({ chatMessages: [...state.chatMessages, newMessage] }));
    },

    setAIThinking: (thinking: boolean) => {
      set({ isAIThinking: thinking });
    },

    toggleAnalytics: () => {
      set(state => ({ showAnalytics: !state.showAnalytics }));
    },

    toggleSettings: () => {
      set(state => ({ showSettings: !state.showSettings }));
    },

    toggleLayers: () => {
      set(state => ({ showLayers: !state.showLayers }));
    },

    updateWeather: (updates: Partial<WeatherCondition>) => {
      set(state => ({ weather: { ...state.weather, ...updates } }));
    },

    updateTimeOfDay: (hour: number) => {
      set({ timeOfDay: createTimeOfDay(hour) });
    },

    setTimeSpeed: (speed: TimeSpeed) => {
      set({ timeSpeed: speed });
    },

    updateStats: (updates: Partial<TrafficStats>) => {
      set(state => ({ stats: { ...state.stats, ...updates } }));
    },

    addPrediction: (prediction: Prediction) => {
      set(state => ({ predictions: [...state.predictions, prediction] }));
    },

    toggleLayer: (layer: keyof AppState['layers']) => {
      set(state => ({
        layers: { ...state.layers, [layer]: !state.layers[layer] }
      }));
    },

    addIncident: (incident: Accident) => {
      set(state => ({ accidents: [...state.accidents, incident] }));
    },

    updateIncident: (id: string, updates: Partial<Accident>) => {
      set(state => ({
        accidents: state.accidents.map(a => a.id === id ? { ...a, ...updates } : a)
      }));
    },

    clearIncident: (id: string) => {
      set(state => ({
        accidents: state.accidents.map(a =>
          a.id === id ? { ...a, status: 'cleared' as const } : a
        )
      }));
    },
  }))
);

export type TrafficStore = typeof useTrafficStore;
