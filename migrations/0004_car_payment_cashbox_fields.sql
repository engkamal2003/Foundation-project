-- إضافة الأعمدة المفقودة لجدول car_payment_cashbox
ALTER TABLE car_payment_cashbox ADD COLUMN _billingId TEXT;
ALTER TABLE car_payment_cashbox ADD COLUMN movementId TEXT;
ALTER TABLE car_payment_cashbox ADD COLUMN totalPaidAfter REAL;

-- ترحيل البيانات القديمة من حقل data (JSON) إلى الأعمدة الجديدة
-- استخراج _billingId من data JSON إذا كانت الأعمدة فارغة
UPDATE car_payment_cashbox
SET _billingId = json_extract(data, '$._billingId')
WHERE _billingId IS NULL AND json_extract(data, '$._billingId') IS NOT NULL;

-- استخراج movementId من data JSON
UPDATE car_payment_cashbox
SET movementId = json_extract(data, '$.movementId')
WHERE movementId IS NULL AND json_extract(data, '$.movementId') IS NOT NULL;

-- استخراج totalPaidAfter من data JSON
UPDATE car_payment_cashbox
SET totalPaidAfter = CAST(json_extract(data, '$.totalPaidAfter') AS REAL)
WHERE totalPaidAfter IS NULL AND json_extract(data, '$.totalPaidAfter') IS NOT NULL;

-- فهارس لتحسين أداء البحث
CREATE INDEX IF NOT EXISTS idx_car_payment_billingId ON car_payment_cashbox(_billingId);
CREATE INDEX IF NOT EXISTS idx_car_payment_movementId ON car_payment_cashbox(movementId);
