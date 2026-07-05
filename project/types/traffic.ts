export interface Vehicle {
  id: string;
  position: { x: number; y: number; z: number };
  rotation: number;
  speed: number;
  type: 'car' | 'truck' | 'bus' | 'emergency' | 'motorcycle';
  color: string;
  destination?: string;
  route: string[];
  status: 'moving' | 'stopped' | 'yielding' | 'emergency';
  license: string;
  eta?: number;
}

export interface TrafficSignal {
  id: string;
  position: { x: number; y: number; z: number };
  state: 'red' | 'yellow' | 'green';
  timer: number;
  cycleTime: number;
  congestion: number;
  aiRecommendation?: string;
  roadId: string;
}

export interface Road {
  id: string;
  name: string;
  type: 'highway' | 'main' | 'residential' | 'service';
  lanes: number;
  speedLimit: number;
  points: { x: number; z: number }[];
  width: number;
  trafficDensity: number;
  averageSpeed: number;
  vehicleCount: number;
  predictedDelay: number;
  congestion: 'low' | 'medium' | 'heavy' | 'blocked';
}

export interface Building {
  id: string;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
  type: 'commercial' | 'residential' | 'industrial' | 'landmark' | 'parking';
  name: string;
  floors: number;
  hasHelipad: boolean;
  rooftopAccess: boolean;
}

export interface Accident {
  id: string;
  position: { x: number; y: number; z: number };
  severity: 'minor' | 'moderate' | 'severe';
  type: 'collision' | 'breakdown' | 'hazard' | 'construction';
  status: 'active' | 'responding' | 'cleared';
  timestamp: Date;
  description: string;
  affectedLanes: number;
  estimatedClearTime: Date;
  responders: string[];
  roadId: string;
}

export interface WeatherCondition {
  type: 'clear' | 'cloudy' | 'rain' | 'fog' | 'storm' | 'snow';
  intensity: number;
  visibility: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
}

export interface TimeOfDay {
  hour: number;
  minute: number;
  isDay: boolean;
  sunPosition: { x: number; y: number; z: number };
  ambientIntensity: number;
}

export interface TrafficStats {
  totalVehicles: number;
  averageSpeed: number;
  congestionIndex: number;
  incidents: number;
  flowRate: number;
  peakHour: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agent?: string;
  isLoading?: boolean;
}

export interface AIResponse {
  text: string;
  action?: {
    type: 'highlight_road' | 'show_route' | 'update_signal' | 'center_camera' | 'show_stats';
    data: any;
  };
  confidence: number;
}

export interface ParkingSpot {
  id: string;
  position: { x: number; y: number; z: number };
  status: 'available' | 'occupied' | 'reserved' | 'disabled';
  type: 'street' | 'lot' | 'garage' | 'vip';
  rate: number;
  duration: number;
}

export interface EmergencyVehicle {
  id: string;
  type: 'police' | 'fire' | 'ambulance' | 'tow';
  position: { x: number; y: number; z: number };
  status: 'available' | 'dispatched' | 'enroute' | 'onsite';
  destination?: { x: number; y: number; z: number };
  speed: number;
  incident?: string;
}

export interface AnalyticsData {
  timestamp: Date;
  vehicleCount: number;
  averageSpeed: number;
  congestionLevel: number;
  incidentCount: number;
  flowRate: number;
  peakTime: boolean;
  roadId: string;
}

export interface Prediction {
  timestamp: Date;
  predictedCongestion: number;
  predictedSpeed: number;
  predictedVolume: number;
  confidence: number;
  factors: string[];
}

export type ViewMode = 'orbit' | 'flyover' | 'follow' | 'free';
export type TimeSpeed = 0.5 | 1 | 2 | 5 | 10;
export type WeatherType = WeatherCondition['type'];

export interface AppState {
  vehicles: Vehicle[];
  signals: TrafficSignal[];
  roads: Road[];
  buildings: Building[];
  accidents: Accident[];
  parkingSpots: ParkingSpot[];
  emergencyVehicles: EmergencyVehicle[];

  weather: WeatherCondition;
  timeOfDay: TimeOfDay;
  timeSpeed: TimeSpeed;

  viewMode: ViewMode;
  selectedObject: Vehicle | Road | Accident | TrafficSignal | null;
  selectedType: 'vehicle' | 'road' | 'accident' | 'signal' | null;

  cameraTarget: { x: number; y: number; z: number } | null;
  flyoverActive: boolean;

  chatMessages: ChatMessage[];
  isAIThinking: boolean;

  showAnalytics: boolean;
  showSettings: boolean;
  showLayers: boolean;

  stats: TrafficStats;
  predictions: Prediction[];

  layers: {
    traffic: boolean;
    incidents: boolean;
    parking: boolean;
    heatmap: boolean;
    buildings: boolean;
    streetLights: boolean;
    pedestrians: boolean;
  };

  // Actions
  selectObject: (object: any, type: 'vehicle' | 'road' | 'accident' | 'signal' | null) => void;
  clearSelection: () => void;
  setCameraTarget: (target: { x: number; y: number; z: number } | null) => void;
  toggleFlyover: () => void;
  setViewMode: (mode: ViewMode) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setAIThinking: (thinking: boolean) => void;
  toggleAnalytics: () => void;
  toggleSettings: () => void;
  toggleLayers: () => void;
  updateWeather: (updates: Partial<WeatherCondition>) => void;
  updateTimeOfDay: (hour: number) => void;
  setTimeSpeed: (speed: TimeSpeed) => void;
  updateStats: (updates: Partial<TrafficStats>) => void;
  addPrediction: (prediction: Prediction) => void;
  toggleLayer: (layer: keyof AppState['layers']) => void;
  addIncident: (incident: Accident) => void;
  updateIncident: (id: string, updates: Partial<Accident>) => void;
  clearIncident: (id: string) => void;
  cycleSignals: () => void;
  updateAllVehicles: (updatesFn: (vehicles: Vehicle[]) => Vehicle[]) => void;
}

export type RoadClickData = Pick<Road, 'id' | 'name' | 'trafficDensity' | 'averageSpeed' | 'vehicleCount' | 'predictedDelay'>;
export type VehicleClickData = Pick<Vehicle, 'id' | 'type' | 'speed' | 'destination' | 'status' | 'license' | 'eta'>;
export type AccidentClickData = Pick<Accident, 'id' | 'severity' | 'type' | 'status' | 'description' | 'estimatedClearTime'>;
export type SignalClickData = Pick<TrafficSignal, 'id' | 'state' | 'timer' | 'cycleTime' | 'congestion' | 'aiRecommendation'>;
