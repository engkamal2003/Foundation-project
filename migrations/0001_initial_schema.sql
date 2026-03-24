-- =====================================================
-- Foundation Project - D1 Database Schema
-- =====================================================

-- جدول عام لتخزين بيانات كل لوحة (نهج مرن)
-- كل سجل يُخزَّن كـ JSON في حقل data
CREATE TABLE IF NOT EXISTS panel_records (
  id          TEXT PRIMARY KEY,
  panel_key   TEXT NOT NULL,
  seq         INTEGER,
  code        TEXT,
  data        TEXT NOT NULL DEFAULT '{}',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_panel_records_panel_key ON panel_records(panel_key);
CREATE INDEX IF NOT EXISTS idx_panel_records_seq ON panel_records(panel_key, seq);
CREATE INDEX IF NOT EXISTS idx_panel_records_code ON panel_records(panel_key, code);

-- =====================================================
-- جداول متخصصة للوحات الرئيسية
-- =====================================================

-- المانحون
CREATE TABLE IF NOT EXISTS donors (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  name TEXT, nameEn TEXT, country TEXT, phone TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_donors_name ON donors(name);

-- الوحدات
CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  name TEXT, type TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- السائقون
CREATE TABLE IF NOT EXISTS drivers (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  driverName TEXT, driverId TEXT, phone TEXT, driverType TEXT, residenceArea TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_drivers_name ON drivers(driverName);

-- الشاحنات
CREATE TABLE IF NOT EXISTS trucks (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  headNo TEXT, headOwner TEXT, headLicense TEXT,
  trailerNo TEXT, trailerOwner TEXT, trailerLicense TEXT,
  tailNo TEXT, tailOwner TEXT, tailLicense TEXT,
  driverName TEXT, ownership TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- السيارات
CREATE TABLE IF NOT EXISTS cars (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  carNo TEXT, carType TEXT, carOwnerName TEXT, driverName TEXT, ownership TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_cars_carNo ON cars(carNo);

-- المشرفون
CREATE TABLE IF NOT EXISTS supervisors (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  name TEXT, phone TEXT, area TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- المنفذون
CREATE TABLE IF NOT EXISTS executors (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  name TEXT, role TEXT, phone TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- المستودعات
CREATE TABLE IF NOT EXISTS warehouses (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  name TEXT, location TEXT, manager TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- الجمعيات
CREATE TABLE IF NOT EXISTS associations (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  main TEXT, sub TEXT, country TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- المقاولون
CREATE TABLE IF NOT EXISTS contractors (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  companyName TEXT, companyPhone TEXT, ownerName TEXT, service TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- الموردون
CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  name TEXT, companyNo TEXT, category TEXT, phone TEXT,
  address TEXT, beneficiaryName TEXT, iban TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- الاعتمادات
CREATE TABLE IF NOT EXISTS credits (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  creditNo TEXT UNIQUE, creditType TEXT, creditCategory TEXT,
  date TEXT, donorName TEXT, projectName TEXT, projectLocation TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_credits_creditNo ON credits(creditNo);

-- الأصناف
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  itemName TEXT, itemCategory TEXT, defaultUnit TEXT, weightPerUnit REAL,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- القوافل
CREATE TABLE IF NOT EXISTS convoys (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  convoyNo TEXT, carType TEXT, headNo TEXT, trailerNo TEXT,
  driverName TEXT, driverId TEXT, driverPhone TEXT,
  contractor TEXT, creditNo TEXT, donorName TEXT,
  itemName TEXT, unit TEXT, palletCount INTEGER, qtyPerPallet REAL, totalQty REAL,
  loadWeightKg REAL, arrivalDate TEXT, loadDate TEXT, departureDate TEXT,
  actualEntryDate TEXT, unloadDate TEXT, loadLocation TEXT,
  banner TEXT, mediaLink TEXT, allocation TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_convoys_convoyNo ON convoys(convoyNo);
CREATE INDEX IF NOT EXISTS idx_convoys_creditNo ON convoys(creditNo);

-- احتساب القوافل
CREATE TABLE IF NOT EXISTS convoy_calc (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  convoyNo TEXT, calcDate TEXT, days REAL, amount REAL,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- احتساب البليتات
CREATE TABLE IF NOT EXISTS pallet_calc (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  date TEXT, warehouse TEXT, palletsIn INTEGER, palletsOut INTEGER,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- أصناف الشاحنات
CREATE TABLE IF NOT EXISTS truck_items (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  convoyNo TEXT, headNo TEXT, itemName TEXT, qty REAL, unit TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- الصندوق
CREATE TABLE IF NOT EXISTS cashbox (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  expenseDate TEXT, payDate TEXT, spenderName TEXT, cashboxName TEXT,
  statement TEXT, amount REAL, creditNo TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_cashbox_creditNo ON cashbox(creditNo);

-- حركات السيارات
CREATE TABLE IF NOT EXISTS car_movements (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  movementNo TEXT, requestDate TEXT, activityDate TEXT, day TEXT,
  entrySystem TEXT, transport TEXT, carNo TEXT, tourismCompany TEXT,
  driverName TEXT, beneficiary TEXT, beneficiaryName TEXT,
  place TEXT, activity TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_car_movements_movementNo ON car_movements(movementNo);
CREATE INDEX IF NOT EXISTS idx_car_movements_activityDate ON car_movements(activityDate);

-- احتساب أجرة السيارات
CREATE TABLE IF NOT EXISTS car_billing (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  activityDate TEXT, accountingDate TEXT,
  movementNo TEXT, driverName TEXT, transport TEXT, ownership TEXT,
  accountingParty TEXT, beneficiaryName TEXT,
  fare REAL, busCount INTEGER, subtotal REAL,
  extraAmount REAL, extraAmountNote TEXT,
  discountAmount REAL, discountNote TEXT,
  total REAL, calcStatus TEXT, creditNo TEXT, entryNo TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_car_billing_movementNo ON car_billing(movementNo);
CREATE INDEX IF NOT EXISTS idx_car_billing_entryNo ON car_billing(entryNo);
CREATE INDEX IF NOT EXISTS idx_car_billing_accountingParty ON car_billing(accountingParty);

-- أسعار السيارات
CREATE TABLE IF NOT EXISTS car_rates (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  carType TEXT, driverName TEXT,
  fullDayRate REAL, halfDayRate REAL, quickMissionRate REAL,
  partialNearRate REAL, partialFarRate REAL, extraRate REAL,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- أسعار الشاحنات
CREATE TABLE IF NOT EXISTS truck_rates (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  truckType TEXT, transportType TEXT, destination TEXT,
  naulonRate REAL, driverExpenses REAL, scaleExpenses REAL, otherExpenses REAL,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- احتساب الشاحنات
CREATE TABLE IF NOT EXISTS convoy_billing (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  accountingStatus TEXT, convoyBillingNo TEXT, accountingDate TEXT,
  headNo TEXT, truckType TEXT, driverName TEXT, ownership TEXT,
  truckAccountingParty TEXT, transportType TEXT, destination TEXT,
  naulon REAL, driverExpenses REAL, scaleExpenses REAL, otherExpenses REAL,
  subtotal REAL, extraAmount REAL, discountAmount REAL, total REAL,
  paidAmount REAL, amount REAL, payDate TEXT,
  beneficiary TEXT, beneficiaryName TEXT, delegation TEXT,
  creditNo TEXT, statement TEXT, notes TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- القيود المستحقة
CREATE TABLE IF NOT EXISTS combined_entries (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  entryNo TEXT UNIQUE, entryCreatedAt TEXT, entryType TEXT,
  accountingParty TEXT, beneficiaryName TEXT, transport TEXT,
  movementNos TEXT, recordCount INTEGER, totalAmount REAL,
  mergedStatement TEXT, creditNo2 TEXT, notes TEXT,
  _groupKey TEXT, _isSingle INTEGER DEFAULT 0,
  _isCustomGroup INTEGER DEFAULT 0,
  _billingId TEXT, movementId TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_combined_entries_entryNo ON combined_entries(entryNo);
CREATE INDEX IF NOT EXISTS idx_combined_entries_groupKey ON combined_entries(_groupKey);

-- صندوق دفع حركات السيارات
CREATE TABLE IF NOT EXISTS car_payment_cashbox (
  id TEXT PRIMARY KEY, seq INTEGER, code TEXT,
  accountingStatus TEXT, payDate TEXT, movementNo TEXT,
  accountingParty TEXT, beneficiaryName TEXT, transport TEXT,
  totalAmount REAL, paidAmount REAL, paidAmountBefore REAL,
  remainingAmount REAL, paymentType TEXT, paidBy TEXT,
  periodFromDate TEXT, periodFromDay TEXT, periodToDate TEXT, periodToDay TEXT,
  statement TEXT, creditNo2 TEXT, referenceNo TEXT, notes TEXT,
  data TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_car_payment_movementNo ON car_payment_cashbox(movementNo);
CREATE INDEX IF NOT EXISTS idx_car_payment_referenceNo ON car_payment_cashbox(referenceNo);
