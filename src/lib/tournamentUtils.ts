import { Team, Match, GroupLetter, GroupStanding } from '../types/tournament';

/**
 * Calculates standings for a specific group based on completed matches.
 */
export function calculateGroupStandings(
  groupId: GroupLetter,
  teams: Team[],
  matches: Match[]
): GroupStanding[] {
  const groupTeams = teams.filter((t) => t.groupId === groupId);
  const groupMatches = matches.filter(
    (m) => m.stage === 'group' && m.groupId === groupId
  );

  const statsMap: Record<string, {
    played: number;
    won: number;
    lost: number;
    pointsFor: number;
    pointsAgainst: number;
    points: number;
  }> = {};

  groupTeams.forEach((t) => {
    statsMap[t.id] = {
      played: 0,
      won: 0,
      lost: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      points: 0,
    };
  });

  groupMatches.forEach((m) => {
    // Only count completed matches or matches that have score recorded
    if (m.status === 'completed' || m.score1 > 0 || m.score2 > 0) {
      const stats1 = statsMap[m.team1Id];
      const stats2 = statsMap[m.team2Id];

      if (stats1 && stats2) {
        if (m.status === 'completed') {
          stats1.played += 1;
          stats2.played += 1;
        }
        stats1.pointsFor += m.score1;
        stats1.pointsAgainst += m.score2;
        stats2.pointsFor += m.score2;
        stats2.pointsAgainst += m.score1;

        if (m.status === 'completed') {
          if (m.score1 > m.score2) {
            stats1.won += 1;
            stats1.points += 2;
            stats2.lost += 1;
          } else if (m.score2 > m.score1) {
            stats2.won += 1;
            stats2.points += 2;
            stats1.lost += 1;
          }
        }
      }
    }
  });

  // Convert to array and sort
  const standings: GroupStanding[] = groupTeams.map((team) => {
    const s = statsMap[team.id];
    const pointDiff = s.pointsFor - s.pointsAgainst;
    return {
      team,
      played: s.played,
      won: s.won,
      lost: s.lost,
      pointsFor: s.pointsFor,
      pointsAgainst: s.pointsAgainst,
      pointDiff,
      points: s.points,
      rank: 1,
      advancing: false,
    };
  });

  // Sort criteria:
  // 1. Points (2 pts per win)
  // 2. Point Difference (+/-)
  // 3. Points Scored (Points For)
  // 4. Head-to-Head if available
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;
    if (b.pointsFor !== a.pointsFor) return b.pointsFor - a.pointsFor;

    // Check direct match between a and b
    const directMatch = groupMatches.find(
      (m) =>
        (m.team1Id === a.team.id && m.team2Id === b.team.id) ||
        (m.team1Id === b.team.id && m.team2Id === a.team.id)
    );
    if (directMatch && directMatch.status === 'completed') {
      if (directMatch.winnerId === a.team.id) return -1;
      if (directMatch.winnerId === b.team.id) return 1;
    }

    return a.team.name.localeCompare(b.team.name);
  });

  // Assign ranks & advance top 2
  standings.forEach((s, idx) => {
    s.rank = idx + 1;
    s.advancing = s.rank <= 2;
  });

  return standings;
}

/**
 * Automatically propagates qualified teams into Quarterfinals, Semifinals, and Finals.
 */
