import { Match, Team } from '../types/tournament';
import { generateInitialMatches, INITIAL_TEAMS } from './initialTournamentData';
import { autoAdvanceBracket } from '../lib/tournamentUtils';

export type ScenarioType = 'full_completed' | 'tiebreak_points' | 'mid_tournament_live' | 'clean_reset';

export interface ScenarioInfo {
  id: ScenarioType;
  name: string;
  badge: string;
  description: string;
}

export const SCENARIO_LIST: ScenarioInfo[] = [
  {
    id: 'full_completed',
    name: 'Toàn Bộ Giải Đấu (Đã có Vô Địch)',
    badge: 'MẶC ĐỊNH',
    description: 'Đầy đủ tỷ số 21 trận vòng bảng + 4 Tứ kết + 2 Bán kết + Tranh Hạng Ba + Chung Kết Cúp Vàng',
  },
  {
    id: 'tiebreak_points',
    name: 'Bằng Điểm - Xét Hiệu Số (+/-)',
    badge: 'TEST THỨ HẠNG',
    description: 'Bảng A & B có 3 đội bằng 4 điểm, thuật toán tự động so sánh hiệu số để chọn Top 2 vào Tứ kết',
  },
  {
    id: 'mid_tournament_live',
    name: 'Đang Thi Đấu Trực Tiếp (LIVE)',
    badge: 'TEST TRỌNG TÀI',
    description: 'Vòng bảng kết thúc Lượt 2, có 2 trận đang LIVE điểm số 9-8 và 10-10 để test bảng chấm điểm',
  },
  {
    id: 'clean_reset',
    name: 'Đặt Lại Trắng (0 - 0 Cho Giải Thật)',
    badge: 'GIẢI THẬT 31/10',
    description: 'Xóa toàn bộ điểm mẫu, đưa về trạng thái 0 - 0 sẵn sàng để Ban Tổ Chức nhập giải thật',
  },
];

/**
 * 1. FULL COMPLETED TOURNAMENT SCENARIO (Default)
 * All 21 group matches + 4 QF + 2 SF + Bronze + Final completed with scores!
 */
