-- Migration: Change product_details.detail column from VARCHAR(255) to TEXT
-- This allows storing longer product detail descriptions

ALTER TABLE product_details 
MODIFY COLUMN detail TEXT;

