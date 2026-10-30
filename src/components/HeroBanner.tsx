import React from 'react';
import { Calendar, MapPin, Sparkles } from 'lucide-react';
import { TOURNAMENT_CONFIG } from '../data/initialTournamentData';

export const HeroBanner: React.FC = () => {
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

      <div className="relative max-w-7xl mx-auto px-3.5 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Main Tournament Identity */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 font-black text-slate-950 text-[10px] uppercase tracking-wider shadow-2xs">
                <Sparkles className="w-3 h-3" />
                LẦN THỨ IV
              </span>
              <span className="text-xs text-sky-200 font-semibold truncate italic">
                “Giao lưu - Đoàn kết - Kết nối - Phát triển”
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white uppercase font-display leading-tight">
              GIẢI PICKLEBALL <span className="text-amber-300">TẬP ĐOÀN BIỂN</span>
            </h1>
          </div>

          {/* Compact Info Badges (Time & Location & Rule) */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-sky-100">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
              <Calendar className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="font-bold text-white">{TOURNAMENT_CONFIG.date}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 truncate">
              <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="font-semibold text-white truncate">{TOURNAMENT_CONFIG.location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
