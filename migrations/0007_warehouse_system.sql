-- =====================================================
-- Warehouse Management System Tables
-- نظام إدارة المخازن
-- =====================================================

-- تحديث جدول المخازن: إضافة حقل النوع
ALTER TABLE warehouses ADD COLUMN type TEXT DEFAULT 'عام';
ALTER TABLE warehouses ADD COLUMN phone TEXT;
ALTER TABLE warehouses ADD COLUMN capacity TEXT;

-- أماكن التخزين داخل المخازن
CREATE TABLE IF NOT EXISTS warehouse_locations (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  warehouse TEXT,
  name TEXT,
  notes TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_warehouse_locations_warehouse ON warehouse_locations(warehouse);

-- أصناف المخزن
CREATE TABLE IF NOT EXISTS stock_items (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  name TEXT,
  name_en TEXT,
  brand TEXT,
  manufacturer TEXT,
  origin TEXT,
  category TEXT,
  unit_main TEXT,
  unit2_name TEXT,
  unit2_qty REAL DEFAULT 1,
  unit3_name TEXT,
  unit3_qty REAL DEFAULT 1,
  notes TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_stock_items_name ON stock_items(name);
CREATE INDEX IF NOT EXISTS idx_stock_items_category ON stock_items(category);

-- حركة وارد (إدخال المخزن)
CREATE TABLE IF NOT EXISTS stock_in (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  item_name TEXT,
  brand TEXT,
  batch_no TEXT,
  qty REAL,
  unit TEXT,
  production_date TEXT,
  expiry_date TEXT,
  warehouse TEXT,
  location TEXT,
  ref_no TEXT,
  notes TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_stock_in_item ON stock_in(item_name);
CREATE INDEX IF NOT EXISTS idx_stock_in_warehouse ON stock_in(warehouse);
CREATE INDEX IF NOT EXISTS idx_stock_in_expiry ON stock_in(expiry_date);

-- حركة صادر (إخراج من المخزن)
CREATE TABLE IF NOT EXISTS stock_out (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  item_name TEXT,
  brand TEXT,
  batch_no TEXT,
  qty REAL,
  unit TEXT,
  warehouse TEXT,
  location TEXT,
  ref_no TEXT,
  notes TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_stock_out_item ON stock_out(item_name);
CREATE INDEX IF NOT EXISTS idx_stock_out_warehouse ON stock_out(warehouse);

-- تحويل داخلي بين المخازن
CREATE TABLE IF NOT EXISTS stock_transfer (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  item_name TEXT,
  brand TEXT,
  batch_no TEXT,
  qty REAL,
  unit TEXT,
  production_date TEXT,
  expiry_date TEXT,
  from_warehouse TEXT,
  to_warehouse TEXT,
  notes TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_stock_transfer_item ON stock_transfer(item_name);

-- سجل التالف والمفقود
CREATE TABLE IF NOT EXISTS stock_damaged (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  item_name TEXT,
  brand TEXT,
  batch_no TEXT,
  qty REAL,
  unit TEXT,
  warehouse TEXT,
  damage_reason TEXT,
  responsible TEXT,
  notes TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_stock_damaged_item ON stock_damaged(item_name);
CREATE INDEX IF NOT EXISTS idx_stock_damaged_warehouse ON stock_damaged(warehouse);
