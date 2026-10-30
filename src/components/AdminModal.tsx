import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  Lock,
  LogOut,
  RotateCcw,
  Zap,
  CheckCircle2,
  Database,
  Layers,
  Flame,
  Trophy,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import {
  ScenarioType,
  SCENARIO_LIST,
  getFullCompletedScenario,
  getTiebreakScenario,
  getMidTournamentLiveScenario,
  getCleanResetScenario
} from '../data/mockScenarios';
import { Match } from '../types/tournament';
import { sounds } from '../lib/tournamentUtils';
import confetti from 'canvas-confetti';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onLogin: (pass: string) => boolean;
  onLogout: () => void;
  onResetTournament: () => Promise<{ success: boolean; message?: string } | void> | void;
  currentScenario: ScenarioType;
  onSelectScenario: (scenario: ScenarioType, newMatches: Match[]) => void;
  onOpenTestBench: () => void;
  onOpenSupabaseModal: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onLogin,
  onLogout,
  onResetTournament,
  currentScenario,
  onSelectScenario,
  onOpenTestBench,
  onOpenSupabaseModal,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setLoginError('Vui lòng nhập mật khẩu quản trị.');
      return;
    }

    const success = onLogin(passwordInput.trim());
    if (success) {
      setPasswordInput('');
      setLoginError('');
      sounds.playPoint();
    } else {
      setLoginError('Mật khẩu không chính xác. Vui lòng thử lại.');
      sounds.playHit();
    }
  };

  const handleExecuteReset = async () => {
    setIsResetting(true);
    sounds.playHit();
    try {
      const res = await onResetTournament();
      sounds.playFanfare();
      setIsConfirmingReset(false);
      if (res && typeof res === 'object' && 'success' in res && !res.success) {
        setResetSuccessMessage(`Đã reset về 0-0 trên trình duyệt! ${res.message ? `(${res.message})` : ''}`);
      } else {
        setResetSuccessMessage('Đã reset toàn bộ giải đấu về 0 - 0 và lưu thành công lên Supabase & Bộ nhớ máy! Khi refresh web dữ liệu vẫn được bảo toàn.');
      }
    } catch {
      setIsConfirmingReset(false);
      setResetSuccessMessage('Đã reset về 0-0 trên trình duyệt (LocalStorage).');
    } finally {
      setIsResetting(false);
      setTimeout(() => {
        setResetSuccessMessage('');
      }, 5000);
    }
  };

  const handleApplyScenario = (type: ScenarioType) => {
    sounds.playHit();
    let newMatches: Match[] = [];

    if (type === 'full_completed') {
      newMatches = getFullCompletedScenario();
      confetti({ particleCount: 50, spread: 50 });
      sounds.playFanfare();
    } else if (type === 'tiebreak_points') {
      newMatches = getTiebreakScenario();
    } else if (type === 'mid_tournament_live') {
      newMatches = getMidTournamentLiveScenario();
    } else if (type === 'clean_reset') {
      newMatches = getCleanResetScenario();
    }

    onSelectScenario(type, newMatches);
  };

  const getScenarioIcon = (id: ScenarioType) => {
    switch (id) {
      case 'full_completed':
        return <Trophy className="w-4 h-4 text-amber-500" />;
      case 'tiebreak_points':
        return <Layers className="w-4 h-4 text-indigo-500" />;
      case 'mid_tournament_live':
        return <Flame className="w-4 h-4 text-rose-500" />;
      case 'clean_reset':
        return <RefreshCw className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base sm:text-lg">
                  Khu Vực Quản Trị Viên & Ban Tổ Chức
                </h3>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase">
                    Đã đăng nhập
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {isAdmin
                  ? 'Quản lý dữ liệu giải đấu, reset trước giờ khai mạc và cấu hình thử nghiệm'
                  : 'Vui lòng xác thực tài khoản quản trị để truy cập dữ liệu test và cài đặt giải'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Success Notification Banner */}
          {resetSuccessMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{resetSuccessMessage}</span>
            </div>
          )}

          {!isAdmin ? (
            /* Login Form */
            <div className="max-w-md mx-auto py-4 space-y-5">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mx-auto mb-2 border border-sky-100">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-slate-900">
                  Xác Thực Ban Tổ Chức / Quản Trị
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Để bảo đảm tính minh bạch và tránh xáo trộn tỷ số thi đấu thật, công cụ đổi kịch bản test và reset dữ liệu chỉ dành riêng cho Admin BTC.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mật khẩu hoặc Mã PIN Quản trị
                  </label>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu quản trị..."
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setLoginError('');
                    }}
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all font-mono"
                  />
                  {loginError && (
                    <p className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{loginError}</span>
                    </p>
                  )}
                  <p className="mt-2 text-[11px] text-slate-400">
                    Gợi ý: Mật khẩu mặc định là <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono font-bold">admin123</code> hoặc <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono font-bold">bien2026</code>.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Đăng Nhập Quản Trị</span>
                </button>
              </form>
            </div>
          ) : (
            /* Logged In Admin Dashboard */
            <div className="space-y-6">
              {/* Top Admin Status & Logout */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Tài Khoản Quản Trị: <span className="text-emerald-700">Ban Tổ Chức Giải</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Toàn quyền reset dữ liệu, chuyển kịch bản test và cấu hình
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onLogout();
                    sounds.playHit();
                  }}
                  className="px-3 py-1.5 rounded-xl text-rose-700 hover:bg-rose-50 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng Xuất</span>
                </button>
              </div>

              {/* ACTION 1: RESET DATA FOR TOURNAMENT KICKOFF */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-50/70 via-amber-50/50 to-orange-50/70 border-2 border-rose-200 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-extrabold text-sm sm:text-base text-rose-950 flex items-center gap-2">
                      Reset Toàn Bộ Dữ Liệu Trước Khi Giải Bắt Đầu
                      <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 text-[10px] font-black uppercase">
                        Quan Trọng
                      </span>
                    </h4>
                    <p className="text-xs text-rose-900/80 leading-relaxed">
                      Sử dụng tính năng này vào sáng ngày <span className="font-bold text-rose-950">31/10/2026</span> trước khi thi đấu thật. Hệ thống sẽ xóa toàn bộ điểm số thử nghiệm, đưa tất cả các trận đấu về tỷ số <span className="font-bold">0 - 0</span>, làm mới bảng xếp hạng và mở khóa toàn bộ các sân thi đấu.
                    </p>
                  </div>
                </div>

                {!isConfirmingReset ? (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setIsConfirmingReset(true)}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset Dữ Liệu Về Ban Đầu (0 - 0)</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-rose-300 space-y-2.5 animate-fadeIn">
                    <p className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Bạn có chắc chắn muốn xóa toàn bộ kết quả test và đưa giải về 0 - 0 không?</span>
                    </p>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsConfirmingReset(false)}
                        disabled={isResetting}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        Hủy Bỏ
                      </button>
                      <button
                        type="button"
                        onClick={handleExecuteReset}
                        disabled={isResetting}
                        className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-sm transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-60"
                      >
                        {isResetting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Đang Lưu Lên Supabase...</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Đồng ý Reset Ngay</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION 2: TEST DATA & SCENARIO PICKER (Admin Only) */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-sky-600" />
                      <span>Dữ Liệu Thử Nghiệm & Kịch Bản Mẫu</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Khu vực thử nghiệm chỉ hiển thị khi đã đăng nhập Admin
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onOpenTestBench();
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Test 3 Trọng Tài Đồng Thời</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SCENARIO_LIST.map((sc) => {
                    const isActive = currentScenario === sc.id;
                    return (
                      <button
                        key={sc.id}
                        onClick={() => handleApplyScenario(sc.id)}
                        className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                          isActive
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-sky-400/50'
                            : 'bg-slate-50 hover:bg-white text-slate-800 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <div className="flex items-center gap-2">
                            {getScenarioIcon(sc.id)}
                            <span className="font-bold text-xs truncate">{sc.name}</span>
                          </div>
                          {isActive && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </div>
                        <p className={`text-[11px] leading-relaxed line-clamp-2 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                          {sc.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ACTION 3: SUPABASE CLOUD SYNC */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-700">Cơ Sở Dữ Liệu Đám Mây (Supabase)</span>
                </div>
                <button
                  onClick={() => {
                    onOpenSupabaseModal();
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                >
                  Cài Đặt Kết Nối Cloud
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
