# Vest Shop - Website Bán Quần Áo Vest Cao Cấp

Dự án website thương mại điện tử chuyên bán vest nam cao cấp với giao diện hiện đại và responsive.

## 📋 Tổng quan

Dự án bao gồm 2 phần chính:
- **Frontend**: React + Vite + Tailwind CSS - Giao diện người dùng và admin
- **Backend**: Spring Boot - REST API

## ✨ Tính năng chính

### Phần Khách hàng
- 🏠 Trang chủ với hero section và sản phẩm nổi bật
- 🛍️ Danh sách sản phẩm với filter theo danh mục, giá, và sort
- 📦 Chi tiết sản phẩm với gallery ảnh
- 🛒 Giỏ hàng với local storage
- 💳 Trang thanh toán đầy đủ thông tin
- 📱 Responsive design hoàn chỉnh
- ℹ️ Trang giới thiệu và liên hệ

### Phần Admin
- 📊 Dashboard với thống kê tổng quan
- ✏️ Quản lý sản phẩm (CRUD đầy đủ)
- 📋 Quản lý đơn hàng và cập nhật trạng thái
- 🎨 UI Admin chuyên nghiệp riêng biệt

## 🛠️ Công nghệ sử dụng

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Vite
- Axios

### Backend
- Spring Boot 3.2.1
- Spring Data JPA
- MySQL / H2 Database
- Lombok
- Maven

## 📁 Cấu trúc dự án

```
ChuyenDe-tranhoanghuy-801240005/
├── frontend/                 # Frontend React application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React Context
│   │   └── ...
│   ├── package.json
│   └── README.md
│
├── backend/                  # Backend Spring Boot application
│   ├── src/
│   │   └── main/
│   │       ├── java/com/vestshop/
│   │       │   ├── entity/
│   │       │   ├── repository/
│   │       │   ├── controller/
│   │       │   └── ...
│   │       └── resources/
│   ├── pom.xml
│   └── README.md
│
└── README.md                 # This file
```

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Node.js 18+ và npm
- Java 17+
- Maven 3.6+
- MySQL 8.0+ (tùy chọn)

### Cài đặt Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build
```

Frontend sẽ chạy tại: http://localhost:3000

### Cài đặt Backend

```bash
cd backend

# Build project
mvn clean install

# Chạy application
mvn spring-boot:run
```

Backend API sẽ chạy tại: http://localhost:8080

## 📝 Hướng dẫn sử dụng

### Chạy toàn bộ dự án

1. **Terminal 1 - Backend:**
```bash
cd backend
mvn spring-boot:run
```

2. **Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

3. Truy cập:
   - Website: http://localhost:3000
   - API: http://localhost:8080
   - H2 Console: http://localhost:8080/h2-console

### Truy cập Admin

Truy cập: http://localhost:3000/admin

## 🎨 Screenshots

### Trang chủ
- Hero section với hình ảnh đẹp mắt
- Hiển thị sản phẩm nổi bật
- Responsive design

### Trang sản phẩm
- Filter theo danh mục và giá
- Sort theo tên và giá
- Grid layout responsive

### Admin Dashboard
- Thống kê tổng quan
- Quản lý sản phẩm và đơn hàng
- UI chuyên nghiệp

## 📚 API Documentation

Xem chi tiết trong `backend/README.md`

### Public APIs
- `GET /api/products` - Danh sách sản phẩm
- `GET /api/products/{id}` - Chi tiết sản phẩm
- `POST /api/orders` - Tạo đơn hàng

### Admin APIs
- `POST /api/admin/products` - Tạo sản phẩm
- `PUT /api/admin/products/{id}` - Cập nhật sản phẩm
- `DELETE /api/admin/products/{id}` - Xóa sản phẩm

## 🔧 Cấu hình

### Frontend Configuration
File: `frontend/vite.config.js`
- Port: 3000
- API Proxy: http://localhost:8080

### Backend Configuration
File: `backend/src/main/resources/application.properties`
- Port: 8080
- Database: H2 (development) / MySQL (production)

## 📦 TODO - Các tính năng cần implement

### Backend
- [ ] Implement Service Layer (ProductService, OrderService)
- [ ] Implement Controller logic
- [ ] Add authentication & authorization
- [ ] Add file upload for images
- [ ] Add pagination
- [ ] Add email notification
- [ ] Integrate payment gateway

### Frontend
- [ ] Connect to real API endpoints
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add form validation feedback
- [ ] Add image upload
- [ ] Add authentication
- [ ] Add user profile

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo Pull Request hoặc Issue.

## 📄 License

Copyright © 2026 Vest Shop. All rights reserved.

## 👤 Tác giả

**Trần Hoàng Huy**
- MSSV: 801240005
- Email: tranhoanghuy@email.com

---

## 📸 Color Palette

- **Primary Dark**: #1a1a1a
- **Gold**: #d4af37
- **Navy**: #001f3f
- **Silver**: #c0c0c0

## 🎯 Mục tiêu dự án

Website được thiết kế để:
1. Cung cấp trải nghiệm mua sắm vest trực tuyến tốt nhất
2. Giao diện đẹp mắt, chuyên nghiệp và responsive
3. Dễ dàng quản lý sản phẩm và đơn hàng cho admin
4. Sẵn sàng mở rộng với các tính năng mới

---

**Happy Coding! 🚀**

