import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Match, Team, TournamentConfig, RefereeAccount } from '../types/tournament';

const STORAGE_KEY_URL = 'pickleball_supabase_url';
const STORAGE_KEY_ANON_KEY = 'pickleball_supabase_anon_key';
const STORAGE_KEY_MATCHES = 'pickleball_matches_v4';
const STORAGE_KEY_TEAMS = 'pickleball_teams_v4';
const STORAGE_KEY_CONFIG = 'pickleball_config_v4';
const STORAGE_KEY_REFEREES = 'pickleball_referees_v4';

let clientInstance: SupabaseClient | null = null;

export function getSupabaseCredentials() {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON_KEY) || '' : '';

  return {
    url: localUrl || envUrl,
    anonKey: localKey || envKey,
    isFromEnv: Boolean(envUrl && envKey),
  };
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey) {
    clientInstance = null;
    return null;
  }
  if (!clientInstance) {
    try {
      clientInstance = createClient(url, anonKey, {
        auth: { persistSession: false },
      });
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      clientInstance = null;
    }
  }
  return clientInstance;
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_ANON_KEY, anonKey.trim());
    clientInstance = null; // Reset so next call recreates with new config
  }
}

export function clearSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON_KEY);
    clientInstance = null;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const testClient = createClient(url.trim(), anonKey.trim(), {
      auth: { persistSession: false },
    });
    const { error } = await testClient.from('matches').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Kết nối thành công! Bảng "matches" chưa được tạo. Hãy chạy script SQL đính kèm trong Supabase SQL Editor.',
        };
      }
      return {
        success: false,
        message: `Lỗi Supabase: ${error.message} (${error.code || 'Unauthorized'})`,
      };
    }
    return {
      success: true,
      message: 'Kết nối Supabase thành công! Dữ liệu đã sẵn sàng đồng bộ realtime.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Không thể kết nối Supabase: ${msg}`,
    };
  }
}

// ========================================================
// Data Persistence (Supabase + LocalStorage Fallback)
// ========================================================

export function loadLocalMatches(): Match[] | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY_MATCHES);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Match[];
  } catch {
    return null;
  }
}

export function saveLocalMatches(matches: Match[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(matches));
}

export function loadLocalTeams(): Team[] | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY_TEAMS);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Team[];
  } catch {
    return null;
  }
}

export function saveLocalTeams(teams: Team[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(teams));
}

export function loadLocalConfig(): TournamentConfig | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TournamentConfig;
  } catch {
    return null;
  }
}

export function saveLocalConfig(config: TournamentConfig) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
}

export function loadLocalReferees(): RefereeAccount[] | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY_REFEREES);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RefereeAccount[];
  } catch {
    return null;
  }
}

export function saveLocalReferees(referees: RefereeAccount[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_REFEREES, JSON.stringify(referees));
}

// Sync to Supabase
export async function syncMatchToSupabase(match: Match): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('matches').upsert({
      id: match.id,
      stage: match.stage,
      group_id: match.groupId || null,
      round_name: match.roundName,
      match_number: match.matchNumber,
      court: match.court,
      start_time: match.startTime || null,
      team1_id: match.team1Id,
      team2_id: match.team2Id,
      score1: match.score1,
      score2: match.score2,
      status: match.status,
      winner_id: match.winnerId || null,
      server_number: match.serverNumber || 1,
      serving_team_id: match.servingTeamId || null,
      history: match.history || [],
      referee_notes: match.refereeNotes || null,
      referee_name: match.refereeName || null,
      locked_by_referee_name: match.lockedByRefereeName || null,
      locked_by_court: match.lockedByCourt || null,
      locked_at: match.lockedAt ? new Date(match.lockedAt).toISOString() : null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Supabase upsert match error:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('Supabase error:', e);
    return false;
  }
}

export async function fetchMatchesFromSupabase(): Promise<Match[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from('matches').select('*').order('match_number', { ascending: true });
    if (error || !data || data.length === 0) return null;

    return data.map((d) => ({
      id: d.id,
      stage: d.stage,
      groupId: d.group_id,
      roundName: d.round_name,
      matchNumber: d.match_number,
      court: d.court,
      startTime: d.start_time,
      team1Id: d.team1_id,
      team2Id: d.team2_id,
      score1: d.score1 ?? 0,
      score2: d.score2 ?? 0,
      targetPoints: 11,
      status: d.status || 'pending',
      winnerId: d.winner_id,
      serverNumber: d.server_number || 1,
      servingTeamId: d.serving_team_id,
      history: d.history || [],
      refereeNotes: d.referee_notes,
      refereeName: d.referee_name,
      lockedByRefereeName: d.locked_by_referee_name,
      lockedByCourt: d.locked_by_court,
      lockedAt: d.locked_at ? new Date(d.locked_at).getTime() : undefined,
    }));
  } catch (e) {
    console.warn('Fetch from Supabase failed:', e);
    return null;
  }
}

export async function syncAllMatchesToSupabase(matches: Match[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const records = matches.map((m) => ({
      id: m.id,
      stage: m.stage,
      group_id: m.groupId || null,
      round_name: m.roundName,
      match_number: m.matchNumber,
      court: m.court,
      start_time: m.startTime || null,
      team1_id: m.team1Id,
      team2_id: m.team2Id,
      score1: m.score1,
      score2: m.score2,
      status: m.status,
      winner_id: m.winnerId || null,
      server_number: m.serverNumber || 1,
      serving_team_id: m.servingTeamId || null,
      history: m.history || [],
      referee_notes: m.refereeNotes || null,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await client.from('matches').upsert(records);
    if (error) {
      console.warn('Failed bulk sync to Supabase:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('Bulk sync exception:', e);
    return false;
  }
}
