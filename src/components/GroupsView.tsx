import React, { useState } from 'react';
import { Team, Match, GroupLetter } from '../types/tournament';
import { GROUP_CONFIGS } from '../data/initialTournamentData';
import { calculateGroupStandings } from '../lib/tournamentUtils';
import {
  Users,
  CheckCircle2,
  Flame,
  PlayCircle
} from 'lucide-react';

interface GroupsViewProps {
  teams: Team[];
  matches: Match[];
  onOpenMatchScorer: (match: Match) => void;
  onSelectTeam?: (team: Team) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({
  teams,
  matches,
  onOpenMatchScorer,
}) => {
  // Mobile quick filter: allows selecting a specific group or viewing all
  const [selectedMobileGroup, setSelectedMobileGroup] = useState<GroupLetter | 'all'>('all');

  const groups: GroupLetter[] = ['A', 'B', 'C', 'D'];

  const displayedGroups = selectedMobileGroup === 'all'
    ? groups
    : groups.filter((g) => g === selectedMobileGroup);

  return (
    <div className="space-y-4">
      {/* Top Bar: Title & Mobile Group Switcher */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight font-display uppercase flex items-center gap-1.5">
              <Users className="w-5 h-5 text-sky-600 shrink-0" />
              <span>BẢNG ĐẤU & THỨ TỰ XẾP HẠNG</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Thứ tự các cặp đấu tự động sắp xếp theo kết quả thi đấu
            </p>
          </div>
        </div>

        {/* Quick Group Filter Pills (Mobile-first Touch Ergonomics) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            onClick={() => setSelectedMobileGroup('all')}
            className={`px-3 py-1 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              selectedMobileGroup === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả 4 bảng
          </button>
          {groups.map((g) => {
            const config = GROUP_CONFIGS[g];
            const isSelected = selectedMobileGroup === g;
            return (
              <button
                key={g}
                onClick={() => setSelectedMobileGroup(g)}
                className={`px-3 py-1 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                style={isSelected ? { backgroundColor: config.color } : {}}
              >
                <span>Bảng {g}</span>
                <span className="text-[10px] opacity-80">
                  ({teams.filter((t) => t.groupId === g).length})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Merged Group Cards: Draw Info + Real-Time Dynamic Sorting */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {displayedGroups.map((grpLetter) => {
          const config = GROUP_CONFIGS[grpLetter];
          // Real-time calculation: teams automatically sorted by Points -> Point Diff -> Points For -> Head-to-Head
          const standings = calculateGroupStandings(grpLetter, teams, matches);
          const groupMatches = matches.filter((m) => m.groupId === grpLetter);
          const completedCount = groupMatches.filter((m) => m.status === 'completed').length;
          const liveMatch = groupMatches.find((m) => m.status === 'live');
          const nextPending = groupMatches.find((m) => m.status === 'pending');

          return (
            <div
              key={grpLetter}
              className="bg-white rounded-2xl border-2 overflow-hidden shadow-2xs flex flex-col transition-all hover:shadow-sm"
              style={{ borderColor: config.color }}
            >
              {/* Group Card Header */}
              <div
                className="px-3.5 py-2.5 text-white flex items-center justify-between font-extrabold"
                style={{ backgroundColor: config.color }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-slate-950 font-black text-[11px] shadow-xs">
                    ⚡
                  </div>
                  <span className="text-lg font-display tracking-wider uppercase">
                    {config.title}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-md font-mono font-bold">
                    {completedCount}/{groupMatches.length} trận
                  </span>
                </div>
              </div>

              {/* Sub-header banner showing qualification rule */}
              <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200/80 flex items-center justify-between text-[10px] text-slate-600 font-medium">
                <span className="flex items-center gap-1 font-bold text-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Top 2 đi tiếp vào Tứ Kết
                </span>
                <span className="text-slate-400 font-mono">
                  {completedCount > 0 ? 'Đã xếp theo kết quả' : 'Thứ tự bốc thăm'}
                </span>
              </div>

              {/* Card Body: Dynamic Auto-Sorted Team Rows */}
              <div className="p-2.5 sm:p-3 space-y-2 flex-1 bg-slate-50/30">
                {standings.map((item) => {
                  const hasPlayed = item.played > 0;
                  const isAdvancing = item.rank <= 2 && (hasPlayed || completedCount > 0);
                  const isFirst = item.rank === 1 && hasPlayed;
                  const isSecond = item.rank === 2 && hasPlayed;

                  return (
                    <div
                      key={item.team.id}
                      className={`p-2 rounded-xl border transition-all ${
                        isAdvancing
                          ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/40'
                          : 'bg-white border-slate-200/90 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        {/* Left: Rank # + Code + Pair Name & Players */}
                        <div className="flex items-center gap-2 truncate">
                          {/* Rank badge: 🥇 🥈 or #3 #4 */}
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-xs shrink-0 shadow-2xs ${
                              isFirst
                                ? 'bg-amber-400 text-slate-950'
                                : isSecond
                                ? 'bg-slate-300 text-slate-900'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isFirst ? '🥇' : isSecond ? '🥈' : `#${item.rank}`}
                          </div>

                          <div className="truncate">
                            <div className="font-bold text-xs sm:text-sm text-slate-900 truncate flex items-center gap-1">
                              <span
                                className="px-1.5 py-0.2 rounded text-[10px] font-mono font-black text-white shrink-0"
                                style={{ backgroundColor: config.color }}
                              >
                                {item.team.code}
                              </span>
                              <span className="truncate">{item.team.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 truncate mt-0.5">
                              {item.team.player1} & {item.team.player2}
                            </div>
                          </div>
                        </div>

                        {/* Right: Live Match Stats */}
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1 justify-end font-mono">
                            <span className="font-black text-xs sm:text-sm text-slate-950 bg-slate-100 px-1.5 py-0.5 rounded">
                              {item.points}đ
                            </span>
                            <span
                              className={`text-[10px] font-bold ${
                                item.pointDiff > 0
                                  ? 'text-emerald-700'
                                  : item.pointDiff < 0
                                  ? 'text-rose-600'
                                  : 'text-slate-400'
                              }`}
                            >
                              ({item.pointDiff > 0 ? `+${item.pointDiff}` : item.pointDiff})
                            </span>
                          </div>
                          <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                            {item.played} trận ({item.won}T-{item.lost}B)
                          </div>
                        </div>
                      </div>

                      {/* Advance tag for Top 2 */}
                      {isAdvancing && (
                        <div className="mt-1.5 pt-1 border-t border-emerald-200/60 flex items-center justify-between text-[9px] text-emerald-800 font-bold">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            Đủ điều kiện vào Tứ Kết
                          </span>
                          <span className="font-mono text-emerald-700">
                            Hạng {item.rank} {grpLetter}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quick Action Button at Card Footer */}
              <div className="p-2 bg-slate-100/90 border-t border-slate-200/80 flex items-center justify-between gap-1.5">
                {liveMatch ? (
                  <button
                    onClick={() => onOpenMatchScorer(liveMatch)}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1 shadow-2xs animate-pulse"
                  >
                    <Flame className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                    <span>ĐANG ĐẤU: CHẤM ĐIỂM NGAY</span>
                  </button>
                ) : nextPending ? (
                  <button
                    onClick={() => onOpenMatchScorer(nextPending)}
                    className="w-full py-1.5 px-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow-2xs"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Chấm Trận: {nextPending.roundName}</span>
                  </button>
                ) : (
                  <div className="w-full py-1 text-center text-[10px] font-bold text-emerald-700">
                    ✓ Đã hoàn tất mọi trận Bảng {grpLetter}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