export function getFullCompletedScenario(): Match[] {
  const matches = generateInitialMatches();

  // Helper to complete a group match
  const setScore = (id: string, s1: number, s2: number, court = 'Sân 1') => {
    const m = matches.find((item) => item.id === id);
    if (m) {
      m.score1 = s1;
      m.score2 = s2;
      m.status = 'completed';
      m.winnerId = s1 > s2 ? m.team1Id : m.team2Id;
      m.court = court;
    }
  };

  // --- BẢNG A ---
  // A1 (Lâm - Ngọc): 3 thắng (vs A2: 11-7, vs A3: 11-6, vs A4: 11-5) -> 6đ, Hiệu số +15 (Nhất A)
  // A2 (Hiền Kute - Phi Du): 2 thắng 1 bại (vs A4: 11-8, vs A3: 11-9) -> 4đ, Hiệu số +3 (Nhì A)
  // A3 (Định - Thanh Thùy): 1 thắng 2 bại (vs A4: 11-9) -> 2đ, Hiệu số -5 (Hạng 3)
  // A4 (Văn Võ - Tổ Viện): 0 thắng 3 bại -> 0đ, Hiệu số -13 (Hạng 4)
  setScore('match_g_a_1', 11, 7, 'Sân 1'); // A1 vs A2
  setScore('match_g_a_2', 11, 9, 'Sân 2'); // A3 vs A4
  setScore('match_g_a_3', 11, 6, 'Sân 1'); // A1 vs A3
  setScore('match_g_a_4', 11, 8, 'Sân 2'); // A2 vs A4
  setScore('match_g_a_5', 11, 5, 'Sân 1'); // A1 vs A4
  setScore('match_g_a_6', 11, 9, 'Sân 2'); // A2 vs A3

  // --- BẢNG B ---
  // B1 (Tín - Anh Đài): 3 thắng (vs B2: 11-8, vs B3: 11-9, vs B4: 11-4) -> 6đ, Hiệu số +12 (Nhất B)
  // B2 (Huy Văn - Diễm): 2 thắng 1 bại (vs B4: 11-6, vs B3: 11-8) -> 4đ, Hiệu số +5 (Nhì B)
  // B3 (A. Mười - Lê Phương): 1 thắng 2 bại (vs B4: 11-7) -> 2đ, Hiệu số -3 (Hạng 3)
  // B4 (Hà - Thuỷ Hoàng): 0 thắng 3 bại -> 0đ, Hiệu số -14 (Hạng 4)
  setScore('match_g_b_7', 11, 8, 'Sân 3');  // B1 vs B2
  setScore('match_g_b_8', 11, 7, 'Sân 4');  // B3 vs B4
  setScore('match_g_b_9', 11, 9, 'Sân 3');  // B1 vs B3
  setScore('match_g_b_10', 11, 6, 'Sân 4'); // B2 vs B4
  setScore('match_g_b_11', 11, 4, 'Sân 3'); // B1 vs B4
  setScore('match_g_b_12', 11, 8, 'Sân 4'); // B2 vs B3

  // --- BẢNG C ---
  // C1 (Tôn - Tuyết): 3 thắng (vs C2: 11-9, vs C3: 11-8, vs C4: 11-5) -> 6đ, Hiệu số +11 (Nhất C)
  // C2 (Tấn Tùng - Khánh Linh): 2 thắng 1 bại (vs C4: 11-6, vs C3: 12-10) -> 4đ, Hiệu số +5 (Nhì C)
  // C3 (Lộc - Dương Tuyết): 1 thắng 2 bại (vs C4: 11-7) -> 2đ, Hiệu số -3 (Hạng 3)
  // C4 (Khang - Phi Hải): 0 thắng 3 bại -> 0đ, Hiệu số -13 (Hạng 4)
  setScore('match_g_c_13', 11, 9, 'Sân 1');  // C1 vs C2
  setScore('match_g_c_14', 11, 7, 'Sân 2');  // C3 vs C4
  setScore('match_g_c_15', 11, 8, 'Sân 1');  // C1 vs C3
  setScore('match_g_c_16', 11, 6, 'Sân 2');  // C2 vs C4
  setScore('match_g_c_17', 11, 5, 'Sân 1');  // C1 vs C4
  setScore('match_g_c_18', 12, 10, 'Sân 2'); // C2 vs C3

  // --- BẢNG D (3 đội) ---
  // D1 (Tịnh - Hùng): 2 thắng (vs D2: 11-8, vs D3: 11-7) -> 4đ, Hiệu số +7 (Nhất D)
  // D2 (Hưng - Mỹ Vân): 1 thắng 1 bại (vs D3: 11-9) -> 2đ, Hiệu số -1 (Nhì D)
  // D3 (Huy Bạch - Quyên): 0 thắng 2 bại -> 0đ, Hiệu số -6 (Hạng 3)
  setScore('match_g_d_19', 11, 8, 'Sân 3'); // D1 vs D2
  setScore('match_g_d_20', 11, 7, 'Sân 3'); // D1 vs D3
  setScore('match_g_d_21', 11, 9, 'Sân 3'); // D2 vs D3

  // Advance bracket automatically based on group standings
  let advanced = autoAdvanceBracket(matches, INITIAL_TEAMS);

  // --- TỨ KẾT ---
  // TK 1: Nhất A (Lâm - Ngọc) vs Nhì B (Huy Văn - Diễm) -> 11 - 8
  const qf1 = advanced.find((m) => m.id === 'match_qf_1')!;
  qf1.score1 = 11;
  qf1.score2 = 8;
  qf1.status = 'completed';
  qf1.winnerId = qf1.team1Id;

  // TK 2: Nhất C (Tôn - Tuyết) vs Nhì D (Hưng - Mỹ Vân) -> 11 - 7
  const qf2 = advanced.find((m) => m.id === 'match_qf_2')!;
  qf2.score1 = 11;
  qf2.score2 = 7;
  qf2.status = 'completed';
  qf2.winnerId = qf2.team1Id;

  // TK 3: Nhất B (Tín - Anh Đài) vs Nhì A (Hiền Kute - Phi Du) -> 11 - 9
  const qf3 = advanced.find((m) => m.id === 'match_qf_3')!;
  qf3.score1 = 11;
  qf3.score2 = 9;
  qf3.status = 'completed';
  qf3.winnerId = qf3.team1Id;

  // TK 4: Nhất D (Tịnh - Hùng) vs Nhì C (Tấn Tùng - Khánh Linh) -> 8 - 11
  const qf4 = advanced.find((m) => m.id === 'match_qf_4')!;
  qf4.score1 = 8;
  qf4.score2 = 11;
  qf4.status = 'completed';
  qf4.winnerId = qf4.team2Id;

  // Advance to Semifinals
  advanced = autoAdvanceBracket(advanced, INITIAL_TEAMS);

  // --- BÁN KẾT ---
  // BK 1: Lâm - Ngọc vs Tôn - Tuyết -> 11 - 9 (Lâm - Ngọc vào Chung Kết)
  const sf1 = advanced.find((m) => m.id === 'match_sf_1')!;
  sf1.score1 = 11;
  sf1.score2 = 9;
  sf1.status = 'completed';
  sf1.winnerId = sf1.team1Id;

  // BK 2: Tín - Anh Đài vs Tấn Tùng - Khánh Linh -> 12 - 10 (Tín - Anh Đài vào Chung Kết)
  const sf2 = advanced.find((m) => m.id === 'match_sf_2')!;
  sf2.score1 = 12;
  sf2.score2 = 10;
  sf2.status = 'completed';
  sf2.winnerId = sf2.team1Id;

  // Advance to Bronze & Final
  advanced = autoAdvanceBracket(advanced, INITIAL_TEAMS);

  // --- TRANH HẠNG BA ---
  // Tôn - Tuyết vs Tấn Tùng - Khánh Linh -> 11 - 8 (Tôn - Tuyết giành Hạng Ba)
  const bronze = advanced.find((m) => m.id === 'match_third_place')!;
  bronze.score1 = 11;
  bronze.score2 = 8;
  bronze.status = 'completed';
  bronze.winnerId = bronze.team1Id;

  // --- CHUNG KẾT VÔ ĐỊCH (Chạm 15 điểm) ---
  // Lâm - Ngọc vs Tín - Anh Đài -> 15 - 13 (Lâm - Ngọc Vô Địch Cúp Vàng!)
  const grandFinal = advanced.find((m) => m.id === 'match_final')!;
  grandFinal.score1 = 15;
  grandFinal.score2 = 13;
  grandFinal.status = 'completed';
  grandFinal.winnerId = grandFinal.team1Id;

  return advanced;
}

