import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getTrafficData() {
  const { data, error } = await supabase
    .from('traffic_data')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data;
}

export async function subscribeToTraffic(callback: (payload: any) => void) {
  return supabase
    .channel('traffic_updates')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'traffic_data' }, callback)
    .subscribe();
}

export async function getIncidents() {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .eq('status', 'active')
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createIncident(incident: any) {
  const { data, error } = await supabase
    .from('incidents')
    .insert(incident)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateIncident(id: string, updates: any) {
  const { data, error } = await supabase
    .from('incidents')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAnalyticsHistory(hours: number = 24) {
  const now = new Date();
  const from = new Date(now.getTime() - hours * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('analytics')
    .select('*')
    .gte('timestamp', from.toISOString())
    .order('timestamp', { ascending: true });

  if (error) throw error;
  return data;
}

export async function saveAnalyticsData(data: any) {
  const { error } = await supabase
    .from('analytics')
    .insert(data);

  if (error) console.error('Failed to save analytics:', error);
}

export async function getPredictions() {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .order('timestamp', { ascending: true })
    .limit(24);

  if (error) throw error;
  return data;
}
