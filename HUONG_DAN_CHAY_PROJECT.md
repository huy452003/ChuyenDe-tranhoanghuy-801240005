# 🚀 HƯỚNG DẪN CHẠY PROJECT - VEST SHOP

**Sinh viên**: Trần Hoàng Huy  
**MSSV**: 801240005  
**Môn học**: Chuyên đề  
**Năm học**: 2024-2025

---

## ✅ YÊU CẦU HỆ THỐNG

### Bắt Buộc:
1. ✅ **Java 17+** (JDK 17 hoặc cao hơn)
2. ✅ **Maven 3.6+** (hoặc sử dụng Maven built-in trong IntelliJ IDEA)
3. ✅ **MySQL 8.0+** (đã cài đặt và đang chạy)
4. ✅ **Browser** (Chrome, Firefox, Edge, Safari...)

### Không Cần:
- ❌ **Node.js** - Frontend đã được build sẵn
- ❌ **npm/yarn** - Không cần cài đặt dependencies

---

## 🎯 CÁCH CHẠY (3 BƯỚC ĐƠN GIẢN)

### Bước 1: Chuẩn Bị Database

#### 1.1. Khởi động MySQL
- Đảm bảo MySQL Server đang chạy
- Windows: Kiểm tra trong **Services** → MySQL → Start (nếu chưa chạy)

#### 1.2. Import Database

**Cách 1: Sử dụng MySQL Workbench (Khuyến nghị)**

1. Mở **MySQL Workbench**
2. Kết nối đến MySQL server
3. **File** → **Run SQL Script** (hoặc `Ctrl + Shift + O`)
4. Chọn file SQL export (ví dụ: `vestshop_db.sql`)
5. Click **Run** để import

**Cách 2: Sử dụng Command Line**

```bash
# Windows (Command Prompt)
mysql -u root -p < vestshop_db.sql

# Linux/Mac
mysql -u root -p < vestshop_db.sql
```

**Lưu ý**: 
- File SQL export đã bao gồm cả cấu trúc bảng (CREATE TABLE) và dữ liệu mẫu
- Sau khi import, database `vestshop_db` sẽ được tạo tự động với đầy đủ dữ liệu

#### 1.3. Kiểm Tra Database (Tùy chọn)

Sau khi import, kiểm tra xem đã thành công chưa:

```sql
USE vestshop_db;
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM products;
```

#### 1.4. Cấu Hình Database Connection (Nếu Cần)

Nếu username/password MySQL khác `root/huy12345`, vui lòng sửa file:

**File**: `backend/src/main/resources/application.properties`

```properties
# Dòng 8-10: Thay đổi username và password
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:huy12345}
```

**Hoặc** set environment variables:
- `DB_USERNAME=your_username`
- `DB_PASSWORD=your_password`

---

### Bước 2: Chạy Backend

#### Cách 1: Command Line (Khuyến Nghị)

Mở **Terminal/Command Prompt** và chạy:

```bash
# Di chuyển vào thư mục backend
cd backend

# Chạy Spring Boot application
mvn spring-boot:run
```

**Lưu ý**: Lần đầu chạy, Maven sẽ download dependencies (có thể mất vài phút).

#### Cách 2: IntelliJ IDEA

1. Mở IntelliJ IDEA
2. **File** → **Open** → Chọn folder `backend`
3. Đợi IntelliJ index và download dependencies
4. Tìm file `VestShopApplication.java` trong:
   - `backend/src/main/java/com/vestshop/VestShopApplication.java`
5. **Right-click** vào file → **Run 'VestShopApplication'**

#### Cách 3: Eclipse/NetBeans

1. Import project như Maven project
2. Run `VestShopApplication.java` như Java Application

#### Kết Quả Thành Công

Khi backend chạy thành công, bạn sẽ thấy:

```
========================================
Vest Shop Backend is running!
API: http://localhost:9090
========================================
```

**Lưu ý**: Backend chạy trên port **9090** (không phải 8080).

---

### Bước 3: Truy Cập Website

Mở **browser** và truy cập:

**🌐 http://localhost:9090**

Spring Boot sẽ tự động serve frontend từ thư mục `backend/src/main/resources/static/`!

---

## 📱 CÁC TRANG CHÍNH

