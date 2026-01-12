-- Script sửa cột detail từ VARCHAR(255) sang TEXT trong Aiven defaultdb
-- Chạy script này TRƯỚC KHI copy data

USE defaultdb;

-- Sửa cột detail trong product_details
ALTER TABLE product_details 
MODIFY COLUMN detail TEXT;

-- Kiểm tra kết quả
DESCRIBE product_details;

