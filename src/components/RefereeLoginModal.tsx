import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Smartphone,
  Calendar,
  Layers
} from 'lucide-react';
import { TOURNAMENT_CONFIG } from '../data/initialTournamentData';

interface RefereeLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRefereeMode: boolean;
  setIsRefereeMode: (val: boolean) => void;
  assignedCourt: string;
  setAssignedCourt: (court: string) => void;
  refereeName: string;
  setRefereeName: (name: string) => void;
}

export const RefereeLoginModal: React.FC<RefereeLoginModalProps> = ({
  isOpen,
  onClose,
  isRefereeMode,
  setIsRefereeMode,
  assignedCourt,
  setAssignedCourt,
  refereeName,
  setRefereeName,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const defaultPin = TOURNAMENT_CONFIG.refereePin || '1234';

  const handleActivateWithPin = () => {
    if (pinInput.trim() === defaultPin || pinInput.trim() === '1234' || pinInput.trim() === '') {
      setIsRefereeMode(true);
      setSuccessMsg('Đã kích hoạt Chế Độ Trọng Tài thành công!');
      setErrorMsg('');
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 700);
    } else {
      setErrorMsg('Mã PIN không đúng (Mặc định là 1234 hoặc để trống để thử nghiệm).');
      setSuccessMsg('');
    }
  };

  const handleDeactivate = () => {
    setIsRefereeMode(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight font-display uppercase">
                Cài Đặt & Kích Hoạt Chế Độ Trọng Tài
              </h3>
              <p className="text-xs text-slate-400">
                Phân quyền chấm điểm và chọn sân phụ trách
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 text-xs sm:text-sm text-slate-700">
          {/* Status Box */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
              isRefereeMode
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                  isRefereeMode
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {isRefereeMode ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <div>
                <div className="font-bold text-sm">
                  Trạng Thái Hiện Tại: {isRefereeMode ? 'ĐANG BẬT [Quyền Trọng Tài]' : 'ĐANG TẮT [Chế Độ Khán Giả]'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {isRefereeMode
                    ? 'Bạn có thể chấm điểm trực tiếp, đổi lượt giao và xác nhận kết quả.'
                    : 'Khán giả chỉ xem kết quả, tránh bấm nhầm làm thay đổi điểm số.'}
                </div>
              </div>
            </div>

            {isRefereeMode && (
              <button
                onClick={handleDeactivate}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 shrink-0"
              >
                Tắt Chế Độ
              </button>
            )}
          </div>

          {/* Form for Referee Setup */}
          <div className="space-y-4 pt-1">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-sky-600" />
              1. Mã PIN Bảo Mật (Tránh Khán Giả Thao Tác)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div className="sm:col-span-2">
                <input
                  type="password"
                  placeholder="Nhập mã PIN (Mặc định: 1234)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-sky-500 text-sm font-mono"
                />
              </div>
              <button
                onClick={handleActivateWithPin}
                className="w-full py-2 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-colors shadow-xs"
              >
                Kích Hoạt Ngay
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-1.5 border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-1.5 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Court Assignment */}
            <div className="pt-2 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                2. Phân Công Sân Trọng Tài Phụ Trách:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {['Tất cả', 'Sân 1', 'Sân 2', 'Sân 3', 'Sân 4'].map((court) => (
                  <button
                    key={court}
                    type="button"
                    onClick={() => setAssignedCourt(court)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center ${
                      assignedCourt === court
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {court}
                  </button>
                ))}
              </div>
            </div>

            {/* Referee Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                3. Tên Trọng Tài (Hiển thị trong biên bản):
              </label>
              <input
                type="text"
                placeholder="VD: Trọng tài Nguyễn Văn Huy"
                value={refereeName}
                onChange={(e) => setRefereeName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-sky-500 text-xs"
              />
            </div>
          </div>

          {/* Guide: All the different ways to enter Referee Mode */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <h5 className="font-bold text-xs uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-sky-600" />
              CÁC CÁCH VÀO CHẤM ĐIỂM TRỌNG TÀI TRÊN WEB:
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-sky-600" /> Cách 1: Nút Ở Góc Phải
                </div>
                <p>Bấm nút màu đen/vàng <strong>"Bật Chế Độ Trọng Tài"</strong> trên thanh menu trên cùng.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Cách 2: Vào Trực Tiếp Trận
                </div>
                <p>Trong tab <strong>Lịch Thi Đấu</strong> hoặc <strong>Bảng Đấu</strong>, bấm nút <strong>"Chấm điểm"</strong> ở bất kỳ trận nào.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-amber-600" /> Cách 3: Nút Nổi Điện Thoại
                </div>
                <p>Trên điện thoại, bấm vào nút màu vàng <strong>"Chấm Điểm"</strong> ở thanh cố định phía dưới màn hình.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            Đóng Hộp Thoại
          </button>
        </div>
      </div>
    </div>
  );
};
