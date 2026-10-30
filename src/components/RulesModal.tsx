import React from 'react';
import { X, Award, Shield, CheckCircle, Info } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-sky-600" />
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
              Điều Lệ & Thể Thức Giải Pickleball Tập Đoàn Biển Lần IV
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-sky-600" />
              1. Thể Thức Thi Đấu Vòng Bảng
            </h4>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>15 cặp vận động viên chia thành 4 bảng: Bảng A (4 cặp), Bảng B (4 cặp), Bảng C (4 cặp), Bảng D (3 cặp).</li>
              <li>Thi đấu vòng tròn 1 lượt tính điểm trong từng bảng.</li>
              <li>
                Mỗi trận vòng bảng thi đấu <strong>1 set chạm 11 điểm — KHÔNG CẦN CÁCH 2</strong> (Đội nào ghi đủ 11 điểm trước sẽ giành chiến thắng ngay lập tức, ví dụ chạm điểm 11-10 là kết thúc trận đấu).
              </li>
              <li>Cách tính điểm: Thắng được <strong>2 điểm</strong>, Thua được <strong>0 điểm</strong>.</li>
              <li>Thứ hạng xác định lần lượt theo: Tổng điểm → Hiệu số điểm thắng/thua (+/-) → Tổng số điểm ghi được → Kết quả đối đầu trực tiếp.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              2. Tuyển Chọn & Phân Nhánh Vòng Knockout
            </h4>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Top 2 đội đứng đầu mỗi bảng</strong> (Nhất và Nhì các bảng A, B, C, D) giành quyền vào vòng Tứ Kết.</li>
              <li><strong>Tứ Kết & Bán Kết:</strong> Thi đấu 1 set chạm <strong>11 điểm (cách biệt 2 điểm)</strong>.</li>
              <li><strong>Tranh Hạng Ba:</strong> 2 đội thua ở Bán kết thi đấu 1 set chạm <strong>11 điểm (cách biệt 2 điểm)</strong>.</li>
              <li><strong>Chung Kết Cúp Vô Địch:</strong> 2 đội thắng ở Bán kết tranh Cúp Vô Địch thi đấu 1 set chạm <strong>15 điểm (cách biệt 2 điểm)</strong>.</li>
              <li><strong>Nhánh Đấu Tứ Kết:</strong>
                <div className="mt-1 font-mono text-xs text-sky-800 bg-sky-50 p-2.5 rounded-xl space-y-0.5 border border-sky-100">
                  <div>• Tứ kết 1: Nhất Bảng A vs Nhì Bảng B</div>
                  <div>• Tứ kết 2: Nhất Bảng C vs Nhì Bảng D</div>
                  <div>• Tứ kết 3: Nhất Bảng B vs Nhì Bảng A</div>
                  <div>• Tứ kết 4: Nhất Bảng D vs Nhì Bảng C</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-600" />
              3. Quy Định Cho Trọng Tài & Giao Bóng Đôi
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Tuân thủ luật Pickleball quốc tế (USA Pickleball): Giao bóng dưới thắt lưng, quy tắc 2 lần nảy bóng (Two-Bounce Rule), vùng bếp (Non-Volley Zone / Kitchen).</li>
              <li>Khẩu lệnh hô điểm của trọng tài: <strong>[Điểm giao] - [Điểm nhận] - [Lượt người giao 1 hoặc 2]</strong> (Ví dụ: 4 - 3 - 2).</li>
              <li>Trọng tài sử dụng chế độ "Chấm Điểm Trọng Tài" trên điện thoại hoặc máy tính bảng để cập nhật điểm trực tiếp theo từng pha bóng.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
          >
            Đã Hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