/**
 * 2. TIE-BREAK SCENARIO
 * In Group A: 3 teams end up with 4 points each (2 wins, 1 loss circle).
 * Demonstrates exact goal difference / head-to-head point sorting!
 */
export function getTiebreakScenario(): Match[] {
  const matches = generateInitialMatches();

  const setScore = (id: string, s1: number, s2: number) => {
    const m = matches.find((item) => item.id === id);
    if (m) {
      m.score1 = s1;
      m.score2 = s2;
      m.status = 'completed';
      m.winnerId = s1 > s2 ? m.team1Id : m.team2Id;
    }
  };

  // Group A Tie:
  // A1 thắng A2: 11 - 6 (+5)
  // A2 thắng A3: 11 - 4 (+7)
  // A3 thắng A1: 11 - 5 (+6)
  // All three beat A4 (Văn Võ - Tổ Viện)
  setScore('match_g_a_1', 11, 6); // A1 vs A2 (A1 won)
  setScore('match_g_a_2', 11, 3); // A3 vs A4 (A3 won)
  setScore('match_g_a_3', 5, 11); // A1 vs A3 (A3 won)
  setScore('match_g_a_4', 11, 4); // A2 vs A4 (A2 won)
  setScore('match_g_a_5', 11, 2); // A1 vs A4 (A1 won)
  setScore('match_g_a_6', 11, 4); // A2 vs A3 (A2 won)

  // Standard group matches for B, C, D
  setScore('match_g_b_7', 11, 9);
  setScore('match_g_b_8', 11, 8);
  setScore('match_g_b_9', 11, 7);
  setScore('match_g_b_10', 11, 5);
  setScore('match_g_b_11', 11, 6);
  setScore('match_g_b_12', 11, 9);

  setScore('match_g_c_13', 11, 8);
  setScore('match_g_c_14', 11, 9);
  setScore('match_g_c_15', 11, 6);
  setScore('match_g_c_16', 11, 7);
  setScore('match_g_c_17', 11, 4);
  setScore('match_g_c_18', 11, 8);

  setScore('match_g_d_19', 11, 7);
  setScore('match_g_d_20', 11, 8);
  setScore('match_g_d_21', 11, 9);

  return autoAdvanceBracket(matches, INITIAL_TEAMS);
}

/**
 * 3. MID-TOURNAMENT SCENARIO (LIVE)
 * 2 rounds played, Round 3 has 2 matches currently LIVE at 9-8 and 10-10!
 */
export function getMidTournamentLiveScenario(): Match[] {
  const matches = generateInitialMatches();

  const setScore = (id: string, s1: number, s2: number, status: Match['status'] = 'completed') => {
    const m = matches.find((item) => item.id === id);
    if (m) {
      m.score1 = s1;
      m.score2 = s2;
      m.status = status;
      if (status === 'completed') {
        m.winnerId = s1 > s2 ? m.team1Id : m.team2Id;
      }
    }
  };

  // Completed Round 1 & 2
  setScore('match_g_a_1', 11, 8);
  setScore('match_g_a_2', 11, 9);
  setScore('match_g_a_3', 11, 7);
  setScore('match_g_a_4', 11, 6);

  // Match 5 is LIVE right now!
  const liveMatch1 = matches.find((m) => m.id === 'match_g_a_5');
  if (liveMatch1) {
    liveMatch1.score1 = 9;
    liveMatch1.score2 = 8;
    liveMatch1.status = 'live';
    liveMatch1.serverNumber = 2;
    liveMatch1.servingTeamId = liveMatch1.team1Id;
  }

  // Match in Group B is also LIVE!
  setScore('match_g_b_7', 11, 8);
  setScore('match_g_b_8', 11, 6);
  setScore('match_g_b_9', 11, 9);
  setScore('match_g_b_10', 11, 7);

  const liveMatch2 = matches.find((m) => m.id === 'match_g_b_11');
  if (liveMatch2) {
    liveMatch2.score1 = 10;
    liveMatch2.score2 = 10;
    liveMatch2.status = 'live';
    liveMatch2.serverNumber = 1;
    liveMatch2.servingTeamId = liveMatch2.team2Id;
  }

  return matches;
}

/**
 * 4. CLEAN RESET (0 - 0)
 * All fresh empty matches ready for real competition.
 */
export function getCleanResetScenario(): Match[] {
  return generateInitialMatches();
}
