import React, { useState, useEffect, useRef } from 'react';
import { Match, Team } from '../types/tournament';
import { sounds } from '../lib/tournamentUtils';
import {
  X,
  Plus,
  Minus,
  RotateCcw,
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2,
  Trophy,
  Zap,
  Radio,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RefereeScorerModalProps {
  match: Match | null;
  teams: Team[];
  refereeName?: string;
  assignedCourt?: string;
  onClose: () => void;
  onSaveMatch: (updatedMatch: Match) => void;
  onLiveScoreUpdate?: (updatedMatch: Match) => void;
  onReleaseLock?: (match: Match) => void;
}

export const RefereeScorerModal: React.FC<RefereeScorerModalProps> = ({
  match,
  teams,
  refereeName,
  assignedCourt,
  onClose,
  onSaveMatch,
  onLiveScoreUpdate,
  onReleaseLock,
}) => {
  if (!match) return null;

  const team1 = teams.find((t) => t.id === match.team1Id);
  const team2 = teams.find((t) => t.id === match.team2Id);

  const team1Name = team1 ? team1.name : match.team1Placeholder || 'Đội 1';
  const team2Name = team2 ? team2.name : match.team2Placeholder || 'Đội 2';
  const team1Players = team1 ? `${team1.player1} & ${team1.player2}` : '';
  const team2Players = team2 ? `${team2.player1} & ${team2.player2}` : '';

  // Local state for live scoring session
  const [score1, setScore1] = useState(match.score1);
  const [score2, setScore2] = useState(match.score2);
  const [serverNumber, setServerNumber] = useState<1 | 2>(match.serverNumber || 1);
  const [servingTeam, setServingTeam] = useState<'team1' | 'team2'>(
    match.servingTeamId === match.team2Id ? 'team2' : 'team1'
  );
  const [status, setStatus] = useState<Match['status']>(
    match.status === 'pending' ? 'live' : match.status
  );
  const [refereeNotes, setRefereeNotes] = useState(match.refereeNotes || '');
  const [isSwapped, setIsSwapped] = useState(false); // Court side switch for display
  const [history, setHistory] = useState<{ s1: number; s2: number; serving: 'team1' | 'team2'; sNum: 1 | 2 }[]>([]);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [showNotesInput, setShowNotesInput] = useState(false);

  // Keep phone screen awake during match
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    if ('wakeLock' in navigator) {
      try {
        (navigator as any).wakeLock.request('screen').then((lock: any) => {
          wakeLockRef.current = lock;
        }).catch(() => {});
      } catch {
        // ignore
      }
    }

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, []);

  const triggerHaptic = (duration = 45) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch {
        // ignore
      }
    }
  };

  const targetPoints = match.targetPoints || 11;
  const isGroupStage = match.stage === 'group';
  const requiresWinByTwo = !isGroupStage; // Vòng bảng: 1 set chạm 11 không cần cách 2. Knockout: cần cách 2 điểm!

  // Check if someone reached winning condition
  const isMatchPointTeam1 = requiresWinByTwo
    ? (score1 >= targetPoints - 1 && score1 > score2)
    : (score1 === targetPoints - 1 && score2 < targetPoints);
  const isMatchPointTeam2 = requiresWinByTwo
    ? (score2 >= targetPoints - 1 && score2 > score1)
    : (score2 === targetPoints - 1 && score1 < targetPoints);

  const hasWinner = requiresWinByTwo
    ? ((score1 >= targetPoints && score1 - score2 >= 2) || (score2 >= targetPoints && score2 - score1 >= 2))
    : (score1 >= targetPoints || score2 >= targetPoints);
  const winner = score1 > score2 ? 'team1' : 'team2';

  // Record point change for undo
  const recordHistory = () => {
    setHistory((prev) => [
      ...prev,
      { s1: score1, s2: score2, serving: servingTeam, sNum: serverNumber },
    ]);
  };

  // Broadcast live score update on every point modification so athletes watching "Lịch thi đấu" see it in real-time!
  const emitLiveUpdate = (
    newScore1: number,
    newScore2: number,
    newServingTeam: 'team1' | 'team2',
    newServerNum: 1 | 2,
    newStatus: Match['status'] = 'live'
  ) => {
    const updated: Match = {
      ...match,
      score1: newScore1,
      score2: newScore2,
      serverNumber: newServerNum,
      servingTeamId: newServingTeam === 'team1' ? match.team1Id : match.team2Id,
      status: newStatus,
      refereeNotes,
      refereeName: refereeName || match.refereeName,
      lockedByRefereeName: refereeName || match.refereeName,
      lockedByCourt: assignedCourt || match.court,
      lockedAt: match.lockedAt || Date.now(),
      lastUpdatedAt: Date.now(),
    };
    if (onLiveScoreUpdate) {
      onLiveScoreUpdate(updated);
    }
  };

  const handleAddPointTeam1 = () => {
    recordHistory();
    const nextScore = score1 + 1;
    setScore1(nextScore);
    triggerHaptic(50);
    sounds.playHit();

    const isWin = requiresWinByTwo
      ? (nextScore >= targetPoints && nextScore - score2 >= 2)
      : (nextScore >= targetPoints);

    if (isWin) {
      sounds.playPoint();
    }
    emitLiveUpdate(nextScore, score2, servingTeam, serverNumber);
  };

  const handleAddPointTeam2 = () => {
    recordHistory();
    const nextScore = score2 + 1;
    setScore2(nextScore);
    triggerHaptic(50);
    sounds.playHit();

    const isWin = requiresWinByTwo
      ? (nextScore >= targetPoints && nextScore - score1 >= 2)
      : (nextScore >= targetPoints);

    if (isWin) {
      sounds.playPoint();
    }
    emitLiveUpdate(score1, nextScore, servingTeam, serverNumber);
  };

  const handleMinusPointTeam1 = () => {
    if (score1 <= 0) return;
    recordHistory();
    const nextScore = score1 - 1;
    setScore1(nextScore);
    triggerHaptic(30);
    emitLiveUpdate(nextScore, score2, servingTeam, serverNumber);
  };

  const handleMinusPointTeam2 = () => {
    if (score2 <= 0) return;
    recordHistory();
    const nextScore = score2 - 1;
    setScore2(nextScore);
    triggerHaptic(30);
    emitLiveUpdate(score1, nextScore, servingTeam, serverNumber);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setScore1(last.s1);
    setScore2(last.s2);
    setServingTeam(last.serving);
    setServerNumber(last.sNum);
    setHistory((prev) => prev.slice(0, prev.length - 1));
    triggerHaptic(35);
    emitLiveUpdate(last.s1, last.s2, last.serving, last.sNum);
  };

  // Toggle side out / server 1 or 2
  const handleSideOut = () => {
    recordHistory();
    triggerHaptic(40);
    let nextServerNumber: 1 | 2 = 1;
    let nextServingTeam: 'team1' | 'team2' = servingTeam;
    if (serverNumber === 1) {
      nextServerNumber = 2;
    } else {
      nextServerNumber = 1;
      nextServingTeam = servingTeam === 'team1' ? 'team2' : 'team1';
    }
    setServerNumber(nextServerNumber);
    setServingTeam(nextServingTeam);
    sounds.playHit();
    emitLiveUpdate(score1, score2, nextServingTeam, nextServerNumber);
  };

  // Swap display sides
  const handleSwapSides = () => {
    triggerHaptic(30);
    setIsSwapped(!isSwapped);
  };

  // Exit and release match lock so other referees can view / enter if needed
  const handleExitAndRelease = () => {
    const updatedMatch: Match = {
      ...match,
      score1,
      score2,
      status: score1 > 0 || score2 > 0 ? 'live' : match.status,
      serverNumber,
      servingTeamId: servingTeam === 'team1' ? match.team1Id : match.team2Id,
      refereeNotes,
      refereeName: refereeName || match.refereeName,
      lockedByRefereeName: undefined,
      lockedByCourt: undefined,
      lockedAt: undefined,
      lastUpdatedAt: Date.now(),
    };
    if (onReleaseLock) {
      onReleaseLock(updatedMatch);
    }
    onClose();
  };

  // Finish Match
  const handleConfirmFinish = () => {
    const finalWinnerId =
      score1 > score2 ? match.team1Id : match.team2Id;

    const updatedMatch: Match = {
      ...match,
      score1,
      score2,
      status: 'completed',
      winnerId: finalWinnerId,
      serverNumber,
      servingTeamId: servingTeam === 'team1' ? match.team1Id : match.team2Id,
      refereeNotes,
      refereeName: refereeName || match.refereeName,
      lockedByRefereeName: undefined,
      lockedByCourt: undefined,
      lockedAt: undefined,
      lastUpdatedAt: Date.now(),
    };

    sounds.playWhistle();
    triggerHaptic(150);
    confetti({ particleCount: 80, spread: 70 });
    onSaveMatch(updatedMatch);
    onClose();
  };

  // Save intermediate state (Live)
  const handleSaveDraft = () => {
    handleExitAndRelease();
  };

  // Calculated serving call format: ServingScore - ReceivingScore - ServerNumber (e.g. 4 - 3 - 2)
  const servingScore = servingTeam === 'team1' ? score1 : score2;
  const receivingScore = servingTeam === 'team1' ? score2 : score1;
  const callScore = `${servingScore} - ${receivingScore} - ${serverNumber}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-1 sm:p-4 overflow-hidden">
      <div className="bg-slate-950 text-white w-full max-w-3xl rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[98dvh] sm:h-auto max-h-[98dvh] overflow-hidden">
        {/* Top Header - Ultra compact single row */}
        <div className="px-3.5 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 truncate">
            <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="truncate flex items-center gap-2">
              <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white font-display uppercase truncate">
                {match.roundName} #{match.matchNumber}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950 uppercase shrink-0 font-mono">
                {match.court}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                isGroupStage
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              }`}>
                {isGroupStage ? 'Chạm 11 (Không cách 2)' : `Chạm ${targetPoints} (Cách 2)`}
              </span>
              {(refereeName || match.refereeName) && (
                <span className="text-[10px] text-amber-300 font-semibold truncate hidden sm:inline">
                  • TT: {refereeName || match.refereeName}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleSwapSides}
              title="Đổi bên sân"
              className="px-2 py-1 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 flex items-center gap-1 transition-colors"
            >
              <ArrowLeftRight className="w-3 h-3" />
              <span className="text-[10px] font-bold">Đổi Sân</span>
            </button>

            <button
              onClick={handleExitAndRelease}
              title="Lưu tạm & Thoát"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Broadcast & Lock Indicator */}
        <div className="bg-sky-950/80 border-b border-sky-800/40 px-3.5 py-1 flex items-center justify-between text-[11px] shrink-0">
          <div className="flex items-center gap-1.5 text-sky-200">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
            <span className="truncate">Đang phát trực tiếp từng điểm lên <strong>Lịch thi đấu</strong></span>
          </div>
          <div className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 shrink-0">
            🔒 Khóa độc quyền: {refereeName || match.refereeName || 'Trọng tài'}
          </div>
        </div>

        {/* Pickleball Doubles Call Ribbon - Clear compact outdoor reference */}
        <div className="bg-sky-950/90 border-b border-sky-800/50 px-3 py-1.5 flex items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
            <span className="text-[11px] text-sky-300 hidden sm:inline font-medium">Hô điểm:</span>
            <span className="font-mono font-black text-amber-300 text-sm sm:text-base bg-slate-900 px-2 py-0.5 rounded border border-amber-300/40 shrink-0">
              {callScore}
            </span>
            <span className="text-[10px] text-slate-300 truncate">
              ({servingTeam === 'team1' ? team1Name : team2Name} - Giao {serverNumber})
            </span>
          </div>

          <button
            onClick={handleSideOut}
            className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 rounded-lg font-black text-[11px] transition-all shadow-2xs flex items-center gap-1 shrink-0"
          >
            <Zap className="w-3 h-3" />
            <span>Side Out</span>
          </button>
        </div>

        {/* Compact Match Point or Winner Alert Banner */}
        {(isMatchPointTeam1 || isMatchPointTeam2) && !hasWinner && (
          <div className="bg-rose-600 text-white text-center py-1 px-2 font-black text-[10px] sm:text-xs uppercase tracking-wider animate-pulse shrink-0">
            {isMatchPointTeam1 && isMatchPointTeam2 ? (
              <span>★ ĐIỂM QUYẾT ĐỊNH (10 - 10) — ĐỘI NÀO GHI ĐIỂM TIẾP THEO SẼ THẮNG TRẬN (CHẠM 11) ★</span>
            ) : (
              <span>★ MATCH POINT — {isMatchPointTeam1 ? team1Name : team2Name} ĐANG CÓ ĐIỂM THẮNG TRẬN ★</span>
            )}
          </div>
        )}

        {hasWinner && (
          <div className="bg-emerald-600 text-white text-center py-1.5 px-3 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-inner shrink-0">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>CHIẾN THẮNG: {winner === 'team1' ? team1Name : team2Name} ({score1} - {score2})</span>
          </div>
        )}

        {/* Main 2-Column Split Court Layout - Fits 100% On Phone Screen Without Scrolling */}
        <div className="p-2 sm:p-4 flex-1 flex flex-col justify-between gap-2 overflow-hidden">
          <div className="grid grid-cols-2 gap-2 sm:gap-4 flex-1 items-stretch">
            {(!isSwapped ? [1, 2] : [2, 1]).map((teamSlot) => {
              const isT1 = teamSlot === 1;
              const name = isT1 ? team1Name : team2Name;
              const players = isT1 ? team1Players : team2Players;
              const score = isT1 ? score1 : score2;
              const isServing = (isT1 && servingTeam === 'team1') || (!isT1 && servingTeam === 'team2');
              const onAdd = isT1 ? handleAddPointTeam1 : handleAddPointTeam2;
              const onMinus = isT1 ? handleMinusPointTeam1 : handleMinusPointTeam2;

              return (
                <div
                  key={teamSlot}
                  className={`rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border-2 flex flex-col justify-between transition-all ${
                    isServing
                      ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-400/40 shadow-md'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  {/* Team Identity Header */}
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {isT1 ? 'ĐỘI A' : 'ĐỘI B'}
                      </span>
                      {isServing ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500 text-slate-950 uppercase animate-pulse">
                          GIAO S{serverNumber}
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-500 font-mono">Đỡ bóng</span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-lg font-black text-white font-display tracking-tight truncate leading-snug">
                      {name}
                    </h3>
                    {players && (
                      <p className="text-[10px] text-slate-400 truncate">
                        {players}
                      </p>
                    )}
                  </div>

                  {/* Score Display - Scaled to fit screen height perfectly */}
                  <div className="my-auto py-2 text-center">
                    <div className="font-mono text-5xl sm:text-7xl font-black text-white tracking-tighter tabular-nums drop-shadow-md">
                      {score}
                    </div>
                  </div>

                  {/* Dual Action Buttons for this Team */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    <button
                      onClick={onMinus}
                      disabled={score <= 0}
                      className="col-span-1 h-12 sm:h-14 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-30 text-white flex items-center justify-center transition-all border border-slate-700"
                      title="Trừ 1 điểm"
                    >
                      <Minus className="w-5 h-5 text-slate-300" />
                    </button>

                    <button
                      onClick={onAdd}
                      className={`col-span-3 h-12 sm:h-14 rounded-xl text-slate-950 font-black text-lg sm:text-2xl flex items-center justify-center gap-1 active:scale-95 transition-all shadow-md ${
                        isServing
                          ? 'bg-amber-400 hover:bg-amber-300'
                          : 'bg-emerald-400 hover:bg-emerald-300'
                      }`}
                    >
                      <Plus className="w-6 h-6 stroke-[3]" />
                      <span>+1 ĐIỂM</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Referee Action Strip */}
          <div className="bg-slate-900/90 px-2.5 py-1.5 rounded-xl border border-slate-800 flex items-center justify-between gap-1.5 text-xs shrink-0">
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 flex items-center gap-1 font-bold text-[11px] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Hoàn tác ({history.length})</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic(30);
                setServingTeam(servingTeam === 'team1' ? 'team2' : 'team1');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] transition-colors truncate"
            >
              Đổi giao: {servingTeam === 'team1' ? 'Đội 2' : 'Đội 1'}
            </button>

            <button
              onClick={() => setShowNotesInput(!showNotesInput)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 shrink-0"
            >
              <FileText className="w-3 h-3 text-slate-400" />
              <span>Ghi chú</span>
            </button>
          </div>

          {showNotesInput && (
            <div className="shrink-0">
              <input
                type="text"
                placeholder="Ghi chú trọng tài (bóng hỏng, khiếu nại...)"
                value={refereeNotes}
                onChange={(e) => setRefereeNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
              />
            </div>
          )}
        </div>

        {/* Modal Bottom Actions - Big touch buttons fixed within thumb reach */}
        <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-xl text-slate-400 hover:text-white font-semibold text-xs"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveDraft}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              Lưu Tạm
            </button>

            <button
              onClick={() => setShowConfirmFinish(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>HOÀN TẤT TRẬN</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog before finalizing match */}
      {showConfirmFinish && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 max-w-xs w-full space-y-3 text-white shadow-2xl text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Trophy className="w-5 h-5" />
            </div>

            <div>
              <h4 className="text-sm font-bold">Xác nhận hoàn tất trận?</h4>
              <p className="text-xs text-slate-400 mt-1">
                Tỷ số:{' '}
                <span className="font-bold text-amber-300 font-mono">
                  {score1} - {score2}
                </span>
              </p>
              <p className="text-xs text-emerald-400 font-semibold mt-1">
                Thắng: {score1 > score2 ? team1Name : team2Name}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setShowConfirmFinish(false)}
                className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Chấm tiếp
              </button>
              <button
                onClick={handleConfirmFinish}
                className="py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs"
              >
                Xác Nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
