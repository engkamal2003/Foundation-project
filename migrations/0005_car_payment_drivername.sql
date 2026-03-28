-- إضافة عمود driverName لجدول car_payment_cashbox
ALTER TABLE car_payment_cashbox ADD COLUMN driverName TEXT;

-- ترحيل البيانات القديمة من data JSON
UPDATE car_payment_cashbox
SET driverName = json_extract(data, '$.driverName')
WHERE driverName IS NULL AND json_extract(data, '$.driverName') IS NOT NULL;
