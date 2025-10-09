-- 1. สร้าง database ชื่อ dbo1
CREATE DATABASE dbo1;
GO

-- 2. เลือกใช้ database dbo1
USE dbo1;
GO

-- 3. สร้างตาราง users
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) NOT NULL,
    email NVARCHAR(100),
    full_name NVARCHAR(100)
);
GO

-- 4. เพิ่ม admin user
INSERT INTO users (username, password, role, email, full_name)
VALUES ('admin', 'admin1234', 'admin', 'admin1@email.com', 'Admin One');
GO