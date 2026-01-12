# Vest Shop - Website Bán Quần Áo Vest Cao Cấp

**Sinh viên**: Trần Hoàng Huy  
**MSSV**: 801240005  
**Môn học**: Chuyên đề  
**Năm học**: 2025-2026

---

## 📋 Tổng Quan Dự Án

Dự án website thương mại điện tử chuyên bán vest nam cao cấp với giao diện hiện đại, responsive và đầy đủ tính năng quản lý. Hệ thống được xây dựng theo kiến trúc **Full-Stack** với **Spring Boot** (Backend) và **React** (Frontend).

### Kiến Trúc Hệ Thống

- **Frontend**: React 18 + Vite + Tailwind CSS - Giao diện người dùng và admin
- **Backend**: Spring Boot 3.2.1 - REST API với JWT Authentication
- **Database**: MySQL 8.0 - Quản lý dữ liệu
- **Security**: Spring Security + JWT Token

---

## ✨ Tính Năng Chính

### 👥 Phần Khách Hàng (Public)

#### 🏠 Trang Chủ
- Hero section với hình ảnh đẹp mắt
- Hiển thị sản phẩm nổi bật
- Responsive design hoàn chỉnh

#### 🛍️ Quản Lý Sản Phẩm
- **Danh sách sản phẩm** với phân trang (8 sản phẩm/trang)
- **Filter** theo:
  - Danh mục (Category)
  - Khoảng giá (Min/Max Price)
- **Sort** theo:
  - Tên sản phẩm (A-Z)
  - Giá tăng dần/Giảm dần
- **Hiển thị badge "Hết hàng"** cho sản phẩm out of stock
- **Chi tiết sản phẩm** với:
  - Gallery ảnh
  - Thông tin đầy đủ (giá, mô tả, chi tiết)
  - Đánh giá và bình luận từ khách hàng

#### 🛒 Giỏ Hàng & Thanh Toán
- Giỏ hàng với LocalStorage
- Form thanh toán đầy đủ thông tin:
  - Thông tin khách hàng
  - Địa chỉ giao hàng (Tỉnh/Thành phố, Quận/Huyện, Phường/Xã)
  - Phương thức thanh toán (COD, Chuyển khoản)
  - Ghi chú đơn hàng
- Validation form đầy đủ

#### ⭐ Đánh Giá Sản Phẩm
- Xem đánh giá và bình luận của khách hàng
- Hiển thị rating trung bình
- Số lượng đánh giá

#### 📱 Responsive Design
- Tối ưu cho Mobile, Tablet, Desktop
- UI/UX hiện đại và thân thiện

#### ℹ️ Trang Thông Tin
- Trang giới thiệu
- Trang liên hệ với form gửi tin nhắn

---

### 👨‍💼 Phần Admin

#### 🔐 Authentication & Authorization
- **Đăng nhập/Đăng ký** với JWT Token
- **Phân quyền**: USER và ADMIN
- **Bảo mật**: Mật khẩu được mã hóa bằng BCrypt
- **Session**: Stateless với JWT

#### 📊 Dashboard
- Thống kê tổng quan:
  - Tổng số sản phẩm
  - Tổng số đơn hàng
  - Tổng số người dùng
  - Doanh thu

#### ✏️ Quản Lý Sản Phẩm
- **CRUD đầy đủ**: Create, Read, Update, Delete
- **Phân trang** (10 sản phẩm/trang) với filter và sort
- **Filter** theo:
  - Tên sản phẩm (tìm kiếm)
  - Trạng thái (ACTIVE, OUT_OF_STOCK, HIDDEN)
  - Khoảng giá
- **Sort** theo: Tên, Giá, Tồn kho, Trạng thái
- **Quản lý trạng thái**:
  - Tự động sync với tồn kho (stock = 0 → OUT_OF_STOCK)
  - Cho phép admin set status thủ công (có validation)
- **Upload ảnh**: Quản lý nhiều ảnh cho mỗi sản phẩm
- **Quản lý chi tiết**: Danh sách chi tiết sản phẩm

#### 📋 Quản Lý Đơn Hàng
- **Danh sách đơn hàng** với phân trang (10 đơn/trang)
- **Filter** theo:
  - Trạng thái (Tất cả, Chờ xử lý, Đang xử lý, Hoàn thành, Đã hủy)
  - Tên khách hàng
  - Email, Số điện thoại
  - Phương thức thanh toán
  - Khoảng ngày đặt hàng
  - Khoảng tổng tiền
- **Hiển thị số đếm** tổng số đơn hàng theo từng status (tất cả các trang)
- **Cập nhật trạng thái** đơn hàng:
  - Chờ xử lý → Đang xử lý / Hủy
  - Đang xử lý → Hoàn thành