### Phần Khách Hàng:
- **Trang chủ**: http://localhost:9090
- **Sản phẩm**: http://localhost:9090/products
- **Chi tiết sản phẩm**: http://localhost:9090/products/{id}
- **Giỏ hàng**: http://localhost:9090/cart
- **Thanh toán**: http://localhost:9090/checkout
- **Giới thiệu**: http://localhost:9090/about
- **Liên hệ**: http://localhost:9090/contact
- **Đăng nhập**: http://localhost:9090/login
- **Đăng ký**: http://localhost:9090/register

### Phần Admin:
- **Admin Dashboard**: http://localhost:9090/admin
- **Quản lý sản phẩm**: http://localhost:9090/admin/products
- **Quản lý đơn hàng**: http://localhost:9090/admin/orders
- **Quản lý người dùng**: http://localhost:9090/admin/users
- **Quản lý đánh giá**: http://localhost:9090/admin/reviews
- **Tin nhắn liên hệ**: http://localhost:9090/admin/contact

### API Backend:
- **API Base URL**: http://localhost:9090/api
- **Health Check**: http://localhost:9090/api/health

---

## 🗂️ CẤU TRÚC PROJECT

```
ChuyenDe-tranhoanghuy-801240005/
├── backend/                          # Spring Boot Backend
│   ├── src/
│   │   └── main/
│   │       ├── java/                  # Source code Java
│   │       │   └── com/vestshop/
│   │       │       ├── config/       # Configuration
│   │       │       ├── controller/   # REST Controllers
│   │       │       ├── entity/       # JPA Entities
│   │       │       ├── repository/  # JPA Repositories
│   │       │       ├── services/    # Business Logic
│   │       │       ├── models/      # DTOs
│   │       │       └── ...
│   │       └── resources/
│   │           ├── application.properties  # Config
│   │           └── static/          # ✅ Frontend đã build
│   ├── pom.xml                       # Maven dependencies
│   └── README.md
│
├── frontend/                         # React Frontend (Source)
│   ├── src/                          # Source code React
│   ├── dist/                         # ✅ Built files (copy vào backend/static)
│   └── package.json
│
├── README.md                         # Tổng quan dự án
└── HUONG_DAN_CHAY_PROJECT.md         # File này
```

**Quan trọng**: 
- Frontend đã được build sẵn trong `backend/src/main/resources/static/`
- Không cần chạy `npm install` hay `npm run build`

---

## ✨ TÍNH NĂNG CHÍNH

### 👥 Phần Khách Hàng:
- ✅ Trang chủ với hero section
- ✅ Danh sách sản phẩm với **phân trang** (8 sản phẩm/trang)
- ✅ **Filter** theo danh mục, khoảng giá
- ✅ **Sort** theo tên, giá
- ✅ Chi tiết sản phẩm với gallery ảnh
- ✅ Giỏ hàng (LocalStorage)
- ✅ Form thanh toán đầy đủ
- ✅ Xem đánh giá sản phẩm
- ✅ Responsive: Mobile, Tablet, Desktop
- ✅ Trang giới thiệu & liên hệ

### 👨‍💼 Phần Admin:
- ✅ **Authentication** với JWT Token
- ✅ Dashboard với thống kê
- ✅ Quản lý sản phẩm (CRUD) với **phân trang** (10/trang)
- ✅ **Filter & Sort** sản phẩm (tên, trạng thái, giá, tồn kho)
- ✅ Quản lý đơn hàng với **phân trang** và **filter chi tiết**
- ✅ Cập nhật trạng thái đơn hàng
- ✅ Quản lý người dùng với **phân trang** và **filter**
- ✅ Quản lý đánh giá (duyệt/từ chối)
- ✅ Quản lý tin nhắn liên hệ
- ✅ Quản lý profile và đổi mật khẩu
- ✅ UI riêng biệt cho admin

### 🔧 Backend:
- ✅ REST API structure hoàn chỉnh
- ✅ JWT Authentication & Authorization
- ✅ JPA Entities với relationships
- ✅ Repository layer với custom queries
- ✅ Service layer với business logic
- ✅ Global Exception Handler
- ✅ MySQL database với Hibernate
- ✅ CORS configuration
- ✅ Serve static files tự động
- ✅ **Pagination** với Spring Data JPA
- ✅ **Dynamic filtering** với Specification

