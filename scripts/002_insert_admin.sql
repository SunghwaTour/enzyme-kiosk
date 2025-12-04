-- 관리자 회원 등록
INSERT INTO members (phone_number, name)
VALUES ('010-1234-5678', '관리자')
ON CONFLICT (phone_number) DO NOTHING;

-- 관리자에게 9999회 이용권 부여
INSERT INTO purchase_history (
  member_id,
  phone_number,
  name,
  pass_type,
  purchase_count,
  remaining_count,
  is_active
)
SELECT 
  id,
  '010-1234-5678',
  '관리자',
  '특별이용권',
  9999,
  9999,
  true
FROM members
WHERE phone_number = '010-1234-5678'
ON CONFLICT DO NOTHING;