- **Xem chi tiết** đơn hàng:
  - Thông tin khách hàng
  - Danh sách sản phẩm trong đơn
  - Tổng tiền

#### 👥 Quản Lý Người Dùng
- **Danh sách người dùng** với phân trang (10 user/trang)
- **Filter** theo:
  - Tên, Email, Số điện thoại
  - Giới tính
  - Trạng thái (ACTIVE, DISABLED)
  - Khoảng ngày sinh
- **CRUD người dùng**:
  - Xem thông tin chi tiết
  - Cập nhật thông tin (Admin có thể update bất kỳ user nào)
  - Xóa người dùng
- **Quản lý mật khẩu**:
  - Admin có thể set mật khẩu mới cho user (không cần password cũ)
  - User chỉ có thể đổi mật khẩu của chính mình (yêu cầu password cũ)
  - Validation: Mật khẩu mới không được giống mật khẩu cũ
  - Auto-logout sau khi đổi mật khẩu thành công

#### ⭐ Quản Lý Đánh Giá
- **Danh sách đánh giá** với phân trang (10 review/trang)
- **Filter** theo:
  - Sản phẩm
  - Người dùng
  - Trạng thái (PENDING, APPROVED, REJECTED)
- **Duyệt/Từ chối** đánh giá:
  - PENDING → APPROVED (hiển thị công khai)
  - PENDING → REJECTED (ẩn khỏi website)

#### 📧 Quản Lý Tin Nhắn Liên Hệ
- **Danh sách tin nhắn** với phân trang (10 tin/trang)
- **Xem chi tiết** tin nhắn từ khách hàng
- **Sắp xếp** theo thời gian gửi (mới nhất trước)

#### 👤 Quản Lý Profile
- **Admin Profile**: Xem và cập nhật thông tin cá nhân
- **Đổi mật khẩu**: Với validation password cũ
- **Tính tuổi tự động** từ ngày sinh (sử dụng Period.between())

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **React 18.2** - UI Library
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool (nhanh hơn Webpack)
- **Axios** - HTTP client cho API calls
- **Context API** - State management (Auth, Cart)

### Backend
- **Spring Boot 3.2.1** - Java framework
- **Spring Security** - Authentication & Authorization
- **Spring Data JPA** - ORM layer
- **JWT (JSON Web Token)** - Stateless authentication
- **MySQL 8.0** - Relational database
- **Lombok** - Code generation (giảm boilerplate)
- **ModelMapper** - Entity ↔ DTO conversion
- **Maven** - Build tool & dependency management

### Database
- **MySQL 8.0** - Primary database
- **Hibernate** - JPA implementation
- **Auto DDL** - Tự động tạo/update schema

---

## 📁 Cấu Trúc Dự Án

```
ChuyenDe-tranhoanghuy-801240005/
├── backend/                          # Spring Boot Backend
│   ├── src/
│   │   └── main/
│   │       ├── java/com/vestshop/
│   │       │   ├── config/          # Spring Configuration
│   │       │   │   ├── SecurityConfig.java      # Security config
│   │       │   │   ├── JwtConfig.java           # JWT config
│   │       │   │   ├── JwtAuthFilter.java       # JWT filter
│   │       │   │   ├── ApplicationConfig.java  # Beans config
│   │       │   │   ├── ModelConfig.java        # ModelMapper
│   │       │   │   └── WebConfig.java          # CORS config
│   │       │   ├── controller/      # REST Controllers
│   │       │   │   ├── AuthController.java
│   │       │   │   ├── ProductController.java
│   │       │   │   ├── OrderController.java
│   │       │   │   ├── ReviewController.java
│   │       │   │   ├── ContactController.java
│   │       │   │   └── admin/       # Admin controllers
│   │       │   │       ├── AdminProductController.java
│   │       │   │       ├── AdminOrderController.java
│   │       │   │       ├── AdminUserController.java
│   │       │   │       ├── AdminReviewController.java
│   │       │   │       └── AdminContactController.java
│   │       │   ├── entity/          # JPA Entities
│   │       │   │   ├── User.java
│   │       │   │   ├── Product.java
│   │       │   │   ├── Order.java
│   │       │   │   ├── OrderItem.java
│   │       │   │   ├── Review.java
│   │       │   │   └── ContactMessage.java
│   │       │   ├── repository/      # JPA Repositories
│   │       │   │   ├── UserRepository.java
│   │       │   │   ├── ProductRepository.java
│   │       │   │   ├── OrderRepository.java
│   │       │   │   ├── ReviewRepository.java
│   │       │   │   └── ContactMessageRepository.java
│   │       │   ├── services/        # Business Logic
│   │       │   │   ├── AuthService.java
│   │       │   │   ├── UserService.java
│   │       │   │   ├── ProductService.java
│   │       │   │   ├── OrderService.java
│   │       │   │   ├── ReviewService.java
│   │       │   │   ├── ContactService.java
│   │       │   │   ├── JwtService.java
│   │       │   │   ├── CustomUserDetailsService.java
│   │       │   │   └── Imp/         # Service implementations
│   │       │   ├── models/          # DTOs
│   │       │   │   ├── UserModel.java
│   │       │   │   ├── ProductModel.java
│   │       │   │   ├── OrderModel.java
│   │       │   │   ├── ReviewModel.java
│   │       │   │   ├── LoginModel.java
│   │       │   │   ├── RegisterModel.java
│   │       │   │   ├── UpdateUserModel.java
│   │       │   │   └── PageResponseModel.java
│   │       │   ├── enums/           # Enumerations
│   │       │   │   ├── Role.java
│   │       │   │   ├── UserStatus.java
│   │       │   │   ├── ProductStatus.java
│   │       │   │   ├── OrderStatus.java
│   │       │   │   ├── PaymentMethod.java
│   │       │   │   ├── ReviewStatus.java
│   │       │   │   └── Gender.java
│   │       │   ├── exception/       # Exception Handling
│   │       │   │   └── GlobalExceptionHandler.java
│   │       │   ├── utils/           # Utilities
│   │       │   │   └── AgeUtils.java
│   │       │   └── VestShopApplication.java
│   │       └── resources/
│   │           ├── application.properties
│   │           └── static/         # Frontend build files
│   ├── pom.xml
│   └── README.md
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── AuthModal.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── admin/
│   │   ├── pages/                   # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   └── admin/
│   │   ├── context/                 # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── services/                # API services
│   │   │   └── api.js
│   │   └── utils/
│   ├── dist/                        # Built static files
│   ├── package.json
│   └── README.md
│
├── README.md                         # File này
└── HUONG_DAN_CHAY_PROJECT.md        # Hướng dẫn chạy project
```

