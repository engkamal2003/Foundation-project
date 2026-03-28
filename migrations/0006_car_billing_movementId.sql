-- إضافة عمود movementId لجدول car_billing (كان مخزناً في data JSON)
ALTER TABLE car_billing ADD COLUMN movementId TEXT;

-- ترحيل البيانات الموجودة من data JSON
UPDATE car_billing
SET movementId = json_extract(data, '$.movementId')
WHERE movementId IS NULL AND json_extract(data, '$.movementId') IS NOT NULL;

-- فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_car_billing_movementId ON car_billing(movementId);
