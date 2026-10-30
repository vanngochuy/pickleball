-- ==========================================================
-- GIẢI PICKLEBALL PHONG TRÀO LẦN THỨ IV - TẬP ĐOÀN BIỂN
-- Database Schema for Supabase (PostgreSQL)
-- Domain: pickleball-tapdoanbien.bbm.io.vn
-- ==========================================================

-- 1. Bảng lưu trữ Cấu hình giải đấu
CREATE TABLE IF NOT EXISTS tournament_settings (
  id TEXT PRIMARY KEY DEFAULT 'current_tournament',
  title TEXT NOT NULL DEFAULT 'GIẢI PICKLEBALL PHONG TRÀO LẦN THỨ IV - TẬP ĐOÀN BIỂN',
  subtitle TEXT DEFAULT 'Giao lưu - Đoàn kết - Kết nối - Phát triển',
  event_date TEXT DEFAULT '8h00 | 31/10/2026',
  location TEXT DEFAULT 'Sân Terra Cafe & Pickleball',
  referee_pin TEXT DEFAULT '1234',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Bảng lưu trữ Danh sách Đội / VĐV (Teams)
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL, -- 'A', 'B', 'C', 'D'
  code TEXT NOT NULL,      -- 'A1', 'A2', 'B1', etc.
  name TEXT NOT NULL,      -- 'Lâm - Ngọc', 'Tín - Anh Đài', etc.
  player1 TEXT NOT NULL,
  player2 TEXT NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Bảng lưu trữ Trận đấu (Matches)
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  stage TEXT NOT NULL,        -- 'group', 'quarter', 'semi', 'third_place', 'final'
  group_id TEXT,              -- 'A', 'B', 'C', 'D' (nếu là vòng bảng)
  round_name TEXT NOT NULL,   -- 'Lượt 1', 'Tứ kết 1', 'Chung kết'
  match_number INT,
  team1_id TEXT NOT NULL,
  team2_id TEXT NOT NULL,
  score1 INT DEFAULT 0,
  score2 INT DEFAULT 0,
  sets_won1 INT DEFAULT 0,
  sets_won2 INT DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'live', 'completed'
  winner_id TEXT,
  court TEXT DEFAULT 'Sân 1',
  start_time TEXT,
  server_number INT DEFAULT 1, -- 1 or 2 (pickleball doubles serving)
  serving_team_id TEXT,
  history JSONB DEFAULT '[]'::jsonb,
  referee_notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bật Row Level Security (RLS) và cho phép Đọc/Ghi công khai để giải đấu chạy mượt mà
ALTER TABLE tournament_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access tournament_settings" ON tournament_settings FOR SELECT USING (true);
CREATE POLICY "Allow public write access tournament_settings" ON tournament_settings FOR ALL USING (true);

CREATE POLICY "Allow public read access teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public write access teams" ON teams FOR ALL USING (true);

CREATE POLICY "Allow public read access matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Allow public write access matches" ON matches FOR ALL USING (true);

-- Realtime publication (cho phép cập nhật tỉ số trực tiếp tức thì qua Supabase Realtime)
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE matches, teams, tournament_settings;
COMMIT;
