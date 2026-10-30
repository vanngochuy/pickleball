import React from 'react';
import { Award } from 'lucide-react';

export const SponsorsBar: React.FC = () => {
  const sponsors = [
    { name: 'TẬP ĐOÀN BIỂN', category: 'Chủ Trì', color: 'from-sky-700 to-blue-900' },
    { name: 'LÊ PHƯƠNG', category: 'Handmade', color: 'from-emerald-700 to-teal-900' },
    { name: 'TẤN TÙNG', category: 'Printing', color: 'from-amber-600 to-yellow-800' },
    { name: 'TIGER GOLD', category: 'Tài Trợ', color: 'from-orange-600 to-amber-900' },
    { name: 'MAY', category: 'Cafe', color: 'from-rose-600 to-red-900' },
    { name: 'BẠCH NGỌC', category: 'Đồng Hành', color: 'from-amber-500 to-yellow-700' },
    { name: 'NEGIN', category: 'Pickleball', color: 'from-slate-800 to-slate-950' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-2.5">
        <h4 className="text-[11px] sm:text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>ĐƠN VỊ ĐỒNG HÀNH & TÀI TRỢ</span>
        </h4>
        <span className="text-[10px] text-slate-400 font-mono">
          Giải Phong Trào Lần IV
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2">
        {sponsors.map((sp) => (
          <div
            key={sp.name}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-50/80 border border-slate-100 text-center"
          >
            <div
              className={`w-6 h-6 rounded-md bg-gradient-to-tr ${sp.color} text-white flex items-center justify-center font-black text-[10px] font-display mb-1`}
            >
              {sp.name.charAt(0)}
            </div>
            <div className="font-extrabold text-[10px] text-slate-900 leading-tight truncate w-full">
              {sp.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
