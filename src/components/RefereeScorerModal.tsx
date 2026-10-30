import React, { useState, useEffect, useRef } from 'react';
import { Match, Team } from '../types/tournament';
import { sounds } from '../lib/tournamentUtils';
import { syncManager } from '../lib/syncManager';
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
  FileText,
  Lock,
  Eye,
  KeyRound,
  ShieldAlert,
  Flame,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RefereeScorerModalProps {
  match: Match | null;
  teams: Team[];
  refereeName?: string;
  assignedCourt?: string;
  isAdmin?: boolean;
  isReferee?: boolean;
  onOpenRefereeLogin?: () => void;
  onOpenAdminLogin?: () => void;
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
  isAdmin = false,
  isReferee = false,
  onOpenRefereeLogin,
  onOpenAdminLogin,
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
  const [showAdminSaveConfirm, setShowAdminSaveConfirm] = useState(false);
  const [showNotesInput, setShowNotesInput] = useState(false);

  const isCompleted = match.status === 'completed';

  // Authorization logic:
  // 1. Admin can control any match (including modifying completed matches)
  // 2. Logged-in Referee can control only non-completed matches
  // 3. Regular viewer (neither Admin nor Referee) cannot control any score
  const canControl = isAdmin || (isReferee && !isCompleted);
  const isSpectator = !isAdmin && !isReferee;
  const isLockedForReferee = isReferee && !isAdmin && isCompleted;
  const isAdminEditingCompleted = isAdmin && isCompleted;

  // Real-time synchronization for spectator mode: update scoreboard live when referee scores
  useEffect(() => {
    const unsubscribe = syncManager.subscribe((event) => {
      if (
        (event.type === 'MATCH_LIVE_UPDATE' || event.type === 'MATCH_COMPLETED') &&
        event.match.id === match.id
      ) {
        if (!canControl) {
          setScore1(event.match.score1);
          setScore2(event.match.score2);
          setServerNumber(event.match.serverNumber || 1);
          setServingTeam(event.match.servingTeamId === event.match.team2Id ? 'team2' : 'team1');
          setStatus(event.match.status);
          if (event.match.refereeNotes !== undefined) {
            setRefereeNotes(event.match.refereeNotes);
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [match.id, canControl]);

  // Keep phone screen awake during match if referee is scoring
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    if (canControl && 'wakeLock' in navigator) {
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
  }, [canControl]);

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
    if (!canControl) return;

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
    if (!canControl) return;
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
    if (!canControl) return;
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
    if (!canControl || score1 <= 0) return;
    recordHistory();
    const nextScore = score1 - 1;
    setScore1(nextScore);
    triggerHaptic(30);
    emitLiveUpdate(nextScore, score2, servingTeam, serverNumber);
  };

  const handleMinusPointTeam2 = () => {
    if (!canControl || score2 <= 0) return;
    recordHistory();
    const nextScore = score2 - 1;
    setScore2(nextScore);
    triggerHaptic(30);
    emitLiveUpdate(score1, nextScore, servingTeam, serverNumber);
  };

  const handleUndo = () => {
    if (!canControl || history.length === 0) return;
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
    if (!canControl) return;
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
    if (canControl) {
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
    }
    onClose();
  };

  // Confirm Finish Match ("Kết thúc trận đấu")
  const handleConfirmFinish = () => {
    if (!canControl) return;

    const finalWinnerId = score1 > score2 ? match.team1Id : match.team2Id;

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

  // Admin saving score edits on an already completed match
  const handleAdminSaveCompletedScore = () => {
    if (!isAdmin) return;

    const finalWinnerId = score1 > score2 ? match.team1Id : match.team2Id;

    const updatedMatch: Match = {
      ...match,
      score1,
      score2,
      status: 'completed',
      winnerId: finalWinnerId,
      serverNumber,
      servingTeamId: servingTeam === 'team1' ? match.team1Id : match.team2Id,
      refereeNotes,
      lastUpdatedAt: Date.now(),
    };

    sounds.playPoint();
    triggerHaptic(100);
    onSaveMatch(updatedMatch);
    setShowAdminSaveConfirm(false);
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
        {/* Top Header - Compact single row */}
        <div className="px-3.5 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 truncate">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black shrink-0 ${
              isAdmin
                ? 'bg-rose-600 text-white'
                : isReferee
                ? 'bg-amber-400 text-slate-950'
                : 'bg-sky-600 text-white'
            }`}>
              {isAdmin ? (
                <ShieldAlert className="w-4 h-4" />
              ) : isReferee ? (
                <ShieldCheck className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
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
              title="Đóng cửa sổ"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Context Status Banners */}
        {/* Banner 1: Spectator / Viewer Mode Banner */}
        {isSpectator && (
          <div className="bg-sky-950/90 border-b border-sky-800/60 px-3.5 py-1.5 flex items-center justify-between text-[11px] shrink-0">
            <div className="flex items-center gap-2 text-sky-200 truncate">
              <Eye className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="truncate">
                <strong>Chế độ Khán giả (Xem tỷ số)</strong> • Tự động cập nhật trực tiếp từ Bàn Trọng Tài
              </span>
            </div>
            {onOpenRefereeLogin && (
              <button
                onClick={onOpenRefereeLogin}
                className="text-[10px] font-bold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1 shrink-0 transition-colors ml-2"
              >
                <KeyRound className="w-3 h-3" />
                <span>Trọng Tài Đăng Nhập</span>
              </button>
            )}
          </div>
        )}

        {/* Banner 2: Locked Completed Match for Referees (Requirement 2) */}
        {isLockedForReferee && (
          <div className="bg-amber-950/90 border-b border-amber-600/50 px-3.5 py-2 flex items-center justify-between text-xs shrink-0 text-amber-200">
            <div className="flex items-center gap-2 truncate">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">
                <strong>Trận đấu đã kết thúc & đã khóa tỷ số.</strong> Chỉ Ban tổ chức (Admin) mới có quyền thay đổi điểm.
              </span>
            </div>
            {onOpenAdminLogin && (
              <button
                onClick={onOpenAdminLogin}
                className="text-[11px] font-bold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 px-2.5 py-1 rounded border border-rose-500/40 flex items-center gap-1 shrink-0 transition-colors ml-2"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Admin Sửa Điểm</span>
              </button>
            )}
          </div>
        )}

        {/* Banner 3: Admin Editing Completed Match (Requirement 2) */}
        {isAdminEditingCompleted && (
          <div className="bg-rose-950/90 border-b border-rose-600/50 px-3.5 py-1.5 flex items-center justify-between text-xs shrink-0 text-rose-200">
            <div className="flex items-center gap-2 truncate">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="truncate">
                <strong>Quyền Quản Trị Viên (Admin)</strong>: Trận đã kết thúc. Bạn có quyền điều chỉnh điểm số.
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold uppercase font-mono">
              Admin Mode
            </span>
          </div>
        )}

        {/* Banner 4: Active Referee Live Broadcasting */}
        {canControl && !isCompleted && (
          <div className="bg-sky-950/80 border-b border-sky-800/40 px-3.5 py-1 flex items-center justify-between text-[11px] shrink-0">
            <div className="flex items-center gap-1.5 text-sky-200">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">Đang phát trực tiếp từng điểm lên <strong>Lịch thi đấu</strong></span>
            </div>
            <div className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 shrink-0">
              🔒 Quyền chấm: {refereeName || match.refereeName || 'Trọng tài'}
            </div>
          </div>
        )}

        {/* Pickleball Doubles Call Ribbon - Clear outdoor reference */}
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

          {canControl && (
            <button
              onClick={handleSideOut}
              className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 rounded-lg font-black text-[11px] transition-all shadow-2xs flex items-center gap-1 shrink-0"
            >
              <Zap className="w-3 h-3" />
              <span>Side Out</span>
            </button>
          )}

          {!canControl && (
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <span>Giao {serverNumber}</span>
              <span>·</span>
              <span>Đang {isCompleted ? 'Đã kết thúc' : 'Đang đấu'}</span>
            </div>
          )}
        </div>

        {/* Compact Match Point or Winner Alert Banner */}
        {(isMatchPointTeam1 || isMatchPointTeam2) && !hasWinner && !isCompleted && (
          <div className="bg-rose-600 text-white text-center py-1 px-2 font-black text-[10px] sm:text-xs uppercase tracking-wider animate-pulse shrink-0">
            {isMatchPointTeam1 && isMatchPointTeam2 ? (
              <span>★ ĐIỂM QUYẾT ĐỊNH (10 - 10) — ĐỘI NÀO GHI ĐIỂM TIẾP THEO SẼ THẮNG TRẬN (CHẠM 11) ★</span>
            ) : (
              <span>★ MATCH POINT — {isMatchPointTeam1 ? team1Name : team2Name} ĐANG CÓ ĐIỂM THẮNG TRẬN ★</span>
            )}
          </div>
        )}

        {isCompleted && (
          <div className="bg-emerald-600 text-white text-center py-1.5 px-3 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-inner shrink-0">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>KẾT QUẢ: {winner === 'team1' ? team1Name : team2Name} THẮNG ({score1} - {score2})</span>
          </div>
        )}

        {hasWinner && !isCompleted && (
          <div className="bg-emerald-600 text-white text-center py-1.5 px-3 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-inner shrink-0">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>ĐÃ CHẠM ĐIỂM THẮNG: {winner === 'team1' ? team1Name : team2Name} ({score1} - {score2})</span>
          </div>
        )}

        {/* Main 2-Column Split Court Layout */}
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
              const isMatchWinner = isCompleted && ((isT1 && score1 > score2) || (!isT1 && score2 > score1));

              return (
                <div
                  key={teamSlot}
                  className={`rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border-2 flex flex-col justify-between transition-all ${
                    isMatchWinner
                      ? 'bg-slate-900 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                      : isServing && !isCompleted
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
                      {isMatchWinner ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-400 text-slate-950 uppercase flex items-center gap-0.5">
                          <Trophy className="w-2.5 h-2.5" /> THẮNG
                        </span>
                      ) : isServing && !isCompleted ? (
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

                  {/* Score Display */}
                  <div className="my-auto py-2 text-center">
                    <div className={`font-mono text-5xl sm:text-7xl font-black tracking-tighter tabular-nums drop-shadow-md ${
                      isMatchWinner ? 'text-amber-300' : 'text-white'
                    }`}>
                      {score}
                    </div>
                    {isMatchWinner && (
                      <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mt-1">
                        Chiến Thắng
                      </div>
                    )}
                  </div>

                  {/* Dual Action Buttons for this Team - Only rendered when user has control */}
                  {canControl ? (
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
                          isAdminEditingCompleted
                            ? 'bg-rose-500 hover:bg-rose-400 text-white'
                            : isServing
                            ? 'bg-amber-400 hover:bg-amber-300'
                            : 'bg-emerald-400 hover:bg-emerald-300'
                        }`}
                      >
                        <Plus className="w-6 h-6 stroke-[3]" />
                        <span>+1 ĐIỂM</span>
                      </button>
                    </div>
                  ) : (
                    /* Read-only spectator/locked indicator */
                    <div className="pt-2 border-t border-slate-800/80 text-center">
                      <div className="text-[11px] text-slate-400 font-medium">
                        {isCompleted
                          ? 'Điểm chung cuộc'
                          : isServing
                          ? 'Đang có quyền giao bóng'
                          : 'Đang đỡ giao bóng'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Referee Action Strip - Only when user can control */}
          {canControl && (
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
          )}

          {canControl && showNotesInput && (
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

          {!canControl && refereeNotes && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 flex items-center gap-1.5 shrink-0">
              <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Ghi chú trận đấu: <strong className="text-white">{refereeNotes}</strong></span>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-3 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 font-bold text-xs"
          >
            Đóng
          </button>

          {/* If user is Admin editing completed match (Requirement 2) */}
          {isAdminEditingCompleted && (
            <button
              onClick={() => setShowAdminSaveConfirm(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>LƯU ĐIỂM ĐÃ SỬA (ADMIN)</span>
            </button>
          )}

          {/* If referee is scoring active/pending match (Requirement 3: "Kết thúc trận đấu") */}
          {canControl && !isCompleted && (
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
                <span>KẾT THÚC TRẬN ĐẤU</span>
              </button>
            </div>
          )}

          {/* If locked for referee (Requirement 2) */}
          {isLockedForReferee && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                Tỷ số đã khóa
              </span>
              {onOpenAdminLogin && (
                <button
                  onClick={onOpenAdminLogin}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Đăng nhập Admin
                </button>
              )}
            </div>
          )}

          {/* If spectator view (Requirement 1) */}
          {isSpectator && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-[11px] text-sky-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-semibold">Đang cập nhật trực tiếp</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog before finalizing match ("Kết thúc trận đấu" - Requirement 3) */}
      {showConfirmFinish && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full space-y-3.5 text-white shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Trophy className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-black">Xác nhận kết thúc trận đấu?</h4>
              <p className="text-xs text-slate-400 mt-1">
                Tỷ số chung cuộc:{' '}
                <span className="font-bold text-amber-300 font-mono text-sm">
                  {score1} - {score2}
                </span>
              </p>
              <p className="text-xs text-emerald-400 font-bold mt-1">
                Đội thắng: {score1 > score2 ? team1Name : team2Name}
              </p>
              <p className="text-[11px] text-amber-300/80 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2 mt-2 leading-relaxed">
                Sau khi kết thúc, tỷ số sẽ được khóa bảo mật. Trọng tài không thể chỉnh sửa lại, chỉ Ban tổ chức (Admin) mới có quyền thay đổi.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setShowConfirmFinish(false)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Chấm tiếp
              </button>
              <button
                onClick={handleConfirmFinish}
                className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs"
              >
                Xác Nhận Kết Thúc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Confirm Score Edit Dialog on Completed Match */}
      {showAdminSaveConfirm && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-rose-600 rounded-2xl p-5 max-w-sm w-full space-y-3.5 text-white shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-black text-white">Lưu sửa đổi điểm trận đấu?</h4>
              <p className="text-xs text-slate-400 mt-1">
                Tỷ số mới:{' '}
                <span className="font-bold text-amber-300 font-mono text-sm">
                  {score1} - {score2}
                </span>
              </p>
              <p className="text-xs text-emerald-400 font-bold mt-1">
                Đội thắng: {score1 > score2 ? team1Name : team2Name}
              </p>
              <p className="text-[11px] text-slate-300 mt-2">
                Dữ liệu mới sẽ được cập nhật ngay lập tức lên bảng xếp hạng và Supabase Cloud.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setShowAdminSaveConfirm(false)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                onClick={handleAdminSaveCompletedScore}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
