import React, { useState } from 'react';
import {
  ScenarioType,
  SCENARIO_LIST,
  getFullCompletedScenario,
  getTiebreakScenario,
  getMidTournamentLiveScenario,
  getCleanResetScenario
} from '../data/mockScenarios';
import { Match } from '../types/tournament';
import { Sparkles, Check, RefreshCw, Trophy, Flame, Layers, ChevronDown, ChevronUp, Zap, RotateCcw, ShieldCheck } from 'lucide-react';
import { sounds } from '../lib/tournamentUtils';
import confetti from 'canvas-confetti';

interface ScenarioPickerBarProps {
  currentScenario: ScenarioType;
  onSelectScenario: (scenario: ScenarioType, newMatches: Match[]) => void;
  onOpenTestBench?: () => void;
  onResetTournament?: () => void;
  onOpenAdminModal?: () => void;
}

export const ScenarioPickerBar: React.FC<ScenarioPickerBarProps> = ({
  currentScenario,
  onSelectScenario,
  onOpenTestBench,
  onResetTournament,
  onOpenAdminModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleApplyScenario = (type: ScenarioType) => {
    sounds.playHit();
    let newMatches: Match[] = [];

    if (type === 'full_completed') {
      newMatches = getFullCompletedScenario();
      confetti({ particleCount: 60, spread: 55 });
      sounds.playFanfare();
    } else if (type === 'tiebreak_points') {
      newMatches = getTiebreakScenario();
    } else if (type === 'mid_tournament_live') {
      newMatches = getMidTournamentLiveScenario();
    } else if (type === 'clean_reset') {
      newMatches = getCleanResetScenario();
    }

    onSelectScenario(type, newMatches);
    setIsOpen(false); // auto-collapse after pick to keep mobile screen clean
  };

  const getScenarioIcon = (id: ScenarioType) => {
    switch (id) {
      case 'full_completed':
        return <Trophy className="w-3.5 h-3.5 text-amber-500" />;
      case 'tiebreak_points':
        return <Layers className="w-3.5 h-3.5 text-indigo-500" />;
      case 'mid_tournament_live':
        return <Flame className="w-3.5 h-3.5 text-rose-500" />;
      case 'clean_reset':
        return <RefreshCw className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const currentInfo = SCENARIO_LIST.find((s) => s.id === currentScenario);

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 px-3 sm:px-6 py-1.5 transition-all">
      <div className="max-w-7xl mx-auto">
        {/* Sleek compact 1-line control */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate text-[11px] sm:text-xs">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider shrink-0">
              <ShieldCheck className="w-3 h-3" />
              ADMIN BTC
            </span>
            <span className="text-slate-400 font-semibold shrink-0">Kịch bản:</span>
            <span className="font-bold text-white truncate flex items-center gap-1">
              {getScenarioIcon(currentScenario)}
              <span className="truncate">{currentInfo?.name}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onResetTournament && (
              <button
                onClick={onResetTournament}
                className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] flex items-center gap-1 shrink-0 transition-all shadow-2xs active:scale-95"
                title="Reset sạch sẽ toàn bộ giải về 0 - 0 trước giờ khai mạc 31/10"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset 0-0 Giải Thật</span>
                <span className="sm:hidden">Reset 0-0</span>
              </button>
            )}

            {onOpenTestBench && (
              <button
                onClick={onOpenTestBench}
                className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] flex items-center gap-1 shrink-0 transition-colors shadow-2xs active:scale-95"
                title="Chạy mô phỏng và đánh giá 3 trọng tài thao tác đồng thời trên 3 sân"
              >
                <Zap className="w-3 h-3 fill-slate-950" />
                <span className="hidden sm:inline">Test 3 Trọng Tài Đồng Thời</span>
                <span className="sm:hidden">Test 3 TT</span>
              </button>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-sky-300 flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
            >
              <span>{isOpen ? 'Thu gọn' : 'Đổi kịch bản'}</span>
              {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Options Drawer */}
        {isOpen && (
          <div className="pt-2 pb-1 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-slate-200/60 mt-1.5 animate-fadeIn">
            {SCENARIO_LIST.map((sc) => {
              const isActive = currentScenario === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => handleApplyScenario(sc.id)}
                  className={`p-2 rounded-xl text-left text-xs font-semibold border transition-all flex flex-col justify-between ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    {getScenarioIcon(sc.id)}
                    {isActive ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="text-[9px] text-slate-400 font-mono">{sc.badge}</span>
                    )}
                  </div>
                  <div className="font-bold truncate text-[11px] sm:text-xs">{sc.name}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
