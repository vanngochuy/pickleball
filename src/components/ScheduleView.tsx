import React, { useState, useMemo } from 'react';
import { Match, Team, MatchStage, GroupLetter } from '../types/tournament';
import { Calendar, Search, Filter, PlayCircle, Trophy, CheckCircle2, Clock } from 'lucide-react';
import { GROUP_CONFIGS } from '../data/initialTournamentData';

interface ScheduleViewProps {
  matches: Match[];
  teams: Team[];
  onOpenMatchScorer: (match: Match) => void;
  isRefereeMode: boolean;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  matches,
  teams,
  onOpenMatchScorer,
  isRefereeMode,
}) => {
  const [stageFilter, setStageFilter] = useState<'all' | 'group' | 'knockout'>('all');
  const [groupFilter, setGroupFilter] = useState<GroupLetter | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'completed' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');

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
              21 trận vòng bảng + 4 trận Tứ kết + 2 Bán kết + Tranh Hạng 3 & Chung Kết
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
              onClick={() => setStageFilter('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                stageFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả các vòng
            </button>
            <button
              onClick={() => setStageFilter('group')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                stageFilter === 'group'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vòng Bảng (21 trận)
            </button>
            <button
              onClick={() => setStageFilter('knockout')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                stageFilter === 'knockout'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vòng Knockout (8 trận)
            </button>
          </div>

          {/* Group Filter (when in group or all) */}
          {stageFilter !== 'knockout' && (
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setGroupFilter('all')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  groupFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                Mọi bảng
              </button>
              {(['A', 'B', 'C', 'D'] as GroupLetter[]).map((grp) => (
                <button
                  key={grp}
                  onClick={() => setGroupFilter(grp)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                    groupFilter === grp
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Bảng {grp}
                </button>
              ))}
            </div>
          )}

          {/* Status Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl ml-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter('live')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                statusFilter === 'live' ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              Đang đấu
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

      {/* Matches List */}
      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
            Không tìm thấy trận đấu nào phù hợp với bộ lọc.
          </div>
        ) : (
          filteredMatches.map((m) => {
            const isLive = m.status === 'live';
            const isCompleted = m.status === 'completed';
            const team1Name = getTeamName(m.team1Id, m.team1Placeholder);
            const team2Name = getTeamName(m.team2Id, m.team2Placeholder);
            const team1Code = getTeamCode(m.team1Id);
            const team2Code = getTeamCode(m.team2Id);
            const team1Players = getTeamPlayers(m.team1Id);
            const team2Players = getTeamPlayers(m.team2Id);

            const isTeam1Winner = isCompleted && m.winnerId === m.team1Id;
            const isTeam2Winner = isCompleted && m.winnerId === m.team2Id;

            const groupConfig = m.groupId ? GROUP_CONFIGS[m.groupId] : null;

            return (
              <div
                key={m.id}
                className={`bg-white rounded-2xl border transition-all p-4 sm:p-5 shadow-xs ${
                  isLive
                    ? 'border-amber-400 ring-2 ring-amber-300 bg-amber-50/20'
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
                      <span className="font-medium text-slate-700">{m.court}</span>
                    </div>

                    {isLive && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                        TRẬN ĐẤU ĐANG DIỄN RA
                      </div>
                    )}
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
                      <span className="text-[11px] text-slate-400 block">
                        Đến {m.targetPoints} điểm {m.targetPoints === 11 ? '(cách 2)' : ''}
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenMatchScorer(m)}
                      className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs ${
                        isLive
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                          : isCompleted
                          ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                          : 'bg-sky-600 text-white hover:bg-sky-700'
                      }`}
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>
                        {isLive
                          ? 'Chấm điểm LIVE'
                          : isCompleted
                          ? 'Xem / Chỉnh sửa'
                          : 'Vào Chấm Điểm'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
