import { Match } from '../types/tournament';
import { loadLocalMatches, saveLocalMatches, syncMatchToSupabase, getSupabaseClient } from './supabase';

const CHANNEL_NAME = 'pickleball_realtime_broadcast';
const LOCK_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes timeout to prevent deadlocks

export type SyncEvent =
  | { type: 'MATCH_LIVE_UPDATE'; match: Match; timestamp: number }
  | { type: 'MATCH_LOCKED'; matchId: string; refereeName: string; court: string; timestamp: number }
  | { type: 'MATCH_UNLOCKED'; matchId: string; timestamp: number }
  | { type: 'MATCH_COMPLETED'; match: Match; timestamp: number }
  | { type: 'BATCH_SYNC'; matches: Match[]; timestamp: number };

class TournamentSyncManager {
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<(event: SyncEvent) => void> = new Set();
  private supabaseSubscription: any = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data) {
            this.notifyListeners(event.data);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    // Storage event fallback for older browsers / iframes
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'pickleball_matches_v4' && e.newValue) {
          try {
            const matches: Match[] = JSON.parse(e.newValue);
            this.notifyListeners({
              type: 'BATCH_SYNC',
              matches,
              timestamp: Date.now(),
            });
          } catch {
            // ignore
          }
        }
      });
    }

    this.initSupabaseRealtime();
  }

  public initSupabaseRealtime() {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      if (this.supabaseSubscription) {
        this.supabaseSubscription.unsubscribe();
      }

      this.supabaseSubscription = client
        .channel('realtime-matches')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'matches' },
          (payload: any) => {
            if (payload.new) {
              const d = payload.new;
              const cloudMatch: Match = {
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
                lastUpdatedAt: d.updated_at ? new Date(d.updated_at).getTime() : Date.now(),
              };

              this.notifyListeners({
                type: 'MATCH_LIVE_UPDATE',
                match: cloudMatch,
                timestamp: Date.now(),
              });
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Failed to subscribe to Supabase Realtime:', e);
    }
  }

  public subscribe(callback: (event: SyncEvent) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(event: SyncEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (e) {
        console.error('Error in sync listener:', e);
      }
    });
  }

  public broadcast(event: SyncEvent) {
    // Notify local listeners
    this.notifyListeners(event);

    // Notify other tabs
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(event);
      } catch (e) {
        console.warn('Broadcast postMessage failed:', e);
      }
    }
  }

  /**
   * Atomic match update:
   * Merges the single updated match into existing storage so other matches being updated
   * by other referees at the exact same time are NOT overwritten!
   */
  public atomicSaveMatch(updatedMatch: Match): Match[] {
    const existing = loadLocalMatches() || [];
    const now = Date.now();
    const enrichedMatch = {
      ...updatedMatch,
      lastUpdatedAt: now,
    };

    let found = false;
    const merged = existing.map((m) => {
      if (m.id === enrichedMatch.id) {
        found = true;
        return enrichedMatch;
      }
      return m;
    });

    if (!found) {
      merged.push(enrichedMatch);
    }

    // Save to storage
    saveLocalMatches(merged);

    // Broadcast live event to all other tabs
    this.broadcast({
      type: 'MATCH_LIVE_UPDATE',
      match: enrichedMatch,
      timestamp: now,
    });

    // Sync to Supabase in background
    syncMatchToSupabase(enrichedMatch);

    return merged;
  }

  /**
   * Check if a match is actively locked by another referee
   */
  public isMatchLockedByOther(match: Match, currentRefereeName: string): boolean {
    if (!match.lockedByRefereeName) return false;
    // If locked by the current referee, it is allowed
    if (match.lockedByRefereeName.trim().toLowerCase() === currentRefereeName.trim().toLowerCase()) {
      return false;
    }
    // Check lock expiration
    if (match.lockedAt && Date.now() - match.lockedAt > LOCK_TIMEOUT_MS) {
      return false; // Lock expired
    }
    return true;
  }

  /**
   * Acquire exclusive lock on match
   */
  public acquireMatchLock(match: Match, refereeName: string, court: string): Match {
    const now = Date.now();
    const lockedMatch: Match = {
      ...match,
      lockedByRefereeName: refereeName,
      lockedByCourt: court,
      lockedAt: now,
      lastUpdatedAt: now,
      status: match.status === 'pending' ? 'live' : match.status,
    };

    this.atomicSaveMatch(lockedMatch);

    this.broadcast({
      type: 'MATCH_LOCKED',
      matchId: match.id,
      refereeName,
      court,
      timestamp: now,
    });

    return lockedMatch;
  }

  /**
   * Release match lock
   */
  public releaseMatchLock(match: Match): Match {
    const now = Date.now();
    const unlockedMatch: Match = {
      ...match,
      lockedByRefereeName: undefined,
      lockedByCourt: undefined,
      lockedAt: undefined,
      lastUpdatedAt: now,
    };

    this.atomicSaveMatch(unlockedMatch);

    this.broadcast({
      type: 'MATCH_UNLOCKED',
      matchId: match.id,
      timestamp: now,
    });

    return unlockedMatch;
  }

  /**
   * Force emergency unlock (Admin override)
   */
  public forceUnlockMatch(match: Match): Match {
    return this.releaseMatchLock(match);
  }

  /**
   * Broadcast a batch update to all tabs (used during reset or scenario swap)
   */
  public broadcastBatch(matches: Match[]): void {
    const now = Date.now();
    this.broadcast({
      type: 'BATCH_SYNC',
      matches,
      timestamp: now,
    });
  }

  /**
   * Clear all active locks (Admin reset before tournament start)
   */
  public clearAllLocks(): void {
    const existing = loadLocalMatches() || [];
    const unlocked = existing.map((m) => ({
      ...m,
      lockedByRefereeName: undefined,
      lockedByCourt: undefined,
      lockedAt: undefined,
    }));
    saveLocalMatches(unlocked);
    this.broadcastBatch(unlocked);
  }
}

export const syncManager = new TournamentSyncManager();