---

## 🗄️ Database Schema

### Các Bảng Chính

1. **users** - Thông tin người dùng
   - `user_id`, `username`, `password`, `email`, `phone`, `fullname`, `birth`, `gender`, `address`, `role`, `status`

2. **products** - Thông tin sản phẩm
   - `id`, `name`, `price`, `sale_price`, `category`, `description`, `stock`, `status`, `created_at`, `updated_at`

3. **product_images** - Hình ảnh sản phẩm (ElementCollection)
   - `product_id`, `image_url`

4. **product_details** - Chi tiết sản phẩm (ElementCollection)
   - `product_id`, `detail`

5. **orders** - Đơn hàng
   - `id`, `full_name`, `email`, `phone`, `address`, `city`, `district`, `ward`, `total_amount`, `payment_method`, `status`, `created_at`

6. **order_items** - Chi tiết đơn hàng
   - `id`, `order_id`, `product_id`, `size`, `quantity`, `price`

7. **reviews** - Đánh giá sản phẩm
   - `id`, `user_id`, `product_id`, `rating`, `comment`, `status`, `created_at`

8. **contact_messages** - Tin nhắn liên hệ
   - `id`, `full_name`, `email`, `phone`, `message`, `created_at`

---

## 🔐 Authentication & Security

### JWT Token
- **Access Token**: Hết hạn sau 1 giờ (3600000ms)
- **Refresh Token**: Hết hạn sau 7 ngày (604800000ms)
- **Secret Key**: Base64 encoded (cấu hình trong application.properties)

### Password Security
- **BCrypt** hashing với salt tự động
- **Validation**: Mật khẩu tối thiểu 6 ký tự
- **Password Change**: Yêu cầu password cũ (cho user), Admin có thể set trực tiếp

### Authorization
- **Public Endpoints**: `/api/auth/register`, `/api/auth/login`, `/api/products` (GET)
- **User Endpoints**: `/api/orders` (POST), `/api/products/{id}/reviews` (POST)
- **Admin Endpoints**: `/api/admin/*` (tất cả endpoints admin)

---

## 📡 API Endpoints

### Public APIs

#### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user hiện tại

#### Products
- `GET /api/products` - Danh sách sản phẩm (có phân trang, filter, sort)
- `GET /api/products/{id}` - Chi tiết sản phẩm
- `GET /api/products/{id}/reviews` - Đánh giá sản phẩm

#### Orders
- `POST /api/orders` - Tạo đơn hàng (authenticated)

#### Contact
- `POST /api/contact` - Gửi tin nhắn liên hệ

### Admin APIs