---

## 🗄️ DATABASE

### Import Database từ File SQL

Project đã kèm theo **file SQL export** (`vestshop_db.sql` hoặc tên tương tự) chứa:
- ✅ Cấu trúc database (CREATE TABLE)
- ✅ Dữ liệu mẫu (INSERT)
- ✅ Các bảng: users, products, orders, reviews, contact_messages, v.v.

### Các Bảng Chính

1. **users** - Thông tin người dùng
2. **products** - Thông tin sản phẩm
3. **product_images** - Hình ảnh sản phẩm
4. **product_details** - Chi tiết sản phẩm
5. **orders** - Đơn hàng
6. **order_items** - Chi tiết đơn hàng
7. **reviews** - Đánh giá sản phẩm
8. **contact_messages** - Tin nhắn liên hệ

### Xem Tables Trong MySQL

```sql
USE vestshop_db;
SHOW TABLES;

-- Xem cấu trúc bảng
DESCRIBE users;
DESCRIBE products;
DESCRIBE orders;

-- Xem dữ liệu mẫu
SELECT * FROM users LIMIT 5;
SELECT * FROM products LIMIT 5;
```

### Cấu Hình DDL

File `application.properties`:
```properties
spring.jpa.hibernate.ddl-auto=update
```

- `update`: Tự động update tables nếu có thay đổi trong Entities
- **Lưu ý**: Vì đã import SQL, Hibernate sẽ chỉ update nếu có thay đổi, không tạo mới

---

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### ❌ Lỗi: Port 9090 đã được sử dụng

**Triệu chứng**:
```
Port 9090 is already in use
```

**Giải pháp**:
1. Tắt ứng dụng đang dùng port 9090
2. Hoặc đổi port trong `application.properties`:
   ```properties
   server.port=9091
   ```
3. Sau đó truy cập: http://localhost:9091

### ❌ Lỗi: Cannot connect to MySQL

**Triệu chứng**:
```
Communications link failure
Access denied for user 'root'@'localhost'
```

**Giải pháp**:
1. **Kiểm tra MySQL đã chạy chưa**:
   - Windows: Services → MySQL → Start
   - Linux/Mac: `sudo systemctl start mysql` hoặc `brew services start mysql`

2. **Kiểm tra username/password**:
   - Sửa trong `application.properties` hoặc set environment variables

3. **Tạo database**:
   ```sql
   CREATE DATABASE vestshop_db;
   ```

4. **Kiểm tra quyền truy cập**:
   ```sql
   GRANT ALL PRIVILEGES ON vestshop_db.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   ```

### ❌ Lỗi: Maven command not found

**Triệu chứng**:
```
'mvn' is not recognized as an internal or external command
```

**Giải pháp**:
- **Cách 1**: Sử dụng IntelliJ IDEA (đã có Maven built-in)
  - Right-click `VestShopApplication.java` → Run

- **Cách 2**: Cài đặt Maven
  - Download từ: https://maven.apache.org/download.cgi
  - Thêm vào PATH environment variable

### ❌ Lỗi: Java version không đúng

**Triệu chứng**:
```
Unsupported class file major version
```

**Giải pháp**:
- Cài đặt Java 17 hoặc cao hơn
- Kiểm tra version: `java -version`
- Set JAVA_HOME environment variable

### ❌ Lỗi: Frontend không hiển thị

**Triệu chứng**: Trang trắng hoặc 404

**Giải pháp**:
1. Kiểm tra backend đã chạy chưa
2. Kiểm tra console browser (F12) xem có lỗi không
3. Đảm bảo truy cập đúng URL: http://localhost:9090

### ❌ Lỗi: JWT Token invalid

**Triệu chứng**: 401 Unauthorized

**Giải pháp**:
1. Đăng nhập lại để lấy token mới
2. Kiểm tra token trong localStorage (F12 → Application → Local Storage)

---

## 🎓 CÔNG NGHỆ SỬ DỤNG

### Frontend:
- **React 18.2** - UI Library
- **React Router 6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool
- **Axios** - HTTP client
- **Context API** - State management

