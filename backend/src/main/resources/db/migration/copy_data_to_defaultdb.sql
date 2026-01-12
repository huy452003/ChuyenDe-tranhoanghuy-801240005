-- Script copy toàn bộ data từ vestshop_db sang defaultdb
-- Chạy script này trong MySQL Workbench khi đã connect tới Aiven defaultdb

USE defaultdb;

-- ============================================
-- COPY DATA TỪNG BẢNG
-- ============================================

-- 1. Users
INSERT INTO users (user_id, username, password, email, phone, fullname, gender, birth, age, address, role, status)
SELECT user_id, username, password, email, phone, fullname, gender, birth, age, address, role, status
FROM vestshop_db.users
ON DUPLICATE KEY UPDATE
    username = VALUES(username),
    password = VALUES(password),
    email = VALUES(email),
    phone = VALUES(phone),
    fullname = VALUES(fullname),
    gender = VALUES(gender),
    birth = VALUES(birth),
    age = VALUES(age),
    address = VALUES(address),
    role = VALUES(role),
    status = VALUES(status);

-- 2. Products
INSERT INTO products (id, name, price, sale_price, category, description, stock, status, created_at, updated_at)
SELECT id, name, price, sale_price, category, description, stock, status, created_at, updated_at
FROM vestshop_db.products
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    price = VALUES(price),
    sale_price = VALUES(sale_price),
    category = VALUES(category),
    description = VALUES(description),
    stock = VALUES(stock),
    status = VALUES(status),
    updated_at = VALUES(updated_at);

-- 3. Product Images
INSERT INTO product_images (id, product_id, image_url)
SELECT id, product_id, image_url
FROM vestshop_db.product_images
ON DUPLICATE KEY UPDATE
    product_id = VALUES(product_id),
    image_url = VALUES(image_url);

-- 4. Product Details
INSERT INTO product_details (id, product_id, detail)
SELECT id, product_id, detail
FROM vestshop_db.product_details
ON DUPLICATE KEY UPDATE
    product_id = VALUES(product_id),
    detail = VALUES(detail);

-- 5. Orders
INSERT INTO orders (id, full_name, email, phone, address, city, district, ward, total_amount, payment_method, status, note, created_at, updated_at)
SELECT id, full_name, email, phone, address, city, district, ward, total_amount, payment_method, status, note, created_at, updated_at
FROM vestshop_db.orders
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    email = VALUES(email),
    phone = VALUES(phone),
    address = VALUES(address),
    city = VALUES(city),
    district = VALUES(district),
    ward = VALUES(ward),
    total_amount = VALUES(total_amount),
    payment_method = VALUES(payment_method),
    status = VALUES(status),
    note = VALUES(note),
    updated_at = VALUES(updated_at);

-- 6. Order Items
INSERT INTO order_items (id, order_id, product_id, size, quantity, price)
SELECT id, order_id, product_id, size, quantity, price
FROM vestshop_db.order_items
ON DUPLICATE KEY UPDATE
    order_id = VALUES(order_id),
    product_id = VALUES(product_id),
    size = VALUES(size),
    quantity = VALUES(quantity),
    price = VALUES(price);

-- 7. Contact Messages
INSERT INTO contact_messages (id, name, email, phone, subject, message, is_read, created_at)
SELECT id, name, email, phone, subject, message, is_read, created_at
FROM vestshop_db.contact_messages
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    email = VALUES(email),
    phone = VALUES(phone),
    subject = VALUES(subject),
    message = VALUES(message),
    is_read = VALUES(is_read);

-- 8. Reviews (nếu có)
INSERT INTO reviews (id, product_id, user_id, rating, comment, status, created_at, updated_at)
SELECT id, product_id, user_id, rating, comment, status, created_at, updated_at
FROM vestshop_db.reviews
ON DUPLICATE KEY UPDATE
    product_id = VALUES(product_id),
    user_id = VALUES(user_id),
    rating = VALUES(rating),
    comment = VALUES(comment),
    status = VALUES(status),
    updated_at = VALUES(updated_at);

-- ============================================
-- KIỂM TRA KẾT QUẢ
-- ============================================

SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Product Images', COUNT(*) FROM product_images
UNION ALL
SELECT 'Product Details', COUNT(*) FROM product_details
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Order Items', COUNT(*) FROM order_items
UNION ALL
SELECT 'Contact Messages', COUNT(*) FROM contact_messages
UNION ALL
SELECT 'Reviews', COUNT(*) FROM reviews;

