import React, { useEffect } from 'react';
import { Match, Team } from '../types/tournament';
import { Trophy, Award, Medal, Sparkles, PlayCircle, Crown, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../lib/tournamentUtils';

interface KnockoutBracketViewProps {
  matches: Match[];
  teams: Team[];
  onOpenMatchScorer: (match: Match) => void;
  onAutoAdvance: () => void;
}

export const KnockoutBracketView: React.FC<KnockoutBracketViewProps> = ({
  matches,
  teams,
  onOpenMatchScorer,
  onAutoAdvance,
}) => {
  const getTeamName = (teamId: string, placeholder?: string) => {
    if (!teamId) return placeholder || 'Đang chờ vòng bảng';
    const t = teams.find((item) => item.id === teamId);
    return t ? t.name : placeholder || 'Đang chờ';
  };

  const getTeamCode = (teamId: string) => {
    if (!teamId) return '';
    const t = teams.find((item) => item.id === teamId);
    return t ? t.code : '';
  };

  const qfMatches = matches.filter((m) => m.stage === 'quarter');
  const sfMatches = matches.filter((m) => m.stage === 'semi');
  const bronzeMatch = matches.find((m) => m.stage === 'third_place');
  const finalMatch = matches.find((m) => m.stage === 'final');

  // Trigger confetti if Champion is crowned
  useEffect(() => {
    if (finalMatch && finalMatch.status === 'completed' && finalMatch.winnerId) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      sounds.playFanfare();
    }
  }, [finalMatch?.status, finalMatch?.winnerId]);

  const championTeam = finalMatch?.winnerId
    ? teams.find((t) => t.id === finalMatch.winnerId)
    : null;

  const runnerUpTeam = finalMatch?.status === 'completed' && finalMatch.winnerId
    ? teams.find(
        (t) =>
          t.id === (finalMatch.winnerId === finalMatch.team1Id ? finalMatch.team2Id : finalMatch.team1Id)
      )
    : null;

  const thirdPlaceTeam = bronzeMatch?.winnerId
    ? teams.find((t) => t.id === bronzeMatch.winnerId)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display uppercase flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            VÒNG LOẠI TRỰC TIẾP (KNOCKOUT BRACKET)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Top 2 mỗi bảng A, B, C, D tranh tài từ Tứ Kết → Bán Kết → Chung Kết Vô Địch
          </p>
        </div>

        <button
          onClick={onAutoAdvance}
          className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors"
        >
          Cập nhật đội từ Bảng Xếp Hạng
        </button>
      </div>

      {/* Champion Podium if Grand Final is finished */}
      {championTeam && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 p-6 sm:p-8 text-slate-950 shadow-lg border-2 border-amber-300">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 shadow-md">
                <Crown className="w-10 h-10 sm:w-12 sm:h-12 animate-bounce" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-950 text-amber-300 text-xs font-black uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  ĐỘI VÔ ĐỊCH CÚP VÀNG
                </div>
                <h3 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-slate-950">
                  {championTeam.name}
                </h3>
                <p className="text-sm font-bold text-slate-800">
                  VĐV {championTeam.player1} & VĐV {championTeam.player2} (Bảng {championTeam.groupId})
                </p>
              </div>
            </div>

            {/* Podium Runners up */}
            <div className="flex items-center gap-3 shrink-0">
              {runnerUpTeam && (
                <div className="bg-white/80 backdrop-blur-xs px-4 py-2.5 rounded-2xl text-center border border-white/40">
                  <div className="text-[10px] font-black uppercase text-slate-600 flex items-center justify-center gap-1">
                    <Medal className="w-3 h-3 text-slate-400" /> Hạng Nhì
                  </div>
                  <div className="font-extrabold text-sm text-slate-900">{runnerUpTeam.name}</div>
                </div>
              )}
              {thirdPlaceTeam && (
                <div className="bg-white/80 backdrop-blur-xs px-4 py-2.5 rounded-2xl text-center border border-white/40">
                  <div className="text-[10px] font-black uppercase text-amber-800 flex items-center justify-center gap-1">
                    <Award className="w-3 h-3 text-amber-700" /> Hạng Ba
                  </div>
                  <div className="font-extrabold text-sm text-slate-900">{thirdPlaceTeam.name}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bracket Tree Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Column 1: Quarterfinals (4 matches) */}
        <div className="space-y-4">
          <div className="px-3 py-2 bg-sky-50 text-sky-800 rounded-xl font-bold font-display text-sm tracking-wide uppercase border border-sky-100 flex items-center justify-between">
            <span>Vòng Tứ Kết (8 Đội)</span>
            <span className="text-xs font-sans font-normal text-sky-600">4 Trận</span>
          </div>

          <div className="space-y-3.5">
            {qfMatches.map((m, idx) => {
              const isCompleted = m.status === 'completed';
              const isLive = m.status === 'live';
              const t1Name = getTeamName(m.team1Id, m.team1Placeholder);
              const t2Name = getTeamName(m.team2Id, m.team2Placeholder);

              return (
                <div
                  key={m.id}
                  className={`bg-white rounded-2xl border p-3.5 shadow-xs transition-all ${
                    isLive
                      ? 'border-amber-400 ring-2 ring-amber-300'
                      : isCompleted
                      ? 'border-slate-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-2">
                    <span className="text-sky-800 font-bold">{m.roundName}</span>
                    <span>{m.court} · {m.startTime}</span>
                  </div>

                  <div className="space-y-1.5">
                    {/* Team 1 */}
                    <div
                      className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                        isCompleted && m.winnerId === m.team1Id
                          ? 'bg-emerald-50 text-slate-950 font-bold border border-emerald-200'
                          : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {getTeamCode(m.team1Id) && (
                          <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-slate-600">
                            {getTeamCode(m.team1Id)}
                          </span>
                        )}
                        <span className="truncate">{t1Name}</span>
                      </div>
                      <span className="font-mono font-black text-sm ml-2">{m.score1}</span>
                    </div>

                    {/* Team 2 */}
                    <div
                      className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                        isCompleted && m.winnerId === m.team2Id
                          ? 'bg-emerald-50 text-slate-950 font-bold border border-emerald-200'
                          : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {getTeamCode(m.team2Id) && (
                          <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-slate-600">
                            {getTeamCode(m.team2Id)}
                          </span>
                        )}
                        <span className="truncate">{t2Name}</span>
                      </div>
                      <span className="font-mono font-black text-sm ml-2">{m.score2}</span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500">
                      Chạm {m.targetPoints} điểm (cách 2)
                    </span>
                    <button
                      onClick={() => onOpenMatchScorer(m)}
                      className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      {isCompleted ? 'Xem tỷ số' : 'Chấm điểm'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Semifinals (2 matches) */}
        <div className="space-y-4">
          <div className="px-3 py-2 bg-indigo-50 text-indigo-800 rounded-xl font-bold font-display text-sm tracking-wide uppercase border border-indigo-100 flex items-center justify-between">
            <span>Vòng Bán Kết (4 Đội)</span>
            <span className="text-xs font-sans font-normal text-indigo-600">2 Trận</span>
          </div>

          <div className="space-y-6 lg:pt-8">
            {sfMatches.map((m) => {
              const isCompleted = m.status === 'completed';
              const isLive = m.status === 'live';
              const t1Name = getTeamName(m.team1Id, m.team1Placeholder);
              const t2Name = getTeamName(m.team2Id, m.team2Placeholder);

              return (
                <div
                  key={m.id}
                  className={`bg-white rounded-2xl border p-4 shadow-xs transition-all ${
                    isLive
                      ? 'border-amber-400 ring-2 ring-amber-300'
                      : isCompleted
                      ? 'border-slate-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-2">
                    <span className="text-indigo-800 font-bold">{m.roundName}</span>
                    <span>{m.court} · {m.startTime}</span>
                  </div>

                  <div className="space-y-2">
                    <div
                      className={`flex items-center justify-between p-2.5 rounded-lg text-xs ${
                        isCompleted && m.winnerId === m.team1Id
                          ? 'bg-emerald-50 text-slate-950 font-bold border border-emerald-200'
                          : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{t1Name}</span>
                      <span className="font-mono font-black text-sm ml-2">{m.score1}</span>
                    </div>

                    <div
                      className={`flex items-center justify-between p-2.5 rounded-lg text-xs ${
                        isCompleted && m.winnerId === m.team2Id
                          ? 'bg-emerald-50 text-slate-950 font-bold border border-emerald-200'
                          : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{t2Name}</span>
                      <span className="font-mono font-black text-sm ml-2">{m.score2}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-semibold">
                      Thắng vào Chung Kết
                    </span>
                    <button
                      onClick={() => onOpenMatchScorer(m)}
                      className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      {isCompleted ? 'Xem tỷ số' : 'Chấm điểm'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 3: Finals & Bronze Match */}
        <div className="space-y-4">
          <div className="px-3 py-2 bg-amber-50 text-amber-900 rounded-xl font-bold font-display text-sm tracking-wide uppercase border border-amber-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              Chung Kết & Tranh Hạng Ba
            </span>
          </div>

          <div className="space-y-4 lg:pt-4">
            {/* Grand Final Card */}
            {finalMatch && (
              <div
                className={`bg-gradient-to-b from-amber-50/80 to-white rounded-2xl border-2 p-4 shadow-sm transition-all ${
                  finalMatch.status === 'live'
                    ? 'border-amber-500 ring-4 ring-amber-300/50'
                    : 'border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-black text-amber-900 mb-2.5">
                  <span className="flex items-center gap-1 uppercase">
                    <Crown className="w-4 h-4 text-amber-500" />
                    {finalMatch.roundName}
                  </span>
                  <span className="font-mono text-amber-700">{finalMatch.court}</span>
                </div>

                <div className="space-y-2">
                  <div
                    className={`flex items-center justify-between p-3 rounded-xl text-sm ${
                      finalMatch.status === 'completed' && finalMatch.winnerId === finalMatch.team1Id
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-900 font-bold'
                    }`}
                  >
                    <span className="truncate">
                      {getTeamName(finalMatch.team1Id, finalMatch.team1Placeholder)}
                    </span>
                    <span className="font-mono text-xl font-black ml-2">
                      {finalMatch.score1}
                    </span>
                  </div>

                  <div
                    className={`flex items-center justify-between p-3 rounded-xl text-sm ${
                      finalMatch.status === 'completed' && finalMatch.winnerId === finalMatch.team2Id
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-900 font-bold'
                    }`}
                  >
                    <span className="truncate">
                      {getTeamName(finalMatch.team2Id, finalMatch.team2Placeholder)}
                    </span>
                    <span className="font-mono text-xl font-black ml-2">
                      {finalMatch.score2}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-200 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-800">
                    Trận Tranh Cúp Vô Địch (15 điểm)
                  </span>
                  <button
                    onClick={() => onOpenMatchScorer(finalMatch)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 flex items-center gap-1 shadow-xs"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    {finalMatch.status === 'completed' ? 'Xem Kết Quả' : 'Chấm Điểm CK'}
                  </button>
                </div>
              </div>
            )}

            {/* Bronze Card */}
            {bronzeMatch && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                  <span className="text-amber-800 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-700" />
                    {bronzeMatch.roundName}
                  </span>
                  <span>{bronzeMatch.court}</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      bronzeMatch.status === 'completed' && bronzeMatch.winnerId === bronzeMatch.team1Id
                        ? 'bg-emerald-50 text-slate-950 font-bold border border-emerald-200'
                        : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="truncate">
                      {getTeamName(bronzeMatch.team1Id, bronzeMatch.team1Placeholder)}
                    </span>
                    <span className="font-mono font-black ml-2">{bronzeMatch.score1}</span>
                  </div>

                  <div
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      bronzeMatch.status === 'completed' && bronzeMatch.winnerId === bronzeMatch.team2Id
                        ? 'bg-emerald-50 text-slate-950 font-bold border border-emerald-200'
                        : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="truncate">
                      {getTeamName(bronzeMatch.team2Id, bronzeMatch.team2Placeholder)}
                    </span>
                    <span className="font-mono font-black ml-2">{bronzeMatch.score2}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Tranh Huy Chương Đồng
                  </span>
                  <button
                    onClick={() => onOpenMatchScorer(bronzeMatch)}
                    className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    Chấm điểm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
