import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const systemPrompt = `You are an advanced AI traffic management assistant for IntelliTraffic AI, a smart city traffic intelligence platform. You help users understand traffic conditions, predict congestion, and optimize traffic flow.

Your capabilities include:
- Real-time traffic analysis and explanations
- Route recommendations and alternatives
- Traffic incident reporting and status
- Congestion predictions based on patterns
- Emergency vehicle coordination assistance
- Parking availability information
- Weather impact on traffic

When referencing map elements, include action data in this format:
[ACTION:type:data]
- highlight_road: highlight a specific road segment
- show_route: display a route on the map
- center_camera:focus camera on coordinates
- show_stats:display relevant statistics

Be concise, helpful, and authoritative. Always provide actionable insights.`;

export interface AIChatResponse {
  text: string;
  action?: {
    type: 'highlight_road' | 'show_route' | 'center_camera' | 'show_stats';
    data: any;
  };
}

export async function sendChatMessage(
  userMessage: string,
  context?: {
    selectedRoad?: any;
    selectedVehicle?: any;
    currentStats?: any;
    weather?: any;
  }
): Promise<AIChatResponse> {
  if (!genAI) {
    return simulateResponse(userMessage, context);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const contextInfo = context
      ? `\n\nCurrent Context:
${context.selectedRoad ? `Selected Road: ${JSON.stringify(context.selectedRoad)}` : ''}
${context.selectedVehicle ? `Selected Vehicle: ${JSON.stringify(context.selectedVehicle)}` : ''}
${context.currentStats ? `Traffic Stats: ${JSON.stringify(context.currentStats)}` : ''}
${context.weather ? `Weather: ${JSON.stringify(context.weather)}` : ''}`
      : '';

    const prompt = `${systemPrompt}${contextInfo}\n\nUser: ${userMessage}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const action = parseAction(text);

    return {
      text: text.replace(/\[ACTION:[^\]]+\]/g, '').trim(),
      action,
    };
  } catch (error) {
    console.error('AI Error:', error);
    return simulateResponse(userMessage, context);
  }
}

function parseAction(text: string): AIChatResponse['action'] | undefined {
  const actionMatch = text.match(/\[ACTION:(\w+):([^\]]+)\]/);
  if (actionMatch) {
    const typeStr = actionMatch[1];
    const type = typeStr as 'highlight_road' | 'show_route' | 'center_camera' | 'show_stats';
    try {
      const data = JSON.parse(actionMatch[2]);
      return { type, data };
    } catch {
      return { type, data: actionMatch[2] };
    }
  }
  return undefined;
}

function simulateResponse(
  message: string,
  context?: any
): AIChatResponse {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('heavy') || lowerMessage.includes('congestion')) {
    return {
      text: `Traffic congestion is currently moderate across the city. **Key congested areas**:\n\n• Main Boulevard (downtown section) - 15 min delay\n• Highway 101 (eastbound) - 10 min delay\n• Commerce Street - light traffic only\n\n**Recommendation**: Use Central Avenue for east-west travel. It's currently flowing at 85% of speed limit with minimal delays.`,
      action: {
        type: 'highlight_road',
        data: { roadId: 'road-0', congestion: 'heavy' }
      }
    };
  }

  if (lowerMessage.includes('route') || lowerMessage.includes('alternate')) {
    return {
      text: `I've analyzed current traffic patterns. **Best routes right now**:\n\n🚗 **To Downtown**: Take Highway 101 → Main Boulevard (~18 min)\n\n🚗 **To Airport**: Industrial Avenue → Highway 101 (~25 min)\n\n🚗 **Avoid**: Main Boulevard between Commerce and Park Lane - active incident causing 20+ min delays.\n\nWould you like turn-by-turn navigation?`,
      action: {
        type: 'show_route',
        data: { from: 'current', to: 'downtown' }
      }
    };
  }

  if (lowerMessage.includes('predict') || lowerMessage.includes('forecast')) {
    return {
      text: `**30-Minute Traffic Prediction**:\n\n📈 **Congestion**: Expected to increase 15% as rush hour approaches\n\n⚡ **Average Speed**: Will drop from 42 km/h to ~35 km/h\n\n🚗 **Volume**: +200 vehicles expected\n\n**Confidence**: 87%\n\n**Factors**:\n• Schools dismissed at 3:30 PM\n• Concert downtown at 7 PM\n• Light rain expected in 45 min`,
      action: {
        type: 'show_stats',
        data: { timeframe: '30min' }
      }
    };
  }

  if (lowerMessage.includes('accident') || lowerMessage.includes('incident')) {
    return {
      text: `**Active Incidents**:\n\n🔴 **Collision** - Main Boulevard & Commerce Street\nSeverity: Moderate | Lanes blocked: 1\nStatus: EMS on scene\nETA Clear: 30 min\n\n🟡 **Breakdown** - Highway 101 Mile 42\nShoulder only, minimal impact\nTow truck dispatched\n\n🟠 **Construction** - Residential Drive\nLane closure until 6 PM\n\n**Recommendation**: Avoid Main Boulevard. Use Park Lane as alternate.`,
      action: {
        type: 'center_camera',
        data: { x: 25, y: 0, z: 5 }
      }
    };
  }

  if (lowerMessage.includes('parking')) {
    return {
      text: `**Parking Availability**:\n\n🅿️ **Downtown Garage** - 45 spots avail\nRate: $4/hr | 2 min walk\n\n🅿️ **Metro Mall** - 120 spots avail\nRate: $3/hr | 5 min walk\n\n🅿️ **Street Parking** - 12 spots avail\nRate: $2/hr | Along Commerce St\n\n**Best Value**: Metro Mall garage, most availability and lowest rate.`,
    };
  }

  if (lowerMessage.includes('weather')) {
    return {
      text: `**Current Weather & Traffic Impact**:\n\n☀️ **Conditions**: Clear, 22°C\n💨 **Wind**: 12 km/h from West\n🌧️ **Rain Probability**: 15% (next 2 hours)\n\n**Traffic Impact**: None currently. Good visibility and dry roads. Expect normal speeds across all routes.\n\n**Tip**: Conditions optimal for travel. No weather-related delays expected.`,
    };
  }

  if (lowerMessage.includes('stats') || lowerMessage.includes('summary')) {
    return {
      text: `**Real-Time Traffic Summary**:\n\n🚗 **Total Vehicles**: 156 active\n⚡ **Average Speed**: 42 km/h\n📊 **Congestion Index**: 35% (Moderate)\n⚠️ **Active Incidents**: 3\n\n**Peak Hours Today**: 8-9 AM, 5-6 PM\n**Current Flow Rate**: 1,250 vehicles/hour\n\nOverall traffic is flowing well with minor delays in the downtown corridor.`,
      action: {
        type: 'show_stats',
        data: { timeframe: 'now' }
      }
    };
  }

  return {
    text: `I'm analyzing the traffic network. Here's what I can help you with:\n\n• **"Why is traffic heavy?"** - Explain current congestion\n• **"Find alternate route"** - Get best routes\n• **"Predict traffic in 30 min"** - AI forecast\n• **"Show accidents"** - Current incidents\n• **"Parking near downtown"** - Find spots\n• **"Traffic stats"** - Quick summary\n\nWhat would you like to know?`,
  };
}

export async function predictTraffic(
  currentTime: number,
  currentCongestion: number,
  historicalData?: any[]
): Promise<{
  predictedCongestion: number;
  predictedSpeed: number;
  predictedVolume: number;
  confidence: number;
  factors: string[];
}> {
  // Simulate prediction logic
  const hourFactor = Math.sin((currentTime / 24) * Math.PI * 2);
  const basePrediction = currentCongestion + (hourFactor * 0.15);

  return {
    predictedCongestion: Math.max(0, Math.min(1, basePrediction)),
    predictedSpeed: 50 * (1 - basePrediction * 0.6),
    predictedVolume: Math.floor(150 + basePrediction * 100),
    confidence: 0.85 + Math.random() * 0.1,
    factors: [
      'Time of day pattern',
      'Historical trends',
      'Weather conditions',
      'Event schedules',
    ],
  };
}