### Backend:
- **Spring Boot 3.2.1** - Java framework
- **Spring Security** - Authentication & Authorization
- **Spring Data JPA** - ORM layer
- **JWT (jjwt 0.12.6)** - Token-based authentication
- **MySQL 8.0** - Relational database
- **Hibernate** - JPA implementation
- **Lombok** - Code generation
- **ModelMapper** - Entity ↔ DTO conversion
- **Maven** - Build tool

---

## 📊 SƠ ĐỒ HOẠT ĐỘNG

```
Browser (http://localhost:9090)
    ↓
Spring Boot Backend
    ├─→ Serve Static Files (frontend/dist/)
    │   └─→ React App
    │
    └─→ REST API (/api/*)
        ├─→ JwtAuthFilter (validate token)
        ├─→ SecurityConfig (authorization)
        ├─→ Controller (handle request)
        ├─→ Service (business logic)
        ├─→ Repository (data access)
        └─→ MySQL Database
```

---

## 🔐 TÀI KHOẢN MẶC ĐỊNH

### Tạo Tài Khoản Admin

Sau khi chạy backend, đăng ký tài khoản đầu tiên, sau đó:

1. Vào MySQL và update role:
```sql
USE vestshop_db;
UPDATE users SET role = 'ADMIN' WHERE username = 'your_username';
```

2. Hoặc đăng ký tài khoản mới và update role trong database

### Test Accounts

Có thể tạo test accounts thông qua:
- **Đăng ký**: http://localhost:9090/register
- **Đăng nhập**: http://localhost:9090/login

---

## 💡 LƯU Ý QUAN TRỌNG

1. **Frontend đã build sẵn** trong `backend/src/main/resources/static/`
   → KHÔNG CẦN Node.js khi chạy!

2. **Backend tự động serve frontend**
   → Chỉ cần chạy backend!

3. **Database đã có file SQL export**
   → Chỉ cần import file SQL là xong!

4. **Port mặc định**: 9090 (không phải 8080)

5. **JWT Token**: 
   - Access token: 1 giờ
   - Refresh token: 7 ngày

6. **Responsive hoàn chỉnh**
   → Test trên mobile/tablet/desktop!

---

## 🧪 KIỂM TRA HỆ THỐNG

### 1. Kiểm Tra Backend

```bash
# Health check
curl http://localhost:9090/api/health

# Hoặc mở browser:
http://localhost:9090/api/health
```

### 2. Kiểm Tra Database

```sql
USE vestshop_db;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM orders;
```

### 3. Kiểm Tra Frontend

- Mở http://localhost:9090
- Kiểm tra console browser (F12) xem có lỗi không

---

## 📸 DEMO NHANH

```bash
# Bước 1: Import SQL (MySQL Workbench)
# File → Run SQL Script → Chọn vestshop_db.sql → Run

# Bước 2: Chạy backend
cd backend
mvn spring-boot:run

# Bước 3: Mở browser
# → http://localhost:9090
```

**Chỉ 3 bước - Xong!** 🎉

---

## 🆘 HỖ TRỢ

Nếu gặp vấn đề:

1. **Check logs** trong terminal/console
2. **Check MySQL** đã chạy chưa
3. **Check port 9090** có bị chiếm không
4. **Xem file README.md** để biết thêm chi tiết
5. **Kiểm tra application.properties** có đúng cấu hình không

---

## 📝 THÔNG TIN BỔ SUNG

### Environment Variables (Tùy Chọn)

Có thể set environment variables thay vì sửa `application.properties`:

```bash
# Windows (CMD)
set DB_USERNAME=root
set DB_PASSWORD=your_password
set JWT_SECRET=your_secret_key

# Windows (PowerShell)
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_password"

# Linux/Mac
export DB_USERNAME=root
export DB_PASSWORD=your_password
```

### Build JAR File (Production)

```bash
cd backend
mvn clean package
java -jar target/vest-shop-backend-1.0.0.jar
```

---

## 📅 THÔNG TIN NỘP BÀI

**Ngày nộp**: 05/01/2026  
**Môn học**: Chuyên đề  
**Giảng viên**: [Tên giảng viên]

---

*Website bán quần áo vest cao cấp với thiết kế hiện đại, responsive và đầy đủ tính năng quản lý.*

**Chúc bạn chạy project thành công! 🚀**
