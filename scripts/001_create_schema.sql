-- 회원 테이블
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 이용권 구매 이력 테이블
CREATE TABLE IF NOT EXISTS purchase_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  name TEXT,
  pass_type TEXT NOT NULL CHECK (pass_type IN ('1회', '10회')),
  purchase_count INTEGER NOT NULL DEFAULT 1,
  remaining_count INTEGER NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 입실 기록 테이블
CREATE TABLE IF NOT EXISTS entry_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL,
  name TEXT,
  pass_type TEXT NOT NULL,
  entry_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone_number);
CREATE INDEX IF NOT EXISTS idx_purchase_history_member ON purchase_history(member_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_phone ON purchase_history(phone_number);
CREATE INDEX IF NOT EXISTS idx_entry_logs_phone ON entry_logs(phone_number);
CREATE INDEX IF NOT EXISTS idx_entry_logs_entry_time ON entry_logs(entry_time DESC);

-- RLS 활성화
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_logs ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기/쓰기 가능하도록 설정 (키오스크는 비회원도 사용 가능)
CREATE POLICY "Allow public read access on members" ON members FOR SELECT USING (true);
CREATE POLICY "Allow public insert on members" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on members" ON members FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on purchase_history" ON purchase_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert on purchase_history" ON purchase_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on purchase_history" ON purchase_history FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on entry_logs" ON entry_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on entry_logs" ON entry_logs FOR INSERT WITH CHECK (true);
