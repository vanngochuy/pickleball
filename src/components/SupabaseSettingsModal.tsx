import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Globe,
  ExternalLink,
  Code
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  clearSupabaseCredentials,
  testSupabaseConnection,
  syncAllMatchesToSupabase,
  fetchMatchesFromSupabase
} from '../lib/supabase';
import { Match } from '../types/tournament';

interface SupabaseSettingsModalProps {
  onClose: () => void;
  matches: Match[];
  onMatchesUpdated: (matches: Match[]) => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({
  onClose,
  matches,
  onMatchesUpdated,
}) => {
  const currentCreds = getSupabaseCredentials();
  const [url, setUrl] = useState(currentCreds.url);
  const [anonKey, setAnonKey] = useState(currentCreds.anonKey);
  const [activeTab, setActiveTab] = useState<'config' | 'sql' | 'vercel'>('config');

  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const sqlSchemaText = `-- Tạo bảng matches và cấu hình Supabase
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  stage TEXT NOT NULL,
  group_id TEXT,
  round_name TEXT NOT NULL,
  match_number INT,
  court TEXT DEFAULT 'Sân 1',
  start_time TEXT,
  team1_id TEXT NOT NULL,
  team2_id TEXT NOT NULL,
  score1 INT DEFAULT 0,
  score2 INT DEFAULT 0,
  status TEXT DEFAULT 'pending',
  winner_id TEXT,
  server_number INT DEFAULT 1,
  serving_team_id TEXT,
  history JSONB DEFAULT '[]'::jsonb,
  referee_notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read/Write Matches" ON matches FOR ALL USING (true);`;

  const handleTestConnection = async () => {
    if (!url || !anonKey) {
      setStatusMessage({ text: 'Vui lòng nhập đầy đủ Supabase URL và Anon Public Key.', isError: true });
      return;
    }
    setTesting(true);
    setStatusMessage(null);
    const res = await testSupabaseConnection(url, anonKey);
    setTesting(false);
    setStatusMessage({ text: res.message, isError: !res.success });
  };

  const handleSaveAndSync = async () => {
    if (!url || !anonKey) {
      clearSupabaseCredentials();
      setStatusMessage({ text: 'Đã xoá cấu hình Supabase. Ứng dụng hiện lưu trữ cục bộ (LocalStorage).' });
      return;
    }
    saveSupabaseCredentials(url, anonKey);
    setSyncing(true);
    const ok = await syncAllMatchesToSupabase(matches);
    setSyncing(false);
    if (ok) {
      setStatusMessage({ text: 'Đã lưu cấu hình và đồng bộ tất cả trận đấu lên Supabase thành công!' });
    } else {
      setStatusMessage({ text: 'Đã lưu cấu hình nhưng chưa đồng bộ được bảng. Hãy đảm bảo bạn đã tạo bảng matches theo tab SQL.', isError: true });
    }
  };

  const handlePullFromSupabase = async () => {
    setSyncing(true);
    const data = await fetchMatchesFromSupabase();
    setSyncing(false);
    if (data && data.length > 0) {
      onMatchesUpdated(data);
      setStatusMessage({ text: `Đã tải về thành công ${data.length} trận đấu từ Supabase!` });
    } else {
      setStatusMessage({ text: 'Chưa có dữ liệu trận đấu nào trên Supabase hoặc kết nối thất bại.', isError: true });
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchemaText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Cấu Hình Supabase & Deploy Vercel
              </h3>
              <p className="text-xs text-slate-500">
                Đồng bộ cơ sở dữ liệu thời gian thực và triển khai web
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-2 px-3 rounded-lg transition-colors text-center ${
              activeTab === 'config' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            1. Kết Nối Supabase
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex-1 py-2 px-3 rounded-lg transition-colors text-center ${
              activeTab === 'sql' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            2. SQL Schema
          </button>
          <button
            onClick={() => setActiveTab('vercel')}
            className={`flex-1 py-2 px-3 rounded-lg transition-colors text-center ${
              activeTab === 'vercel' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            3. Deploy Vercel & Domain
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 text-xs leading-relaxed">
                <span className="font-bold">Mặc định:</span> Ứng dụng luôn tự động lưu trữ trên LocalStorage của trình duyệt. Khi bạn điền Supabase URL & Anon Key, ứng dụng sẽ đồng bộ tức thì lên đám mây và hỗ trợ nhiều máy trọng tài cùng chấm điểm realtime!
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project URL (VITE_SUPABASE_URL)
                </label>
                <input
                  type="text"
                  placeholder="https://your-project.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Anon Public Key (VITE_SUPABASE_ANON_KEY)
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-sky-500 font-mono"
                />
              </div>

              {statusMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    statusMessage.isError
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {statusMessage.isError ? (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>Kiểm tra kết nối</span>
                </button>

                <button
                  onClick={handleSaveAndSync}
                  disabled={syncing}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Lưu & Đồng bộ lên Cloud</span>
                </button>

                <button
                  onClick={handlePullFromSupabase}
                  disabled={syncing}
                  className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  <span>Tải dữ liệu từ Supabase về</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Dán đoạn mã này vào mục <span className="font-bold text-slate-800">SQL Editor</span> trong Supabase Dashboard để tạo bảng:
                </p>
                <button
                  onClick={handleCopySql}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Đã sao chép' : 'Sao chép SQL'}</span>
                </button>
              </div>

              <pre className="p-3.5 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed">
                {sqlSchemaText}
              </pre>

              <p className="text-[11px] text-slate-500">
                Gợi ý: Tệp đầy đủ <span className="font-mono">supabase-schema.sql</span> đã có sẵn ở thư mục gốc của dự án.
              </p>
            </div>
          )}

          {activeTab === 'vercel' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-sky-600" />
                  Cấu hình Tên miền: <span className="font-mono text-sky-700">pickleball-tapdoanbien.bbm.io.vn</span>
                </h4>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-600">
                  <li>
                    Vào dự án trên <strong>Vercel</strong> → Chọn <strong>Settings</strong> → <strong>Domains</strong>.
                  </li>
                  <li>
                    Nhập tên miền <strong>pickleball-tapdoanbien.bbm.io.vn</strong> và nhấn <strong>Add</strong>.
                  </li>
                  <li>
                    Trỏ bản ghi CNAME tại nhà cung cấp DNS của tên miền <code className="bg-slate-200 px-1 rounded">bbm.io.vn</code> về <code className="bg-slate-200 px-1 rounded">cname.vercel-dns.com</code>.
                  </li>
                </ol>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-sm text-slate-900">
                  Biến Môi Trường Trên Vercel (Environment Variables)
                </h4>
                <p className="text-slate-600">
                  Trong mục <strong>Settings → Environment Variables</strong> của Vercel, bạn thêm 2 biến:
                </p>
                <div className="font-mono bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                  <div>VITE_SUPABASE_URL = "https://your-project.supabase.co"</div>
                  <div>VITE_SUPABASE_ANON_KEY = "eyJhbGciOi..."</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
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
