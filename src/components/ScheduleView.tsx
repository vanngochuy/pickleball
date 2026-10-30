import React, { useState, useMemo } from 'react';
import { Match, Team, MatchStage, GroupLetter } from '../types/tournament';
import {
  Calendar,
  Search,
  Filter,
  PlayCircle,
  Trophy,
  CheckCircle2,
  Clock,
  Radio,
  Lock,
  Unlock,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { GROUP_CONFIGS } from '../data/initialTournamentData';
import { syncManager } from '../lib/syncManager';

interface ScheduleViewProps {
  matches: Match[];
  teams: Team[];
  onOpenMatchScorer: (match: Match) => void;
  isRefereeMode: boolean;
  currentRefereeName?: string;
  onForceUnlockMatch?: (match: Match) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  matches,
  teams,
  onOpenMatchScorer,
  isRefereeMode,
  currentRefereeName = '',
  onForceUnlockMatch,
}) => {
  const [stageFilter, setStageFilter] = useState<'all' | 'group' | 'knockout'>('all');
  const [groupFilter, setGroupFilter] = useState<GroupLetter | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'completed' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [blockedLockAlert, setBlockedLockAlert] = useState<{
    match: Match;
    lockedBy: string;
    court: string;
  } | null>(null);

  const getTeamName = (teamId: string, placeholder?: string) => {
    if (!teamId) return placeholder || 'Đang xác định';
    const t = teams.find((item) => item.id === teamId);
    return t ? t.name : placeholder || 'Đang xác định';
  };

  const getTeamCode = (teamId: string) => {
    if (!teamId) return '';
    const t = teams.find((item) => item.id === teamId);
    return t ? t.code : '';
  };

  const getTeamPlayers = (teamId: string) => {
    if (!teamId) return '';
    const t = teams.find((item) => item.id === teamId);
    return t ? `${t.player1} & ${t.player2}` : '';
  };

  const liveMatches = useMemo(() => {
    return matches.filter(
      (m) => m.status === 'live' || (Boolean(m.lockedByRefereeName) && m.status !== 'completed')
    );
  }, [matches]);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // Stage filter
      if (stageFilter === 'group' && m.stage !== 'group') return false;
      if (stageFilter === 'knockout' && m.stage === 'group') return false;

      // Group filter (only applicable for group stage)
      if (groupFilter !== 'all' && m.groupId !== groupFilter) return false;

      // Status filter
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const t1Name = getTeamName(m.team1Id, m.team1Placeholder).toLowerCase();
        const t2Name = getTeamName(m.team2Id, m.team2Placeholder).toLowerCase();
        const t1Players = getTeamPlayers(m.team1Id).toLowerCase();
        const t2Players = getTeamPlayers(m.team2Id).toLowerCase();
        const round = m.roundName.toLowerCase();
        const court = m.court.toLowerCase();

        return (
          t1Name.includes(query) ||
          t2Name.includes(query) ||
          t1Players.includes(query) ||
          t2Players.includes(query) ||
          round.includes(query) ||
          court.includes(query)
        );
      }

      return true;
    });
  }, [matches, stageFilter, groupFilter, statusFilter, searchTerm, teams]);

  const handleCardClick = (m: Match) => {
    // If referee mode is active, verify lock
    if (isRefereeMode && syncManager.isMatchLockedByOther(m, currentRefereeName)) {
      setBlockedLockAlert({
        match: m,
        lockedBy: m.lockedByRefereeName || 'Trọng tài khác',
        court: m.lockedByCourt || m.court,
      });
      return;
    }
    onOpenMatchScorer(m);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display uppercase flex items-center gap-2">
              <Calendar className="w-6 h-6 text-sky-600" />
              LỊCH THI ĐẤU TOÀN GIẢI
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Toàn bộ lịch thi đấu các bảng đấu & vòng Knockout tranh cúp
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm VĐV, cặp đấu, sân..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-sky-500 bg-slate-50"
            />
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          {/* Stage Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => {
                setStageFilter('all');
                setGroupFilter('all');
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                stageFilter === 'all' && groupFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả các vòng
            </button>
            <button
              onClick={() => {
                setStageFilter('knockout');
                setGroupFilter('all');
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                stageFilter === 'knockout'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vòng Knockout
            </button>
          </div>

          {/* Group Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            {(['A', 'B', 'C', 'D'] as GroupLetter[]).map((grp) => {
              const isSelected = stageFilter !== 'knockout' && groupFilter === grp;
              return (
                <button
                  key={grp}
                  onClick={() => {
                    if (isSelected) {
                      setGroupFilter('all');
                    } else {
                      setStageFilter('all');
                      setGroupFilter(grp);
                    }
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bảng {grp}
                </button>
              );
            })}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl ml-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                statusFilter === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter('live')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 ${
                statusFilter === 'live' ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              {liveMatches.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />}
              <span>Đang đấu ({liveMatches.length})</span>
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                statusFilter === 'completed' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              Đã xong
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Live Score Stream Ribbon for Athletes & Spectators */}
      {liveMatches.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 p-3.5 sm:p-4 rounded-3xl text-slate-950 shadow-md border-2 border-amber-300 space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-900/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shrink-0" />
              <span className="font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 font-display">
                <Radio className="w-4 h-4 text-red-700 animate-pulse" />
                ĐANG THI ĐẤU TRỰC TIẾP ({liveMatches.length} SÂN) — CẬP NHẬT TỪNG ĐIỂM
              </span>
            </div>
            <span className="text-[10px] font-black uppercase bg-slate-950 text-amber-300 px-2 py-0.5 rounded-md">
              Live Stream
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {liveMatches.map((lm) => {
              const t1 = getTeamName(lm.team1Id, lm.team1Placeholder);
              const t2 = getTeamName(lm.team2Id, lm.team2Placeholder);
              const isLockedByOther = syncManager.isMatchLockedByOther(lm, currentRefereeName);

              return (
                <div
                  key={lm.id}
                  onClick={() => handleCardClick(lm)}
                  className="bg-slate-950 text-white p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 shadow-sm hover:border-amber-400 cursor-pointer transition-all"
                >
                  <div className="truncate flex-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-300 font-bold">
                      <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 uppercase font-mono font-black text-[9px]">
                        {lm.court}
                      </span>
                      <span>#{lm.matchNumber} · {lm.roundName}</span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white truncate mt-1">
                      {t1} vs {t2}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                      {lm.lockedByRefereeName ? (
                        <span className="flex items-center gap-1 text-amber-300 font-semibold">
                          <Lock className="w-2.5 h-2.5" />
                          <span>TT: {lm.lockedByRefereeName}</span>
                        </span>
                      ) : (
                        <span>
                          {lm.stage === 'group'
                            ? 'Chạm 11 (Không cách 2)'
                            : `Chạm ${lm.targetPoints} (Cách 2)`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                    <span className="font-mono text-2xl font-black text-amber-400 tabular-nums">
                      {lm.score1} - {lm.score2}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Matches List */}
      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
            Không tìm thấy trận đấu nào phù hợp với bộ lọc.
          </div>
        ) : (
          filteredMatches.map((m) => {
            const isCompleted = m.status === 'completed';
            const isLive = m.status === 'live' || (Boolean(m.lockedByRefereeName) && !isCompleted);
            const team1Name = getTeamName(m.team1Id, m.team1Placeholder);
            const team2Name = getTeamName(m.team2Id, m.team2Placeholder);
            const team1Code = getTeamCode(m.team1Id);
            const team2Code = getTeamCode(m.team2Id);
            const team1Players = getTeamPlayers(m.team1Id);
            const team2Players = getTeamPlayers(m.team2Id);

            const isTeam1Winner = isCompleted && m.winnerId === m.team1Id;
            const isTeam2Winner = isCompleted && m.winnerId === m.team2Id;

            const groupConfig = m.groupId ? GROUP_CONFIGS[m.groupId] : null;
            const isLockedByOther = syncManager.isMatchLockedByOther(m, currentRefereeName);

            return (
              <div
                key={m.id}
                className={`bg-white rounded-2xl border transition-all p-4 sm:p-5 shadow-xs ${
                  isLive
                    ? 'border-amber-400 ring-2 ring-amber-300 bg-amber-50/15'
                    : isCompleted
                    ? 'border-slate-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Left Column: Match Info & Badges (3 cols) */}
                  <div className="md:col-span-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        #{m.matchNumber}
                      </span>
                      {m.stage === 'group' && groupConfig && (
                        <span
                          className="px-2 py-0.5 rounded-md text-[11px] font-black text-white"
                          style={{ backgroundColor: groupConfig.color }}
                        >
                          {groupConfig.title}
                        </span>
                      )}
                      {m.stage !== 'group' && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-purple-600 text-white uppercase">
                          {m.stage === 'final'
                            ? 'Chung Kết'
                            : m.stage === 'semi'
                            ? 'Bán Kết'
                            : m.stage === 'third_place'
                            ? 'Tranh Hạng 3'
                            : 'Tứ Kết'}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-slate-700">
                        {m.roundName}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {m.startTime || 'TBD'}
                      </span>
                      <span>·</span>
                      <span className="font-bold text-sky-800">{m.court}</span>
                    </div>

                    {/* Live indicator or Lock info */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {isLive && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                          ĐANG ĐẤU TRỰC TIẾP
                        </div>
                      )}

                      {m.lockedByRefereeName && (
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isLockedByOther
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          <Lock className="w-2.5 h-2.5" />
                          <span>
                            {isLockedByOther
                              ? `Khóa bởi: ${m.lockedByRefereeName} (${m.lockedByCourt || m.court})`
                              : 'Đang do bạn điều hành'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle Column: Competitors and Scores (6 cols) */}
                  <div className="md:col-span-6 space-y-2">
                    {/* Team 1 Row */}
                    <div
                      className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                        isTeam1Winner
                          ? 'bg-emerald-50 text-slate-950 font-bold border border-emerald-200'
                          : 'bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {team1Code && (
                          <span className="w-7 h-7 rounded-md bg-white border border-slate-200 font-mono text-xs font-black flex items-center justify-center text-slate-700 shrink-0">
                            {team1Code}
                          </span>
                        )}
                        <div className="truncate">
                          <div className="text-sm font-bold truncate flex items-center gap-1.5">
                            {team1Name}
                            {isTeam1Winner && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </div>
                          {team1Players && (
                            <div className="text-[11px] text-slate-500 truncate">
                              {team1Players}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-3">
                        <span className="font-mono text-2xl font-black text-slate-900 tabular-nums">
                          {m.score1}
                        </span>
                      </div>
                    </div>

                    {/* Team 2 Row */}
                    <div
                      className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                        isTeam2Winner
                          ? 'bg-emerald-50 text-slate-950 font-bold border border-emerald-200'
                          : 'bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {team2Code && (
                          <span className="w-7 h-7 rounded-md bg-white border border-slate-200 font-mono text-xs font-black flex items-center justify-center text-slate-700 shrink-0">
                            {team2Code}
                          </span>
                        )}
                        <div className="truncate">
                          <div className="text-sm font-bold truncate flex items-center gap-1.5">
                            {team2Name}
                            {isTeam2Winner && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </div>
                          {team2Players && (
                            <div className="text-[11px] text-slate-500 truncate">
                              {team2Players}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-3">
                        <span className="font-mono text-2xl font-black text-slate-900 tabular-nums">
                          {m.score2}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Referee Scorer CTA (3 cols) */}
                  <div className="md:col-span-3 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block font-medium">
                        {m.stage === 'group'
                          ? 'Chạm 11 điểm (Không cách 2)'
                          : `Chạm ${m.targetPoints} điểm (cách 2)`}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCardClick(m)}
                      className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs ${
                        isLockedByOther
                          ? 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                          : isLive
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-black'
                          : isCompleted
                          ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                          : 'bg-sky-600 text-white hover:bg-sky-700'
                      }`}
                    >
                      {isLockedByOther ? (
                        <>
                          <Lock className="w-4 h-4 text-rose-600" />
                          <span>Đang bị khóa</span>
                        </>
                      ) : isLive ? (
                        <>
                          <PlayCircle className="w-4 h-4" />
                          <span>Chấm điểm LIVE</span>
                        </>
                      ) : isCompleted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Xem / Chỉnh sửa</span>
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-4 h-4" />
                          <span>Vào Chấm Điểm</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
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
                Để tránh mất dữ liệu hoặc xung đột điểm số khi 3 trọng tài cùng thao tác, trọng tài khác không được phép can thiệp. Điểm số của trận này đang được tự động cập nhật liên tục ra màn hình ngoài.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  const targetMatch = blockedLockAlert.match;
                  setBlockedLockAlert(null);
                  onOpenMatchScorer(targetMatch);
                }}
                className="px-3.5 py-2 text-xs font-bold text-sky-700 hover:bg-sky-50 rounded-xl transition-colors border border-sky-200"
              >
                Xem Trực Tiếp (Chỉ Xem)
              </button>
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
