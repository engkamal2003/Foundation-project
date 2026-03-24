-- =====================================================
-- Activity Log: سجل نشاطات المستخدمين
-- =====================================================

CREATE TABLE IF NOT EXISTS activity_log (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  username    TEXT NOT NULL,
  display_name TEXT NOT NULL,
  action      TEXT NOT NULL,  -- 'add' | 'edit' | 'delete' | 'login' | 'logout'
  panel_key   TEXT,           -- اللوحة المتأثرة (null للدخول/الخروج)
  record_id   TEXT,           -- معرّف السجل المتأثر
  details     TEXT,           -- تفاصيل إضافية (JSON)
  ip_address  TEXT,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_activity_user    ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_action  ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_panel   ON activity_log(panel_key);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);
