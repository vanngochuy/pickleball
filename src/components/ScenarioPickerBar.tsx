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
import { Sparkles, Check, RefreshCw, Trophy, Flame, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { sounds } from '../lib/tournamentUtils';
import confetti from 'canvas-confetti';

interface ScenarioPickerBarProps {
  currentScenario: ScenarioType;
  onSelectScenario: (scenario: ScenarioType, newMatches: Match[]) => void;
}

export const ScenarioPickerBar: React.FC<ScenarioPickerBarProps> = ({
  currentScenario,
  onSelectScenario,
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
    <div className="bg-slate-100/90 border-b border-slate-200/80 px-3 sm:px-6 py-1.5 transition-all">
      <div className="max-w-7xl mx-auto">
        {/* Sleek compact 1-line control */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate text-[11px] sm:text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-slate-500 font-semibold shrink-0">Dữ liệu test:</span>
            <span className="font-bold text-slate-900 truncate flex items-center gap-1">
              {getScenarioIcon(currentScenario)}
              <span className="truncate">{currentInfo?.name}</span>
            </span>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-sky-700 flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
          >
            <span>{isOpen ? 'Thu gọn' : 'Đổi kịch bản'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
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
