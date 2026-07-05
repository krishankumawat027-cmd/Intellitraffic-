/*
# IntelliTraffic AI Database Schema

1. New Tables
- `traffic_data` - Real-time traffic metrics per road segment
  - vehicle_count, average_speed, congestion_level, timestamp
- `incidents` - Traffic incidents and accidents
  - type, severity, position, status, description, responders
- `analytics` - Historical traffic analytics
  - metrics over time for trend analysis
- `predictions` - AI-generated traffic predictions
  - predicted congestion, speed, volume with confidence scores
- `chat_history` - AI chat interaction history
  - user messages and AI responses

2. Security
- Enable RLS on all tables
- Public read access for demo (no auth required)
- Insert/update allowed for all (demo mode)
*/

CREATE TABLE IF NOT EXISTS traffic_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  road_id text NOT NULL,
  road_name text NOT NULL,
  vehicle_count integer NOT NULL DEFAULT 0,
  average_speed decimal(5,2) NOT NULL DEFAULT 0,
  congestion_level decimal(3,2) NOT NULL DEFAULT 0,
  flow_rate integer NOT NULL DEFAULT 0,
  timestamp timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('collision', 'breakdown', 'hazard', 'construction', 'flood')),
  severity text NOT NULL CHECK (severity IN ('minor', 'moderate', 'severe')),
  position_x decimal(10,2) NOT NULL,
  position_y decimal(10,2) NOT NULL DEFAULT 0,
  position_z decimal(10,2) NOT NULL,
  road_id text,
  description text,
  affected_lanes integer DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'responding', 'cleared')),
  responders text[] DEFAULT '{}',
  estimated_clear_time timestamptz,
  timestamp timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_vehicles integer NOT NULL DEFAULT 0,
  average_speed decimal(5,2) NOT NULL DEFAULT 0,
  congestion_index decimal(3,2) NOT NULL DEFAULT 0,
  incident_count integer NOT NULL DEFAULT 0,
  flow_rate integer NOT NULL DEFAULT 0,
  peak_hour boolean DEFAULT false,
  timestamp timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL,
  predicted_congestion decimal(3,2) NOT NULL,
  predicted_speed decimal(5,2) NOT NULL,
  predicted_volume integer NOT NULL,
  confidence decimal(3,2) NOT NULL,
  factors text[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  agent text,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE traffic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Traffic data policies
DROP POLICY IF EXISTS "public_read_traffic" ON traffic_data;
CREATE POLICY "public_read_traffic" ON traffic_data FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_traffic" ON traffic_data;
CREATE POLICY "public_insert_traffic" ON traffic_data FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Incidents policies
DROP POLICY IF EXISTS "public_read_incidents" ON incidents;
CREATE POLICY "public_read_incidents" ON incidents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_incidents" ON incidents;
CREATE POLICY "public_insert_incidents" ON incidents FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_incidents" ON incidents;
CREATE POLICY "public_update_incidents" ON incidents FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Analytics policies
DROP POLICY IF EXISTS "public_read_analytics" ON analytics;
CREATE POLICY "public_read_analytics" ON analytics FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_analytics" ON analytics;
CREATE POLICY "public_insert_analytics" ON analytics FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Predictions policies
DROP POLICY IF EXISTS "public_read_predictions" ON predictions;
CREATE POLICY "public_read_predictions" ON predictions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_predictions" ON predictions;
CREATE POLICY "public_insert_predictions" ON predictions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Chat history policies
DROP POLICY IF EXISTS "public_read_chat" ON chat_history;
CREATE POLICY "public_read_chat" ON chat_history FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_chat" ON chat_history;
CREATE POLICY "public_insert_chat" ON chat_history FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_traffic_data_timestamp ON traffic_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_traffic_data_road ON traffic_data(road_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_timestamp ON incidents(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_timestamp ON predictions(timestamp);