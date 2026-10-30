import React, { useState } from 'react';
import { Match, Team, RefereeAccount } from '../types/tournament';
import { ShieldCheck, PlayCircle, Clock, CheckCircle2, UserCheck, Flame, Filter, Users, Zap, Lock } from 'lucide-react';
import { GROUP_CONFIGS } from '../data/initialTournamentData';
import { syncManager } from '../lib/syncManager';

interface RefereePortalViewProps {
  matches: Match[];
  teams: Team[];
  onOpenMatchScorer: (match: Match) => void;
  assignedCourt: string;
  setAssignedCourt: (court: string) => void;
  refereeName: string;
  onOpenRefereeSettings: () => void;
  referees?: RefereeAccount[];
  onSelectReferee?: (ref: RefereeAccount) => void;
  onOpenTestBench?: () => void;
  onForceUnlockMatch?: (match: Match) => void;
  isAdmin?: boolean;
}

export const RefereePortalView: React.FC<RefereePortalViewProps> = ({
  matches,
  teams,
  onOpenMatchScorer,
  assignedCourt,
  setAssignedCourt,
  refereeName,
  onOpenRefereeSettings,
  referees = [],
  onSelectReferee,
  onOpenTestBench,
  onForceUnlockMatch,
  isAdmin = false,
}) => {
  const [blockedLockAlert, setBlockedLockAlert] = useState<{
    match: Match;
    lockedBy: string;
    court: string;
  } | null>(null);

  const handleOpenScorerWithLockCheck = (m: Match) => {
    if (syncManager.isMatchLockedByOther(m, refereeName)) {
      setBlockedLockAlert({
        match: m,
        lockedBy: m.lockedByRefereeName || 'Trọng tài khác',
        court: m.lockedByCourt || m.court,
      });
      return;
    }
    onOpenMatchScorer(m);
  };
  const getTeamName = (teamId: string, placeholder?: string) => {
    if (!teamId) return placeholder || 'Chờ kết quả';
    const t = teams.find((item) => item.id === teamId);
    return t ? t.name : placeholder || 'Chờ kết quả';
  };

  const getTeamCode = (teamId: string) => {
    if (!teamId) return '';
    const t = teams.find((item) => item.id === teamId);
    return t ? t.code : '';
  };

  const courts = ['Tất cả', 'Sân 1', 'Sân 2', 'Sân 3'];

  const courtMatches = matches.filter((m) => {
    if (assignedCourt === 'Tất cả') return true;
    return m.court.toLowerCase().includes(assignedCourt.toLowerCase());
  });

  const activeLiveMatch = courtMatches.find((m) => m.status === 'live');
  const pendingMatches = courtMatches.filter((m) => m.status === 'pending');
  const nextMatch = activeLiveMatch ? pendingMatches[0] : pendingMatches[0];
  const otherPendingMatches = activeLiveMatch
    ? pendingMatches
    : pendingMatches.slice(1);
  const completedMatches = courtMatches.filter((m) => m.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight uppercase">
                  BÀN ĐIỀU HÀNH TRỌNG TÀI
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase">
                  {assignedCourt}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Đang trực: <strong className="text-white">{refereeName || 'Chưa đặt tên'}</strong></span>
                <span>·</span>
                <button
                  onClick={onOpenRefereeSettings}
                  className="text-amber-400 hover:underline font-semibold"
                >
                  Cài đặt & Đổi Trọng Tài
                </button>
              </p>
            </div>
          </div>

          {/* Court Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-800 rounded-2xl self-start sm:self-auto overflow-x-auto max-w-full">
            {courts.map((court) => (
              <button
                key={court}
                onClick={() => setAssignedCourt(court)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  assignedCourt === court
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {court}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Referees Quick-Switcher Strip & Test Bench CTA */}
        {referees.length > 0 && (
          <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 shrink-0">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>3 Trọng Tài Trực:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 max-w-2xl">
              {referees.map((ref) => {
                const isActive = refereeName === ref.name;
                return (
                  <button
                    key={ref.id}
                    onClick={() => onSelectReferee && onSelectReferee(ref)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                        : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                    }`}
                  >
                    <span className="truncate">{ref.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-black uppercase shrink-0 ml-1.5 ${
                        isActive
                          ? 'bg-slate-950 text-amber-300'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      {ref.court}
                    </span>
                  </button>
                );
              })}
            </div>

            {isAdmin && onOpenTestBench && (
              <button
                onClick={onOpenTestBench}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 shrink-0"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Test Đồng Thời 3 Trọng Tài</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Featured: Current Active Match on this Court */}
      {activeLiveMatch ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 p-6 sm:p-7 text-slate-950 shadow-lg border-2 border-amber-300">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-950 text-amber-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                  <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
                  ĐANG THI ĐẤU TRÊN {activeLiveMatch.court}
                </span>
                <span className="font-mono text-xs font-bold text-slate-800">
                  {activeLiveMatch.roundName} · Trận #{activeLiveMatch.matchNumber}
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-black font-display tracking-tight">
                  {getTeamName(activeLiveMatch.team1Id, activeLiveMatch.team1Placeholder)} ({activeLiveMatch.score1})
                  <span className="text-slate-700 mx-2">vs</span>
                  {getTeamName(activeLiveMatch.team2Id, activeLiveMatch.team2Placeholder)} ({activeLiveMatch.score2})
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  {activeLiveMatch.stage === 'group'
                    ? 'Chạm 11 điểm (Không cách 2) · Đang chấm trực tiếp'
                    : `Chạm ${activeLiveMatch.targetPoints} điểm (Cách 2) · Đang chấm trực tiếp`}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenScorerWithLockCheck(activeLiveMatch)}
              className="w-full md:w-auto px-6 py-4 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95"
            >
              <PlayCircle className="w-6 h-6 text-amber-400" />
              <span>VÀO BẢNG ĐIỆN TỬ CHẤM ĐIỂM</span>
            </button>
          </div>
        </div>
      ) : nextMatch ? (
        <div className="rounded-3xl bg-white border-2 border-sky-300 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Trận Kế Tiếp Trên {nextMatch.court} ({nextMatch.startTime || '08:15'})
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 font-display">
              {getTeamName(nextMatch.team1Id, nextMatch.team1Placeholder)} vs{' '}
              {getTeamName(nextMatch.team2Id, nextMatch.team2Placeholder)}
            </div>
            <div className="text-xs text-slate-500">
              {nextMatch.roundName} · {nextMatch.court} · {nextMatch.stage === 'group' ? 'Chạm 11 điểm (Không cách 2)' : `Chạm ${nextMatch.targetPoints} điểm (Cách 2)`}
            </div>
          </div>

          <button
            onClick={() => handleOpenScorerWithLockCheck(nextMatch)}
            className="w-full md:w-auto px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            <PlayCircle className="w-5 h-5" />
            <span>BẮT ĐẦU CHẤM TRẬN NÀY</span>
          </button>
        </div>
      ) : null}

      {/* Queue of Matches on this Court */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Matches */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="font-black text-sm uppercase text-slate-800 tracking-wide flex items-center justify-between">
            <span>Danh Sách Chờ Đấu ({pendingMatches.length})</span>
            <span className="text-xs text-slate-400 font-normal">Sắp xếp theo giờ</span>
          </h3>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {pendingMatches.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Tất cả các trận trên sân này đã hoàn tất!
              </div>
            ) : (
              pendingMatches.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                >
                  <div className="truncate">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>#{m.matchNumber}</span>
                      <span>·</span>
                      <span>{m.startTime}</span>
                      <span>·</span>
                      <span className="font-bold text-sky-700">{m.court}</span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900 truncate mt-0.5">
                      {getTeamName(m.team1Id, m.team1Placeholder)} vs{' '}
                      {getTeamName(m.team2Id, m.team2Placeholder)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {m.lockedByRefereeName && (
                      <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Lock className="w-3 h-3" /> {m.lockedByRefereeName}
                      </span>
                    )}
                    <button
                      onClick={() => handleOpenScorerWithLockCheck(m)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 shrink-0"
                    >
                      Chấm điểm
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Matches on this Court */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="font-black text-sm uppercase text-slate-800 tracking-wide flex items-center justify-between">
            <span>Đã Hoàn Tất ({completedMatches.length})</span>
            <span className="text-xs text-slate-400 font-normal">Đã có kết quả</span>
          </h3>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {completedMatches.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Chưa có trận nào hoàn tất trên sân này.
              </div>
            ) : (
              completedMatches.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3"
                >
                  <div className="truncate">
                    <div className="text-[10px] text-slate-400 font-mono">
                      #{m.matchNumber} · {m.roundName} · {m.court}
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900 truncate mt-0.5 flex items-center gap-2">
                      <span className="truncate">
                        {getTeamName(m.team1Id, m.team1Placeholder)} ({m.score1}) - ({m.score2}) {getTeamName(m.team2Id, m.team2Placeholder)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenScorerWithLockCheck(m)}
                    className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
                  >
                    Sửa điểm
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Lock Rejection Modal Dialog */}
      {blockedLockAlert && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base uppercase font-display">
                  TRẬN ĐẤU ĐANG BỊ KHÓA
                </h3>
                <p className="text-xs text-slate-500">Chế độ bảo vệ độc quyền trận đấu</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-100 text-xs text-rose-950 space-y-1.5">
              <p>
                Trận <strong>#{blockedLockAlert.match.matchNumber}</strong> ({blockedLockAlert.match.roundName}) đang được{' '}
                <strong>Trọng tài {blockedLockAlert.lockedBy}</strong> trực tiếp điều hành và chấm điểm tại{' '}
                <strong>{blockedLockAlert.court}</strong>.
              </p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Để tránh mất dữ liệu hoặc xung đột điểm số khi 3 trọng tài cùng thao tác đồng thời trên các sân, trọng tài khác không được phép can thiệp. Điểm số của trận này đang được tự động cập nhật liên tục ra màn hình ngoài.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {onForceUnlockMatch && (
                <button
                  onClick={() => {
                    onForceUnlockMatch(blockedLockAlert.match);
                    setBlockedLockAlert(null);
                  }}
                  className="px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 rounded-xl transition-colors"
                >
                  Mở khóa khẩn cấp (Admin)
                </button>
              )}
              <button
                onClick={() => setBlockedLockAlert(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Đã hiểu & Quay lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
