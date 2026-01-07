# 🚀 HƯỚNG DẪN CHẠY PROJECT - VEST SHOP

**Sinh viên**: Trần Hoàng Huy - 801240005  
**Dự án**: Website bán quần áo vest cao cấp

---

## ✅ YÊU CẦU HỆ THỐNG

**KHÔNG CẦN Node.js!** Frontend đã được build sẵn.

Chỉ cần:
1. ✅ **Java 17+** (chạy Spring Boot)
2. ✅ **Maven** (build tool)
3. ✅ **MySQL 8.0+** (database)
4. ✅ **Browser** (Chrome, Firefox, Edge...)

---

## 🎯 CÁCH CHẠY (3 BƯỚC ĐƠN GIẢN)

### Bước 1: Chuẩn bị Database

Mở **MySQL Workbench** hoặc MySQL Command Line, chạy:

```sql
CREATE DATABASE IF NOT EXISTS vestshop_db;
```

**Lưu ý**: Nếu username/password MySQL khác `root/huy12345`, vui lòng sửa file:
- `backend/src/main/resources/application.properties`
- Dòng 6-7: thay đổi username và password

---

### Bước 2: Chạy Backend

**Cách 1 - Command Line (Khuyến nghị):**

```bash
cd backend
mvn spring-boot:run
```

**Cách 2 - IntelliJ IDEA:**
1. Open folder `backend` trong IntelliJ
2. Right-click file `VestShopApplication.java`
3. Chọn **Run 'VestShopApplication'**

**Đợi đến khi thấy**:
```
========================================
Vest Shop Backend is running!
API: http://localhost:9090
========================================
```

---

### Bước 3: Truy cập Website

Mở browser và truy cập:

**🌐 http://localhost:9090**

Spring Boot sẽ tự động serve frontend!

---

## 📱 CÁC TRANG CHÍNH

- **Trang chủ**: http://localhost:9090
- **Sản phẩm**: http://localhost:9090/products
- **Giỏ hàng**: http://localhost:9090/cart
- **Admin Dashboard**: http://localhost:9090/admin
- **API Backend**: http://localhost:9090/api

---

## 🗂️ CẤU TRÚC PROJECT

```
ChuyenDe-tranhoanghuy-801240005/
├── backend/                   # Spring Boot Backend
│   ├── src/
│   │   └── main/
│   │       ├── java/         # Source code Java
│   │       └── resources/    # Config files
│   └── pom.xml               # Maven dependencies
│
├── frontend/                  # React Frontend
│   ├── dist/                 # ✅ ĐÃ BUILD (static files)
│   ├── src/                  # Source code React
│   └── package.json
│
└── HUONG_DAN_CHAY_PROJECT.md # File này
```

**Quan trọng**: Thư mục `frontend/dist/` chứa frontend đã build sẵn!

---

## ✨ TÍNH NĂNG CHÍNH

### 👥 Phần Khách hàng:
- ✅ Trang chủ với hero section đẹp mắt
- ✅ Danh sách sản phẩm với filter & sort
- ✅ Chi tiết sản phẩm với gallery ảnh
- ✅ Giỏ hàng (LocalStorage)
- ✅ Form thanh toán đầy đủ
- ✅ Responsive: Mobile, Tablet, Desktop
- ✅ Trang giới thiệu & liên hệ

### 👨‍💼 Phần Admin:
- ✅ Dashboard với thống kê
- ✅ Quản lý sản phẩm (CRUD)
- ✅ Quản lý đơn hàng
- ✅ Cập nhật trạng thái đơn hàng
- ✅ UI riêng biệt cho admin

### 🔧 Backend:
- ✅ REST API structure hoàn chỉnh
- ✅ JPA Entities (Product, Order, OrderItem)
- ✅ Repository layer
- ✅ MySQL database với Hibernate
- ✅ CORS configuration
- ✅ Serve static files tự động

---

## 🗄️ DATABASE

Khi chạy lần đầu, Hibernate tự động tạo **5 bảng**:

1. **products** - Thông tin sản phẩm vest
2. **product_images** - Hình ảnh sản phẩm
3. **product_details** - Chi tiết sản phẩm
4. **orders** - Đơn hàng khách hàng
5. **order_items** - Chi tiết từng sản phẩm trong đơn hàng

Có thể xem tables trong MySQL Workbench:
```sql
USE vestshop_db;
SHOW TABLES;
```

---

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### ❌ Lỗi: Port 8080 đã được sử dụng

**Giải pháp**:
1. Tắt ứng dụng đang dùng port 8080
2. Hoặc đổi port trong `application.properties`:
   ```properties
   server.port=8081
   ```

### ❌ Lỗi: Cannot connect to MySQL

**Giải pháp**:
1. Kiểm tra MySQL đã chạy chưa:
   - Windows: Services → MySQL → Start
2. Kiểm tra username/password trong `application.properties`
3. Tạo database: `CREATE DATABASE vestshop_db;`

### ❌ Lỗi: Maven command not found

**Giải pháp**:
- Chạy từ IntelliJ IDEA (đã có Maven built-in)
- Right-click `VestShopApplication.java` → Run

---

## 🎓 CÔNG NGHỆ SỬ DỤNG

### Frontend:
- **React 18.2** - UI Library
- **React Router 6** - Routing
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Axios** - HTTP client

### Backend:
- **Spring Boot 3.2.1** - Framework
- **Spring Data JPA** - ORM
- **MySQL** - Database
- **Lombok** - Code generation
- **Maven** - Build tool

---

## 📊 SƠ ĐỒ HOẠT ĐỘNG

```
Browser → http://localhost:8080
              ↓
    Spring Boot (Backend)
              ↓
    ├─→ Serve static files (frontend/dist/)
    └─→ API endpoints (/api/*)
              ↓
         MySQL Database
```

---

## 💡 LƯU Ý QUAN TRỌNG

1. **Frontend đã build sẵn** trong `frontend/dist/` 
   → KHÔNG CẦN Node.js khi chạy!

2. **Backend tự động serve frontend**
   → Chỉ cần chạy backend!

3. **Database tự động tạo tables**
   → Chỉ cần tạo database trống!

4. **Responsive hoàn chỉnh**
   → Test trên mobile/tablet/desktop!

---

## 🆘 HỖ TRỢ

Nếu gặp vấn đề:
1. Check logs trong terminal
2. Check MySQL đã chạy chưa
3. Check port 8080 có bị chiếm không
4. Xem file `README.md` để biết thêm chi tiết

---

## 📸 DEMO NHANH

```bash
# Bước 1: Tạo DB (MySQL Workbench)
CREATE DATABASE vestshop_db;

# Bước 2: Chạy backend
cd backend
mvn spring-boot:run

# Bước 3: Mở browser
# → http://localhost:8080
```

**Chỉ 3 bước - Xong!** 🎉

---

**Ngày nộp**: 05/01/2026  
**Môn học**: Chuyên đề  
**Giảng viên**: ...

---

*Website bán quần áo vest cao cấp với thiết kế hiện đại, responsive và đầy đủ tính năng.*

