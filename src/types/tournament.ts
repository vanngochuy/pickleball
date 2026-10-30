export type GroupLetter = 'A' | 'B' | 'C' | 'D';

export interface Team {
  id: string;
  groupId: GroupLetter;
  code: string; // 'A1', 'A2', 'B1', etc.
  name: string; // 'Lâm - Ngọc'
  player1: string;
  player2: string;
}

export type MatchStage = 'group' | 'quarter' | 'semi' | 'third_place' | 'final';

export type MatchStatus = 'pending' | 'live' | 'completed';

export interface MatchPointHistory {
  teamId: string;
  score1: number;
  score2: number;
  timestamp: number;
  note?: string;
}

export interface Match {
  id: string;
  stage: MatchStage;
  groupId?: GroupLetter;
  roundName: string; // 'Lượt 1', 'Lượt 2', 'Tứ kết 1', 'Bán kết 1', 'Chung kết', etc.
  matchNumber: number;
  court: string; // 'Sân 1', 'Sân 2', 'Sân 3'
  startTime?: string;
  team1Id: string; // team id or placeholder like '1st_A'
  team2Id: string;
  team1Placeholder?: string; // e.g. "Nhất Bảng A"
  team2Placeholder?: string; // e.g. "Nhì Bảng B"
  score1: number;
  score2: number;
  targetPoints: number; // default 11 or 15
  status: MatchStatus;
  winnerId?: string;
  serverNumber?: 1 | 2; // For doubles pickleball scoring
  servingTeamId?: string; // ID of current serving team
  isSecondServer?: boolean;
  history?: MatchPointHistory[];
  refereeNotes?: string;
  refereeName?: string;
}

export interface GroupStanding {
  team: Team;
  played: number;
  won: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  points: number; // 2 points for win, 0 for loss
  rank: number;
  advancing: boolean; // Top 2 advance
}

export interface RefereeAccount {
  id: string;
  name: string;
  court: string;
  phone?: string;
}

export interface TournamentConfig {
  title: string;
  edition: string;
  subtitle: string;
  date: string;
  location: string;
  domain: string;
  targetPoints: number; // 11
  winByTwo: boolean;
  refereePin: string; // Secure PIN for referee activation
}
