-- เลือกใช้ฐานข้อมูล dbo1 ก่อน (ถ้ายังไม่ได้เลือก)
USE dbo1;
GO

-- แก้ไขชนิดข้อมูลของคอลัมน์ที่มีปัญหา (ทำทีละคอลัมน์)
ALTER TABLE repair_request
ALTER COLUMN description NVARCHAR(255); -- หรือ NVARCHAR(MAX) ถ้าต้องการเก็บข้อความยาวมากๆ

ALTER TABLE repair_request
ALTER COLUMN title NVARCHAR(255);

ALTER TABLE repair_request
ALTER COLUMN status NVARCHAR(100);

ALTER TABLE repair_request
ALTER COLUMN technician NVARCHAR(255);

ALTER TABLE repair_request
ALTER COLUMN priority NVARCHAR(100);

ALTER TABLE repair_request
ALTER COLUMN location NVARCHAR(100);
GO