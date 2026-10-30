import React from 'react';
import { Award, Sparkles } from 'lucide-react';

export interface SponsorItem {
  name: string;
  role: string;
  logo: string;
  highlight?: boolean;
}

export const OFFICIAL_SPONSORS: SponsorItem[] = [
  {
    name: 'TẬP ĐOÀN BIỂN',
    role: 'Đơn Vị Chủ Trì',
    logo: '/assets/aistudio/2aobor92wlxltcwppegzxagybiyptogxf5ov90vm1_41c82d00.jpg',
    highlight: true,
  },
  {
    name: 'NEGIN PICKLEBALL',
    role: 'Vợt & Bóng Thi Đấu',
    logo: '/assets/aistudio/2aobor92wmagdwjyqxpqgtijgnqmtoatub7kq0jg4_6c784983.jpg',
    highlight: true,
  },
  {
    name: 'TIGER GOLD',
    role: 'Nhà Tài Trợ Vàng',
    logo: '/assets/aistudio/2aobor92wm4baamnpmloqeyz3pcre2wesbqd465y3_3082135b.jpg',
  },
  {
    name: 'MÂY CAFE',
    role: 'Đồng Hành Đồ Uống',
    logo: '/assets/aistudio/2aobor92wm2zqtlflqvyoppa7xji8gpldptznaqo2_be7fcf7d.jpg',
  },
  {
    name: 'LÊ PHƯƠNG',
    role: 'Handmade Gift',
    logo: '/assets/aistudio/2aobor92wmbcbeuevwo0wzotexdb7nubur5ontj65_16ccffdb.jpg',
  },
  {
    name: 'TẤN TÙNG',
    role: 'Quảng Cáo & In Ấn',
    logo: '/assets/aistudio/2aobor92wmienlog8ysiuboxzgdyhc8ebfwv7c5w6_2328d749.jpg',
  },
  {
    name: 'BẠCH NGỌC',
    role: 'Đơn Vị Đồng Hành',
    logo: '/assets/aistudio/2aobor92wmo9mndkc3f35na4fvjpsllqjlzpdc3s7_65f664dc.jpg',
  },
];

export const SponsorsBar: React.FC = () => {
  return (
    <section className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
              <span>ĐƠN VỊ ĐỒNG HÀNH & NHÀ TÀI TRỢ CHÍNH THỨC</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Giải Pickleball Tập Đoàn Biển Lần Thứ IV · Terra Cafe & Pickleball
            </p>
          </div>
        </div>

        <span className="self-start sm:self-auto inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/70 px-2.5 py-1 rounded-full">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Đồng Hành Cùng Giải Đấu
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
        {OFFICIAL_SPONSORS.map((sp) => (
          <div
            key={sp.name}
            className={`group flex flex-col items-center justify-between p-2.5 rounded-2xl border transition-all duration-200 ${
              sp.highlight
                ? 'bg-gradient-to-b from-amber-50/40 via-white to-white border-amber-200 hover:border-amber-400 hover:shadow-md'
                : 'bg-white hover:bg-slate-50/50 border-slate-200/80 hover:border-sky-300 hover:shadow-sm'
            }`}
          >
            {/* Logo Image Box */}
            <div className="w-full aspect-square max-h-24 sm:max-h-28 rounded-xl bg-white border border-slate-100 flex items-center justify-center p-2 overflow-hidden shadow-2xs group-hover:scale-102 transition-transform duration-200">
              <img
                src={sp.logo}
                alt={sp.name}
                className="max-h-full max-w-full object-contain object-center rounded-lg"
                loading="lazy"
              />
            </div>

            {/* Sponsor Text & Role */}
            <div className="mt-2 text-center w-full space-y-0.5">
              <div className="font-extrabold text-[11px] sm:text-xs text-slate-900 leading-tight truncate w-full group-hover:text-sky-700 transition-colors">
                {sp.name}
              </div>
              <div className="text-[10px] font-bold text-slate-500 bg-slate-100/90 px-1.5 py-0.5 rounded-md truncate w-full">
                {sp.role}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
