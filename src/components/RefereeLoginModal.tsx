import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Users,
  Edit3,
  RotateCcw,
  Check,
  HelpCircle,
  Layers,
  Calendar,
  Smartphone
} from 'lucide-react';
import { TOURNAMENT_CONFIG, DEFAULT_REFEREES } from '../data/initialTournamentData';
import { RefereeAccount } from '../types/tournament';

interface RefereeLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRefereeMode: boolean;
  setIsRefereeMode: (val: boolean) => void;
  assignedCourt: string;
  setAssignedCourt: (court: string) => void;
  refereeName: string;
  setRefereeName: (name: string) => void;
  referees: RefereeAccount[];
  setReferees: React.Dispatch<React.SetStateAction<RefereeAccount[]>>;
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
  referees,
  setReferees,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isEditingReferees, setIsEditingReferees] = useState(false);
  const [tempReferees, setTempReferees] = useState<RefereeAccount[]>(referees);

  if (!isOpen) return null;

  const securePin = TOURNAMENT_CONFIG.refereePin || '1234';

  const handleActivateWithPin = () => {
    if (!pinInput.trim()) {
      setErrorMsg('Vui lòng nhập mã PIN bảo mật do Ban Tổ Chức cấp.');
      setSuccessMsg('');
      return;
    }

    if (pinInput.trim() === securePin) {
      setIsRefereeMode(true);
      setSuccessMsg('Đã xác thực và kích hoạt Chế Độ Trọng Tài thành công!');
      setErrorMsg('');
      setPinInput('');
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 700);
    } else {
      setErrorMsg('Mã PIN bảo mật không chính xác. Vui lòng kiểm tra lại.');
      setSuccessMsg('');
    }
  };

  const handleDeactivate = () => {
    setIsRefereeMode(false);
    onClose();
  };

  const handleSelectReferee = (ref: RefereeAccount) => {
    setRefereeName(ref.name);
    if (ref.court) {
      setAssignedCourt(ref.court);
    }
  };

  const handleStartEditing = () => {
    setTempReferees([...referees]);
    setIsEditingReferees(true);
  };

  const handleSaveRefereeEdits = () => {
    setReferees(tempReferees);
    setIsEditingReferees(false);
  };

  const handleResetToDefaultReferees = () => {
    setTempReferees(DEFAULT_REFEREES);
    setReferees(DEFAULT_REFEREES);
  };

  const handleUpdateRefereeField = (id: string, field: 'name' | 'court', val: string) => {
    setTempReferees((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight font-display uppercase">
                Tài Khoản & Chế Độ Trọng Tài
              </h3>
              <p className="text-xs text-slate-400">
                Chọn trọng tài phụ trách và phân quyền điều hành
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
        <div className="p-4 sm:p-6 space-y-5 text-xs sm:text-sm text-slate-700 overflow-y-auto">
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
                  Trạng Thái: {isRefereeMode ? 'ĐANG BẬT [Quyền Trọng Tài]' : 'ĐANG TẮT [Chế Độ Khán Giả]'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {isRefereeMode
                    ? 'Có thể chấm điểm trực tiếp, đổi lượt giao, đảo sân và xác nhận kết quả.'
                    : 'Nhập mã PIN bảo mật để bật quyền chấm điểm tránh khán giả bấm nhầm.'}
                </div>
              </div>
            </div>

            {isRefereeMode && (
              <button
                onClick={handleDeactivate}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 shrink-0 transition-colors"
              >
                Tắt Chế Độ
              </button>
            )}
          </div>

          {/* Section 1: PIN Authentication (No 1234 text shown!) */}
          {!isRefereeMode ? (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-sky-600" />
                1. Nhập Mã PIN Bảo Mật (Tránh Khán Giả Thao Tác)
              </h4>
              <p className="text-xs text-slate-500">
                Vui lòng nhập mã PIN bảo mật do Ban Tổ Chức cấp để kích hoạt quyền điều hành chấm điểm.
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPin ? 'text' : 'password'}
                    placeholder="Nhập mã PIN bảo mật"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleActivateWithPin()}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-sky-500 text-sm font-mono tracking-wider bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    title={showPin ? 'Ẩn ký tự' : 'Hiện ký tự'}
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={handleActivateWithPin}
                  className="py-2.5 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-colors shadow-xs whitespace-nowrap"
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
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Đã xác thực mã PIN bảo mật. Quyền trọng tài đang được kích hoạt đầy đủ.</span>
            </div>
          )}

          {/* Section 2: 3 Official Referee Accounts */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                2. Danh Sách 3 Tài Khoản Trọng Tài Chính Thức
              </h4>
              <button
                type="button"
                onClick={() => {
                  if (isEditingReferees) {
                    handleSaveRefereeEdits();
                  } else {
                    handleStartEditing();
                  }
                }}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
              >
                {isEditingReferees ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Lưu Thay Đổi</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Điều Chỉnh Tên / Sân</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Nhấn để chọn nhanh trọng tài đang trực tiếp điều hành trận đấu (hoặc chỉnh sửa tên theo thực tế ngày thi đấu):
            </p>

            {/* Editing mode for referee accounts */}
            {isEditingReferees ? (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-sky-300 space-y-3">
                <div className="text-xs font-bold text-sky-900 flex items-center justify-between">
                  <span>Chỉnh sửa thông tin 3 trọng tài theo thực tế:</span>
                  <button
                    type="button"
                    onClick={handleResetToDefaultReferees}
                    className="text-[11px] font-medium text-slate-500 hover:text-rose-600 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Khôi phục mặc định</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {tempReferees.map((ref, idx) => (
                    <div
                      key={ref.id}
                      className="p-2.5 bg-white rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                    >
                      <div className="sm:col-span-1 text-center font-bold text-xs text-slate-400">
                        #{idx + 1}
                      </div>
                      <div className="sm:col-span-6">
                        <label className="block text-[10px] text-slate-400 mb-0.5">Họ & Tên Trọng Tài</label>
                        <input
                          type="text"
                          value={ref.name}
                          onChange={(e) => handleUpdateRefereeField(ref.id, 'name', e.target.value)}
                          placeholder="Tên trọng tài..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-sky-500"
                        />
                      </div>
                      <div className="sm:col-span-5">
                        <label className="block text-[10px] text-slate-400 mb-0.5">Sân Phụ Trách</label>
                        <select
                          value={ref.court}
                          onChange={(e) => handleUpdateRefereeField(ref.id, 'court', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-hidden focus:border-sky-500 font-medium"
                        >
                          <option value="Sân 1">Sân 1</option>
                          <option value="Sân 2">Sân 2</option>
                          <option value="Sân 3">Sân 3</option>
                          <option value="Sân 4">Sân 4</option>
                          <option value="Tất cả">Tất cả</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingReferees(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveRefereeEdits}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-sky-600 text-white hover:bg-sky-500 shadow-xs"
                  >
                    Xác Nhận & Lưu
                  </button>
                </div>
              </div>
            ) : (
              /* Quick-Select Cards for 3 Referees */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {referees.map((ref) => {
                  const isSelected = refereeName === ref.name;
                  return (
                    <button
                      key={ref.id}
                      type="button"
                      onClick={() => handleSelectReferee(ref)}
                      className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-50 border-amber-400 shadow-xs ring-2 ring-amber-300'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="w-7 h-7 rounded-lg bg-slate-900 text-amber-300 flex items-center justify-center font-black text-xs">
                          {ref.name.charAt(0)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {ref.court}
                        </span>
                      </div>
                      <div>
                        <div className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                          {ref.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          {isSelected ? (
                            <span className="text-amber-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-amber-600" /> Đang chọn
                            </span>
                          ) : (
                            <span>Chạm để chọn</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: Fine-Tune Name & Court Assignment */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              3. Thông Tin Trọng Tài Đang Làm Nhiệm Vụ
            </h4>

            {/* Custom / Current Name input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                Tên Trọng Tài (sẽ in trong biên bản trận):
              </label>
              <input
                type="text"
                value={refereeName}
                onChange={(e) => setRefereeName(e.target.value)}
                placeholder="VD: Lê Văn Đông"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-sky-500 text-xs sm:text-sm font-semibold"
              />
            </div>

            {/* Court Assignment */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Sân Thi Đấu Trọng Tài Đang Trực:
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
          </div>

          {/* Guide */}
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
                <p>Bấm nút <strong>"Trọng Tài [BẬT]"</strong> trên thanh menu trên cùng.</p>
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
                <p>Trên điện thoại, bấm vào nút màu vàng <strong>"Chấm Nhanh"</strong> ở thanh cố định phía dưới màn hình.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
          <span className="text-xs text-slate-500 truncate">
            Đang trực: <strong className="text-slate-800">{refereeName}</strong> ({assignedCourt})
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-xs"
          >
            Hoàn Tất & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
