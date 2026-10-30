import React, { useState } from 'react';
import { X, Copy, Check, Globe, Share2, Printer, QrCode } from 'lucide-react';
import { TOURNAMENT_CONFIG } from '../data/initialTournamentData';

interface ShareExportModalProps {
  onClose: () => void;
}

export const ShareExportModal: React.FC<ShareExportModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const domainUrl = `https://${TOURNAMENT_CONFIG.domain}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(domainUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-sky-600" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Chia Sẻ & Tên Miền Giải Đấu
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-center">
          {/* Domain box */}
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-sky-600 text-white flex items-center justify-center mx-auto shadow-sm">
              <Globe className="w-6 h-6" />
            </div>
            <div className="text-xs text-sky-800 font-semibold uppercase tracking-wider">
              Địa Chỉ Website Chính Thức
            </div>
            <div className="font-mono font-bold text-base text-slate-900 break-all select-all">
              {domainUrl}
            </div>

            <button
              onClick={handleCopy}
              className="mt-2 w-full py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã sao chép liên kết!' : 'Sao chép đường dẫn'}</span>
            </button>
          </div>

          {/* Quick instructions */}
          <div className="text-left text-xs text-slate-500 space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-700">Thông tin giải đấu:</div>
            <div>• Sự kiện: Giải Pickleball Tập Đoàn Biển Lần IV</div>
            <div>• Thời gian: 8h00 ngày 31/10/2026</div>
            <div>• Địa điểm: Sân Terra Cafe & Pickleball</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" /> In Bảng Đấu
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
