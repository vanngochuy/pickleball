import { Team, Match, TournamentConfig, GroupLetter } from '../types/tournament';

export const TOURNAMENT_CONFIG: TournamentConfig = {
  title: 'GIẢI PICKLEBALL PHONG TRÀO LẦN THỨ IV',
  edition: 'LẦN THỨ IV',
  subtitle: 'TẬP ĐOÀN BIỂN — Giao lưu - Đoàn kết - Kết nối - Phát triển',
  date: '8h00 | 31/10/2026',
  location: 'Sân Terra Cafe & Pickleball',
  domain: 'pickleball-tapdoanbien.bbm.io.vn',
  targetPoints: 11,
  winByTwo: true,
  refereePin: '1234',
};

// Exact 15 teams from the official tournament bracket poster
export const INITIAL_TEAMS: Team[] = [
  // BẢNG A
  { id: 'team_a1', groupId: 'A', code: 'A1', name: 'Lâm - Ngọc', player1: 'Lâm', player2: 'Ngọc' },
  { id: 'team_a2', groupId: 'A', code: 'A2', name: 'Hiền Kute - Phi Du', player1: 'Hiền Kute', player2: 'Phi Du' },
  { id: 'team_a3', groupId: 'A', code: 'A3', name: 'Định - Thanh Thùy', player1: 'Định', player2: 'Thanh Thùy' },
  { id: 'team_a4', groupId: 'A', code: 'A4', name: 'Văn Võ - Tổ Viện', player1: 'Văn Võ', player2: 'Tổ Viện' },

  // BẢNG B
  { id: 'team_b1', groupId: 'B', code: 'B1', name: 'Tín - Anh Đài', player1: 'Tín', player2: 'Anh Đài' },
  { id: 'team_b2', groupId: 'B', code: 'B2', name: 'Huy Văn - Diễm', player1: 'Huy Văn', player2: 'Diễm' },
  { id: 'team_b3', groupId: 'B', code: 'B3', name: 'A. Mười - Lê Phương', player1: 'A. Mười', player2: 'Lê Phương' },
  { id: 'team_b4', groupId: 'B', code: 'B4', name: 'Hà - Thuỷ Hoàng', player1: 'Hà', player2: 'Thuỷ Hoàng' },

  // BẢNG C
  { id: 'team_c1', groupId: 'C', code: 'C1', name: 'Tôn - Tuyết', player1: 'Tôn', player2: 'Tuyết' },
  { id: 'team_c2', groupId: 'C', code: 'C2', name: 'Tấn Tùng - Khánh Linh', player1: 'Tấn Tùng', player2: 'Khánh Linh' },
  { id: 'team_c3', groupId: 'C', code: 'C3', name: 'Lộc - Dương Tuyết', player1: 'Lộc', player2: 'Dương Tuyết' },
  { id: 'team_c4', groupId: 'C', code: 'C4', name: 'Khang - Phi Hải', player1: 'Khang', player2: 'Phi Hải' },

  // BẢNG D (3 teams)
  { id: 'team_d1', groupId: 'D', code: 'D1', name: 'Tịnh - Hùng', player1: 'Tịnh', player2: 'Hùng' },
  { id: 'team_d2', groupId: 'D', code: 'D2', name: 'Hưng - Mỹ Vân', player1: 'Hưng', player2: 'Mỹ Vân' },
  { id: 'team_d3', groupId: 'D', code: 'D3', name: 'Huy Bạch - Quyên', player1: 'Huy Bạch', player2: 'Quyên' },
];

export const GROUP_CONFIGS: Record<GroupLetter, { title: string; color: string; bgSoft: string; border: string; badge: string }> = {
  A: {
    title: 'BẢNG A',
    color: '#1d4ed8', // Royal Blue
    bgSoft: 'bg-blue-50/80',
    border: 'border-blue-200',
    badge: 'bg-blue-600 text-white',
  },
  B: {
    title: 'BẢNG B',
    color: '#15803d', // Forest Green
    bgSoft: 'bg-emerald-50/80',
    border: 'border-emerald-200',
    badge: 'bg-emerald-600 text-white',
  },
  C: {
    title: 'BẢNG C',
    color: '#ea580c', // Bright Orange
    bgSoft: 'bg-orange-50/80',
    border: 'border-orange-200',
    badge: 'bg-orange-600 text-white',
  },
  D: {
    title: 'BẢNG D',
    color: '#7e22ce', // Purple
    bgSoft: 'bg-purple-50/80',
    border: 'border-purple-200',
    badge: 'bg-purple-600 text-white',
  },
};

