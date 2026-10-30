import React from 'react';
import { Trophy, ShieldCheck, Database, Volume2, VolumeX, Share2 } from 'lucide-react';
import { sounds } from '../lib/tournamentUtils';
import { getSupabaseCredentials } from '../lib/supabase';

interface HeaderProps {
  isRefereeMode: boolean;
  onOpenRefereeModal: () => void;
  onOpenSupabaseModal: () => void;
  onOpenShareModal: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isRefereeMode,
  onOpenRefereeModal,
  onOpenSupabaseModal,
  onOpenShareModal,
  soundEnabled,
  setSoundEnabled,
}) => {
  const { url } = getSupabaseCredentials();
  const isCloudConnected = Boolean(url);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setEnabled(next);
    if (next) sounds.playPoint();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 flex items-center justify-between gap-3 h-13 sm:h-14">
        {/* Brand Wordmark (No redundant nav links here) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-amber-400 p-0.5 shadow-2xs flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-amber-300">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight whitespace-nowrap">
              PICKLEBALL BIỂN
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-black bg-amber-400 text-slate-950 rounded-md uppercase tracking-wider">
              LẦN IV
            </span>
          </div>
        </div>

        {/* Action Utilities */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-sky-600" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Share */}
          <button
            onClick={onOpenShareModal}
            title="Chia sẻ & Thông tin"
            className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Supabase Status Button */}
          <button
            onClick={onOpenSupabaseModal}
            title={isCloudConnected ? 'Supabase đã kết nối' : 'Cài đặt Supabase Cloud'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              isCloudConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isCloudConnected ? 'Supabase' : 'Lưu trữ'}
            </span>
          </button>

          {/* Referee Mode Toggle / Modal Trigger */}
          <button
            onClick={onOpenRefereeModal}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-2xs ${
              isRefereeMode
                ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 ring-2 ring-amber-300'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">
              {isRefereeMode ? 'Trọng Tài [BẬT]' : 'Trọng Tài'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
