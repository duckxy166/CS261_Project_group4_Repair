-- 1. สร้าง database dbo1 (ถ้ามีอยู่แล้วจะไม่ error)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'dbo1')
BEGIN
    CREATE DATABASE dbo1;
END
GO

-- 2. เลือกใช้ database dbo1
USE dbo1;
GO

-- 3. ถ้ามีตาราง users อยู่แล้ว ให้ลบทิ้งก่อน (กัน error)
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.users;
END
GO

-- 4. สร้างตาราง users
CREATE TABLE dbo.users (
    id BIGINT IDENTITY(1,1) PRIMARY KEY, 
    username NVARCHAR(255) NOT NULL UNIQUE, 
    password NVARCHAR(255) NULL,
    role NVARCHAR(20) NOT NULL,
    email NVARCHAR(100),
    full_name NVARCHAR(100)
);
GO

-- 5. ใส่ข้อมูล admin user เริ่มต้น
INSERT INTO dbo.users (username, password, role, email, full_name)
VALUES ('admin', 'admin1234', 'admin', 'admin1@email.com', 'Admin One');
GO

INSERT INTO dbo.users (username, password, role, email, full_name)
VALUES ('tech', 'tech1234', 'tech', 'technician@email.com', 'Technician One');
GO