// Generates the initial matches for the tournament
export function generateInitialMatches(): Match[] {
  const matches: Match[] = [];
  let matchNumber = 1;

  // --- BẢNG A (4 teams round-robin = 6 matches) ---
  const groupAMatches = [
    { team1: 'team_a1', team2: 'team_a2', round: 'Lượt 1', time: '08:15', court: 'Sân 1' },
    { team1: 'team_a3', team2: 'team_a4', round: 'Lượt 1', time: '08:15', court: 'Sân 2' },
    { team1: 'team_a1', team2: 'team_a3', round: 'Lượt 2', time: '09:00', court: 'Sân 1' },
    { team1: 'team_a2', team2: 'team_a4', round: 'Lượt 2', time: '09:00', court: 'Sân 2' },
    { team1: 'team_a1', team2: 'team_a4', round: 'Lượt 3', time: '09:45', court: 'Sân 1' },
    { team1: 'team_a2', team2: 'team_a3', round: 'Lượt 3', time: '09:45', court: 'Sân 2' },
  ];

  groupAMatches.forEach((m) => {
    matches.push({
      id: `match_g_a_${matchNumber}`,
      stage: 'group',
      groupId: 'A',
      roundName: m.round,
      matchNumber: matchNumber++,
      court: m.court,
      startTime: m.time,
      team1Id: m.team1,
      team2Id: m.team2,
      score1: 0,
      score2: 0,
      targetPoints: 11,
      status: 'pending',
      serverNumber: 1,
    });
  });

  // --- BẢNG B (4 teams round-robin = 6 matches) ---
  const groupBMatches = [
    { team1: 'team_b1', team2: 'team_b2', round: 'Lượt 1', time: '08:15', court: 'Sân 3' },
    { team1: 'team_b3', team2: 'team_b4', round: 'Lượt 1', time: '08:15', court: 'Sân 4' },
    { team1: 'team_b1', team2: 'team_b3', round: 'Lượt 2', time: '09:00', court: 'Sân 3' },
    { team1: 'team_b2', team2: 'team_b4', round: 'Lượt 2', time: '09:00', court: 'Sân 4' },
    { team1: 'team_b1', team2: 'team_b4', round: 'Lượt 3', time: '09:45', court: 'Sân 3' },
    { team1: 'team_b2', team2: 'team_b3', round: 'Lượt 3', time: '09:45', court: 'Sân 4' },
  ];

  groupBMatches.forEach((m) => {
    matches.push({
      id: `match_g_b_${matchNumber}`,
      stage: 'group',
      groupId: 'B',
      roundName: m.round,
      matchNumber: matchNumber++,
      court: m.court,
      startTime: m.time,
      team1Id: m.team1,
      team2Id: m.team2,
      score1: 0,
      score2: 0,
      targetPoints: 11,
      status: 'pending',
      serverNumber: 1,
    });
  });

  // --- BẢNG C (4 teams round-robin = 6 matches) ---
  const groupCMatches = [
    { team1: 'team_c1', team2: 'team_c2', round: 'Lượt 1', time: '08:35', court: 'Sân 1' },
    { team1: 'team_c3', team2: 'team_c4', round: 'Lượt 1', time: '08:35', court: 'Sân 2' },
    { team1: 'team_c1', team2: 'team_c3', round: 'Lượt 2', time: '09:20', court: 'Sân 1' },
    { team1: 'team_c2', team2: 'team_c4', round: 'Lượt 2', time: '09:20', court: 'Sân 2' },
    { team1: 'team_c1', team2: 'team_c4', round: 'Lượt 3', time: '10:05', court: 'Sân 1' },
    { team1: 'team_c2', team2: 'team_c3', round: 'Lượt 3', time: '10:05', court: 'Sân 2' },
  ];

  groupCMatches.forEach((m) => {
    matches.push({
      id: `match_g_c_${matchNumber}`,
      stage: 'group',
      groupId: 'C',
      roundName: m.round,
      matchNumber: matchNumber++,
      court: m.court,
      startTime: m.time,
      team1Id: m.team1,
      team2Id: m.team2,
      score1: 0,
      score2: 0,
      targetPoints: 11,
      status: 'pending',
      serverNumber: 1,
    });
  });

  // --- BẢNG D (3 teams round-robin = 3 matches) ---
  const groupDMatches = [
    { team1: 'team_d1', team2: 'team_d2', round: 'Lượt 1', time: '08:35', court: 'Sân 3' },
    { team1: 'team_d1', team2: 'team_d3', round: 'Lượt 2', time: '09:20', court: 'Sân 3' },
    { team1: 'team_d2', team2: 'team_d3', round: 'Lượt 3', time: '10:05', court: 'Sân 3' },
  ];

  groupDMatches.forEach((m) => {
    matches.push({
      id: `match_g_d_${matchNumber}`,
      stage: 'group',
      groupId: 'D',
      roundName: m.round,
      matchNumber: matchNumber++,
      court: m.court,
      startTime: m.time,
      team1Id: m.team1,
      team2Id: m.team2,
      score1: 0,
      score2: 0,
      targetPoints: 11,
      status: 'pending',
      serverNumber: 1,
    });
  });

  // --- TỨ KẾT (Quarterfinals - 4 matches) ---
  // Chọn 2 đội mạnh nhất mỗi bảng vào Tứ kết:
  // TK 1: Nhất A vs Nhì B
  // TK 2: Nhất C vs Nhì D
  // TK 3: Nhất B vs Nhì A
  // TK 4: Nhất D vs Nhì C
  const qfMatches = [
    { id: 'match_qf_1', roundName: 'Tứ kết 1', p1: 'Nhất Bảng A', p2: 'Nhì Bảng B', court: 'Sân 1', time: '10:45' },
    { id: 'match_qf_2', roundName: 'Tứ kết 2', p1: 'Nhất Bảng C', p2: 'Nhì Bảng D', court: 'Sân 2', time: '10:45' },
    { id: 'match_qf_3', roundName: 'Tứ kết 3', p1: 'Nhất Bảng B', p2: 'Nhì Bảng A', court: 'Sân 3', time: '10:45' },
    { id: 'match_qf_4', roundName: 'Tứ kết 4', p1: 'Nhất Bảng D', p2: 'Nhì Bảng C', court: 'Sân 4', time: '10:45' },
  ];

  qfMatches.forEach((qf) => {
    matches.push({
      id: qf.id,
      stage: 'quarter',
      roundName: qf.roundName,
      matchNumber: matchNumber++,
      court: qf.court,
      startTime: qf.time,
      team1Id: '',
      team2Id: '',
      team1Placeholder: qf.p1,
      team2Placeholder: qf.p2,
      score1: 0,
      score2: 0,
      targetPoints: 11,
      status: 'pending',
      serverNumber: 1,
    });
  });

  // --- BÁN KẾT (Semifinals - 2 matches) ---
  // BK 1: Thắng TK 1 vs Thắng TK 2
  // BK 2: Thắng TK 3 vs Thắng TK 4
  const sfMatches = [
    { id: 'match_sf_1', roundName: 'Bán kết 1', p1: 'Thắng Tứ kết 1', p2: 'Thắng Tứ kết 2', court: 'Sân 1', time: '11:20' },
    { id: 'match_sf_2', roundName: 'Bán kết 2', p1: 'Thắng Tứ kết 3', p2: 'Thắng Tứ kết 4', court: 'Sân 2', time: '11:20' },
  ];

  sfMatches.forEach((sf) => {
    matches.push({
      id: sf.id,
      stage: 'semi',
      roundName: sf.roundName,
      matchNumber: matchNumber++,
      court: sf.court,
      startTime: sf.time,
      team1Id: '',
      team2Id: '',
      team1Placeholder: sf.p1,
      team2Placeholder: sf.p2,
      score1: 0,
      score2: 0,
      targetPoints: 11,
      status: 'pending',
      serverNumber: 1,
    });
  });

  // --- TRANH HẠNG BA (Bronze Final) ---
  matches.push({
    id: 'match_third_place',
    stage: 'third_place',
    roundName: 'Tranh Hạng Ba',
    matchNumber: matchNumber++,
    court: 'Sân 2',
    startTime: '11:55',
    team1Id: '',
    team2Id: '',
    team1Placeholder: 'Thua Bán kết 1',
    team2Placeholder: 'Thua Bán kết 2',
    score1: 0,
    score2: 0,
    targetPoints: 11,
    status: 'pending',
    serverNumber: 1,
  });

  // --- CHUNG KẾT (Grand Final) ---
  matches.push({
    id: 'match_final',
    stage: 'final',
    roundName: 'Chung Kết Vô Địch',
    matchNumber: matchNumber++,
    court: 'Sân Trung Tâm (Sân 1)',
    startTime: '12:00',
    team1Id: '',
    team2Id: '',
    team1Placeholder: 'Thắng Bán kết 1',
    team2Placeholder: 'Thắng Bán kết 2',
    score1: 0,
    score2: 0,
    targetPoints: 15, // Grand final to 15 points
    status: 'pending',
    serverNumber: 1,
  });

  return matches;
}
