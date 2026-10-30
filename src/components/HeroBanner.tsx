import React from 'react';
import { Calendar, MapPin, Sparkles, Volume2, VolumeX, Share2, Database, ShieldCheck, ShieldAlert, Lock } from 'lucide-react';
import { TOURNAMENT_CONFIG } from '../data/initialTournamentData';
import { sounds } from '../lib/tournamentUtils';
import { getSupabaseCredentials } from '../lib/supabase';

interface HeroBannerProps {
  soundEnabled?: boolean;
  setSoundEnabled?: (val: boolean) => void;
  onOpenShareModal?: () => void;
  onOpenSupabaseModal?: () => void;
  onOpenRefereeModal?: () => void;
  isRefereeMode?: boolean;
  isAdmin?: boolean;
  onOpenAdminModal?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  soundEnabled = true,
  setSoundEnabled,
  onOpenShareModal,
  onOpenSupabaseModal,
  onOpenRefereeModal,
  isRefereeMode = false,
  isAdmin = false,
  onOpenAdminModal,
}) => {
  const { url } = getSupabaseCredentials();
  const isCloudConnected = Boolean(url);

  const toggleSound = () => {
    if (!setSoundEnabled) return;
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setEnabled(next);
    if (next) sounds.playPoint();
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-sky-950 via-sky-900 to-cyan-950 text-white border-b border-sky-800/40">
      {/* Background Poster Visual with measured scrim for high contrast legibility */}
      <div className="absolute inset-0 opacity-20 mix-blend-luminosity overflow-hidden pointer-events-none">
        <img
          src="/assets/aistudio/2aOboR8bMxrM8SYdoBET32V8Aj70usBWVpA6qqA4_d3d4d82e.jpg"
          alt="Giải Pickleball Tập Đoàn Biển Lần IV"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Main Tournament Identity */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 font-black text-slate-950 text-[10px] uppercase tracking-wider shadow-2xs">
                <Sparkles className="w-3 h-3" />
                LẦN THỨ IV
              </span>
              <span className="text-xs text-sky-200 font-semibold truncate italic">
                “Giao lưu - Đoàn kết - Kết nối - Phát triển”
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase font-display leading-tight">
              GIẢI PICKLEBALL <span className="text-amber-300">TẬP ĐOÀN BIỂN</span>
            </h1>
          </div>

          {/* Badges & Quick Action Utilities */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-sky-100">
            {/* Date & Location */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
              <Calendar className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="font-bold text-white">{TOURNAMENT_CONFIG.date}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 truncate max-w-[200px] sm:max-w-none">
              <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="font-semibold text-white truncate">{TOURNAMENT_CONFIG.location}</span>
            </div>

            {/* Quick Tools Pill: Sound, Share, Supabase, Referee */}
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl p-0.5">
              {setSoundEnabled && (
                <button
                  onClick={toggleSound}
                  title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors"
                >
                  {soundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-slate-300" />
                  )}
                </button>
              )}

              {onOpenShareModal && (
                <button
                  onClick={onOpenShareModal}
                  title="Chia sẻ & Xuất dữ liệu"
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              )}

              {onOpenSupabaseModal && (
                <button
                  onClick={onOpenSupabaseModal}
                  title={isCloudConnected ? 'Supabase đã kết nối Cloud' : 'Cài đặt Supabase Cloud'}
                  className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold ${
                    isCloudConnected
                      ? 'text-emerald-300 hover:bg-emerald-500/20'
                      : 'text-white/80 hover:text-white hover:bg-white/15'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">
                    {isCloudConnected ? 'Cloud' : 'Lưu trữ'}
                  </span>
                  {isCloudConnected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                </button>
              )}

              {onOpenRefereeModal && (
                <button
                  onClick={onOpenRefereeModal}
                  title="Bàn Trọng Tài"
                  className={`flex items-center gap-1 px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    isRefereeMode
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">
                    {isRefereeMode ? 'Trọng Tài' : 'Trọng Tài'}
                  </span>
                </button>
              )}

              {onOpenAdminModal && (
                <button
                  onClick={onOpenAdminModal}
                  title="Khu Vực Quản Trị Viên / Ban Tổ Chức"
                  className={`flex items-center gap-1 px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    isAdmin
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-xs ring-1 ring-rose-300'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  {isAdmin ? <ShieldAlert className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">
                    {isAdmin ? 'Admin BTC' : 'Admin'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

