/*
# IntelliTraffic Auth and Role-Based Access Schema

1. New Tables
- `profiles` - User profiles with role information
  - id, email, role, name, avatar, created_at
- `officers` - Traffic officer management
  - id, name, badge_number, rank, status, assigned_area, contact
- `citizen_reports` - Reports from citizens
  - id, type, description, location, status, user_id, image_url, admin_notes
- `road_closures` - Road closures management
  - id, road_name, reason, start_time, end_time, status, created_by
- `notifications` - Real-time notifications
  - id, type, title, message, target_role, read, created_at
- `incidents` - Extended incident tracking
  - id, type, severity, status, location, assigned_officer, citizen_report_id

2. Security
- Enable RLS on all tables
- Owner-scoped policies for user data
- Admin full access on operational tables
- Citizens can only read approved content
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'citizen' CHECK (role IN ('admin', 'traffic_officer', 'citizen')),
  full_name text,
  avatar_url text,
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Officers table
CREATE TABLE IF NOT EXISTS officers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  badge_number text UNIQUE NOT NULL,
  rank text DEFAULT 'officer' CHECK (rank IN ('officer', 'senior_officer', 'supervisor', 'commander')),
  status text DEFAULT 'available' CHECK (status IN ('available', 'on_duty', 'off_duty', 'break', 'emergency')),
  assigned_area text,
  contact_number text,
  user_id uuid REFERENCES auth.users(id),
  location_lat decimal(9,6),
  location_lng decimal(9,6),
  profile_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Citizen Reports table
CREATE TABLE IF NOT EXISTS citizen_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  type text NOT NULL CHECK (type IN ('accident', 'traffic_jam', 'broken_signal', 'road_damage', 'illegal_parking', 'flood', 'construction', 'other')),
  title text NOT NULL,
  description text,
  image_url text,
  location_address text,
  location_x decimal(10,2),
  location_y decimal(10,2),
  location_z decimal(10,2),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'resolved')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  admin_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Road Closures table
CREATE TABLE IF NOT EXISTS road_closures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  road_name text NOT NULL,
  road_id text,
  reason text,
  closure_type text DEFAULT 'full' CHECK (closure_type IN ('full', 'partial', 'lane')),
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'scheduled', 'completed', 'cancelled')),
  location_x decimal(10,2),
  location_z decimal(10,2),
  affected_lanes integer DEFAULT 0,
  alternate_route text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  type text NOT NULL CHECK (type IN ('incident', 'report', 'alert', 'system', 'approval', 'closure', 'warning')),
  title text NOT NULL,
  message text,
  data jsonb,
  target_role text CHECK (target_role IN ('admin', 'traffic_officer', 'citizen', 'all')),
  is_read boolean DEFAULT false,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  created_at timestamptz DEFAULT now()
);

-- Signal Management table
CREATE TABLE IF NOT EXISTS signal_management (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id text NOT NULL,
  name text,
  current_state text DEFAULT 'red' CHECK (current_state IN ('red', 'yellow', 'green')),
  manual_override boolean DEFAULT false,
  override_state text CHECK (override_state IN ('red', 'yellow', 'green')),
  cycle_time_green integer DEFAULT 30,
  cycle_time_red integer DEFAULT 45,
  congestion_level decimal(3,2) DEFAULT 0,
  ai_recommendation text,
  is_emergency_corridor boolean DEFAULT false,
  last_updated timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Emergency Alerts table
CREATE TABLE IF NOT EXISTS emergency_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('accident', 'fire', 'medical', 'security', 'natural_disaster', 'other')),
  severity text DEFAULT 'moderate' CHECK (severity IN ('minor', 'moderate', 'severe', 'critical')),
  title text NOT NULL,
  description text,
  location_address text,
  location_x decimal(10,2),
  location_y decimal(10,2),
  location_z decimal(10,2),
  status text DEFAULT 'active' CHECK (status IN ('active', 'responding', 'resolved')),
  broadcast_sent boolean DEFAULT false,
  responders text[],
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Parking Management table
CREATE TABLE IF NOT EXISTS parking_lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text DEFAULT 'street' CHECK (type IN ('street', 'lot', 'garage', 'underground')),
  total_spots integer NOT NULL,
  available_spots integer NOT NULL,
  rate_per_hour decimal(6,2),
  location_x decimal(10,2),
  location_z decimal(10,2),
  address text,
  is_open boolean DEFAULT true,
  features text[],
  last_updated timestamptz DEFAULT now()
);

-- Analytics Log table
CREATE TABLE IF NOT EXISTS analytics_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL,
  metric_value decimal(10,2),
  unit text,
  location_id text,
  timestamp timestamptz DEFAULT now(),
  metadata jsonb
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE road_closures ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
CREATE POLICY "users_read_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_read_all_profiles" ON profiles;
CREATE POLICY "admin_read_all_profiles" ON profiles FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_manage_profiles" ON profiles;
CREATE POLICY "admin_manage_profiles" ON profiles FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Citizen can insert their own profile
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Officers policies (admin manages)
DROP POLICY IF EXISTS "admin_manage_officers" ON officers;
CREATE POLICY "admin_manage_officers" ON officers FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'traffic_officer'))
  );

DROP POLICY IF EXISTS "officer_read_own" ON officers;
CREATE POLICY "officer_read_own" ON officers FOR SELECT
  TO authenticated USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Citizen Reports policies
DROP POLICY IF EXISTS "citizen_crud_reports" ON citizen_reports;
CREATE POLICY "citizen_crud_reports" ON citizen_reports FOR ALL
  TO authenticated USING (auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'traffic_officer'))
  );

DROP POLICY IF EXISTS "admin_manage_reports" ON citizen_reports;
CREATE POLICY "admin_manage_reports" ON citizen_reports FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'traffic_officer'))
  );

-- Road Closures - admin/officer manage, citizen read
DROP POLICY IF EXISTS "admin_manage_closures" ON road_closures;
CREATE POLICY "admin_manage_closures" ON road_closures FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'traffic_officer'))
  );

DROP POLICY IF EXISTS "citizen_read_closures" ON road_closures;
CREATE POLICY "citizen_read_closures" ON road_closures FOR SELECT
  TO authenticated USING (status = 'active');

-- Notifications - users read own
DROP POLICY IF EXISTS "users_read_notifications" ON notifications;
CREATE POLICY "users_read_notifications" ON notifications FOR SELECT
  TO authenticated USING (user_id = auth.uid() OR target_role = 'all' OR target_role IS NULL);

DROP POLICY IF EXISTS "users_update_notifications" ON notifications;
CREATE POLICY "users_update_notifications" ON notifications FOR UPDATE
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "system_insert_notifications" ON notifications;
CREATE POLICY "system_insert_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (true);

-- Signal Management - admin/officer only
DROP POLICY IF EXISTS "admin_manage_signals" ON signal_management;
CREATE POLICY "admin_manage_signals" ON signal_management FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'traffic_officer'))
  );

DROP POLICY IF EXISTS "citizen_read_signals" ON signal_management;
CREATE POLICY "citizen_read_signals" ON signal_management FOR SELECT
  TO authenticated USING (true);

-- Emergency Alerts - admin manage, all read active
DROP POLICY IF EXISTS "admin_manage_alerts" ON emergency_alerts;
CREATE POLICY "admin_manage_alerts" ON emergency_alerts FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'traffic_officer'))
  );

DROP POLICY IF EXISTS "all_read_active_alerts" ON emergency_alerts;
CREATE POLICY "all_read_active_alerts" ON emergency_alerts FOR SELECT
  TO authenticated USING (status IN ('active', 'responding'));

-- Parking - all read, admin manage
DROP POLICY IF EXISTS "admin_manage_parking" ON parking_lots;
CREATE POLICY "admin_manage_parking" ON parking_lots FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'traffic_officer'))
  );

DROP POLICY IF EXISTS "all_read_parking" ON parking_lots;
CREATE POLICY "all_read_parking" ON parking_lots FOR SELECT
  TO authenticated USING (true);

-- Analytics - admin only
DROP POLICY IF EXISTS "admin_access_analytics" ON analytics_log;
CREATE POLICY "admin_access_analytics" ON analytics_log FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_status ON citizen_reports(status);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_user ON citizen_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_road_closures_status ON road_closures(status);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_status ON emergency_alerts(status);