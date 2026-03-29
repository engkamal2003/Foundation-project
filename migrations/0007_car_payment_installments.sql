-- جدول الدفعات الجزئية لحركات السيارات
-- كل سجل = دفعة واحدة مستقلة مرتبطة بـ billingId
CREATE TABLE IF NOT EXISTS car_payment_installments (
  id          TEXT PRIMARY KEY,
  seq         INTEGER,
  code        TEXT,
  billingId   TEXT NOT NULL,
  movementId  TEXT,
  payDate     TEXT,
  paidAmount  REAL DEFAULT 0,
  paidBy      TEXT,
  notes       TEXT,
  data        TEXT,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_installments_billingId  ON car_payment_installments(billingId);
CREATE INDEX IF NOT EXISTS idx_installments_movementId ON car_payment_installments(movementId);
CREATE INDEX IF NOT EXISTS idx_installments_seq        ON car_payment_installments(seq);
