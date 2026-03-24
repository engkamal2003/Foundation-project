-- =====================================================
-- Auth Tables: users + sessions
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  username    TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'user',  -- 'admin' | 'user'
  is_active   INTEGER NOT NULL DEFAULT 1,
  -- صلاحيات اللوحات: JSON array of allowed panel keys, null = all
  allowed_panels TEXT DEFAULT NULL,
  -- صلاحيات الإجراءات
  can_add     INTEGER NOT NULL DEFAULT 1,
  can_edit    INTEGER NOT NULL DEFAULT 1,
  can_delete  INTEGER NOT NULL DEFAULT 0,
  can_export  INTEGER NOT NULL DEFAULT 1,
  can_import  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  expires_at  TEXT NOT NULL,
  created_at  TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- ── المدير الافتراضي: admin / admin123 ──────────────────────────
-- كلمة المرور: admin123 (SHA-256 hash)
INSERT OR IGNORE INTO users (id, username, display_name, password_hash, role, can_delete, can_import)
VALUES (
  'admin-default-001',
  'admin',
  'مدير النظام',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  'admin',
  1,
  1
);