#### Products
- `GET /api/admin/products` - Danh sách sản phẩm (có phân trang, filter, sort)
- `GET /api/admin/products/{id}` - Chi tiết sản phẩm
- `POST /api/admin/products` - Tạo sản phẩm
- `PUT /api/admin/products/{id}` - Cập nhật sản phẩm
- `DELETE /api/admin/products/{id}` - Xóa sản phẩm
- `PATCH /api/admin/products/{id}/status` - Cập nhật trạng thái
- `PATCH /api/admin/products/{id}/stock` - Cập nhật tồn kho

#### Orders
- `GET /api/admin/orders` - Danh sách đơn hàng (có phân trang, filter)
- `PATCH /api/admin/orders/{id}/status` - Cập nhật trạng thái đơn hàng
- `GET /api/admin/orders/statistics` - Thống kê đơn hàng

#### Users
- `GET /api/admin/users` - Danh sách người dùng (có phân trang, filter)
- `GET /api/admin/users/{id}` - Chi tiết người dùng
- `PUT /api/admin/users/{id}` - Cập nhật người dùng
- `DELETE /api/admin/users/{id}` - Xóa người dùng

#### Reviews
- `GET /api/admin/reviews` - Danh sách đánh giá (có phân trang, filter)
- `PATCH /api/admin/reviews/{id}/approve` - Duyệt đánh giá
- `PATCH /api/admin/reviews/{id}/reject` - Từ chối đánh giá

#### Contact Messages
- `GET /api/admin/contact/messages` - Danh sách tin nhắn (có phân trang)

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy

Xem chi tiết trong file **[HUONG_DAN_CHAY_PROJECT.md](./HUONG_DAN_CHAY_PROJECT.md)**

### Tóm Tắt Nhanh

1. **Import Database**: Import file SQL export (`vestshop_db.sql`) vào MySQL
2. **Chạy Backend**: `cd backend && mvn spring-boot:run`
3. **Truy cập**: http://localhost:9090

**Lưu ý**: Project đã kèm theo file SQL export chứa đầy đủ cấu trúc và dữ liệu mẫu.

---

## 🎨 UI/UX Features

- **Color Palette**:
  - Primary Dark: `#1a1a1a`
  - Gold: `#d4af37`
  - Navy: `#001f3f`
  - Silver: `#c0c0c0`

- **Responsive Breakpoints**:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

- **Components**:
  - Reusable components với Tailwind CSS
  - Loading states
  - Error handling với user-friendly messages
  - Form validation với feedback

---

## 📊 Tính Năng Nổi Bật

### 1. Phân Trang (Pagination)
- Server-side pagination cho tất cả danh sách
- Frontend: Component `Pagination` reusable
- Backend: Spring Data `Pageable` và `PageResponse`

### 2. Filter & Sort
- Dynamic filtering với `JpaSpecificationExecutor`
- Multiple filter criteria
- Sort theo nhiều trường

### 3. Tính Tuổi Tự Động
- Sử dụng `Period.between()` để tính tuổi từ ngày sinh
- Real-time calculation, không cần lưu trong database

### 4. Quản Lý Trạng Thái Sản Phẩm
- Tự động sync với tồn kho
- Cho phép admin set status thủ công (có validation)

### 5. Error Handling
- Global exception handler
- User-friendly error messages (tiếng Việt)
- Proper HTTP status codes

---

## 🧪 Testing

### Test Cases Đã Implement

1. **Authentication**:
   - Đăng ký với validation
   - Đăng nhập với JWT
   - Password change với validation

2. **Product Management**:
   - CRUD operations
   - Filter và sort
   - Status management

3. **Order Management**:
   - Tạo đơn hàng
   - Update status
   - Filter orders

---

## 📝 Lưu Ý Quan Trọng

1. **Port**: Backend chạy trên port **9090** (không phải 8080)
2. **Database**: 
   - Cần MySQL 8.0+ đã cài đặt và chạy
   - **Import file SQL export** (`vestshop_db.sql`) thay vì để Hibernate tự tạo
   - File SQL đã bao gồm cấu trúc và dữ liệu mẫu
3. **Frontend**: Đã được build sẵn trong `backend/src/main/resources/static/`
4. **JWT Secret**: Cần thay đổi trong production
5. **CORS**: Cấu hình cho `http://localhost:3000` (development)

---

## 🔄 Version History

- **v1.0.0** (2024-2025): Initial release
  - Full CRUD cho Products, Orders, Users
  - Authentication với JWT
  - Admin dashboard
  - Pagination, Filter, Sort
  - Reviews system
  - Contact messages

---

## 📄 License

Copyright © 2024-2025 Vest Shop. All rights reserved.

---

## 👤 Thông Tin Sinh Viên

**Họ và tên**: Trần Hoàng Huy  
**MSSV**: 801240005  
**Môn học**: Chuyên đề  
**Năm học**: 2024-2025

---

**Happy Coding! 🚀**