export function autoAdvanceBracket(matches: Match[], teams: Team[]): Match[] {
  const updatedMatches = [...matches];

  const standingsA = calculateGroupStandings('A', teams, updatedMatches);
  const standingsB = calculateGroupStandings('B', teams, updatedMatches);
  const standingsC = calculateGroupStandings('C', teams, updatedMatches);
  const standingsD = calculateGroupStandings('D', teams, updatedMatches);

  // Group Leaders:
  // 1st & 2nd A
  const topA1 = standingsA[0]?.team?.id || '';
  const topA2 = standingsA[1]?.team?.id || '';

  // 1st & 2nd B
  const topB1 = standingsB[0]?.team?.id || '';
  const topB2 = standingsB[1]?.team?.id || '';

  // 1st & 2nd C
  const topC1 = standingsC[0]?.team?.id || '';
  const topC2 = standingsC[1]?.team?.id || '';

  // 1st & 2nd D
  const topD1 = standingsD[0]?.team?.id || '';
  const topD2 = standingsD[1]?.team?.id || '';

  // 1. Check Quarterfinals
  // TK 1: Nhất A vs Nhì B
  const qf1 = updatedMatches.find((m) => m.id === 'match_qf_1');
  if (qf1) {
    if (topA1) qf1.team1Id = topA1;
    if (topB2) qf1.team2Id = topB2;
  }

  // TK 2: Nhất C vs Nhì D
  const qf2 = updatedMatches.find((m) => m.id === 'match_qf_2');
  if (qf2) {
    if (topC1) qf2.team1Id = topC1;
    if (topD2) qf2.team2Id = topD2;
  }

  // TK 3: Nhất B vs Nhì A
  const qf3 = updatedMatches.find((m) => m.id === 'match_qf_3');
  if (qf3) {
    if (topB1) qf3.team1Id = topB1;
    if (topA2) qf3.team2Id = topA2;
  }

  // TK 4: Nhất D vs Nhì C
  const qf4 = updatedMatches.find((m) => m.id === 'match_qf_4');
  if (qf4) {
    if (topD1) qf4.team1Id = topD1;
    if (topC2) qf4.team2Id = topC2;
  }

  // 2. Semifinals
  // BK 1: Thắng TK 1 vs Thắng TK 2
  const sf1 = updatedMatches.find((m) => m.id === 'match_sf_1');
  if (sf1) {
    if (qf1?.winnerId) sf1.team1Id = qf1.winnerId;
    if (qf2?.winnerId) sf1.team2Id = qf2.winnerId;
  }

  // BK 2: Thắng TK 3 vs Thắng TK 4
  const sf2 = updatedMatches.find((m) => m.id === 'match_sf_2');
  if (sf2) {
    if (qf3?.winnerId) sf2.team1Id = qf3.winnerId;
    if (qf4?.winnerId) sf2.team2Id = qf4.winnerId;
  }

  // 3. Bronze Final (Tranh hạng Ba)
  const thirdPlace = updatedMatches.find((m) => m.id === 'match_third_place');
  if (thirdPlace) {
    if (sf1?.status === 'completed' && sf1.winnerId) {
      thirdPlace.team1Id = sf1.winnerId === sf1.team1Id ? sf1.team2Id : sf1.team1Id;
    }
    if (sf2?.status === 'completed' && sf2.winnerId) {
      thirdPlace.team2Id = sf2.winnerId === sf2.team1Id ? sf2.team2Id : sf2.team1Id;
    }
  }

  // 4. Grand Final (Chung kết)
  const finalMatch = updatedMatches.find((m) => m.id === 'match_final');
  if (finalMatch) {
    if (sf1?.winnerId) finalMatch.team1Id = sf1.winnerId;
    if (sf2?.winnerId) finalMatch.team2Id = sf2.winnerId;
  }

  return updatedMatches;
}

// ==========================================
// Web Audio API Sound Synthesizer
// ==========================================
class SoundFX {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // Authentic wooden/poly pickleball paddle "thump"
  public playHit() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // ignore audio errors
    }
  }

  // Double high-pitch chime for a scored point
  public playPoint() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Note 1
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Note 2
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.08); // A5
      gain2.gain.setValueAtTime(0.3, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.28);
    } catch {
      // ignore
    }
  }

  // Referee whistle for match end / foul
  public playWhistle() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.linearRampToValueAtTime(2600, now + 0.05);
      osc.frequency.linearRampToValueAtTime(2350, now + 0.15);
      osc.frequency.linearRampToValueAtTime(2550, now + 0.25);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // ignore
    }
  }

  // Victory fanfare
  public playFanfare() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.35, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.4);
      });
    } catch {
      // ignore
    }
  }
}

export const sounds = new SoundFX();
