# Vest Shop - Backend API

Backend API cho website bán quần áo vest, được xây dựng bằng Spring Boot.

## Công nghệ sử dụng

- **Spring Boot 3.2.1** - Framework chính
- **Spring Data JPA** - ORM và database access
- **Spring Validation** - Validation dữ liệu
- **MySQL** - Database (production)
- **Lombok** - Giảm boilerplate code
- **Maven** - Build tool

## Cấu trúc dự án

```
src/main/java/com/vestshop/
├── VestShopApplication.java     # Main application
├── config/                      # Configuration classes
│   └── WebConfig.java          # CORS và Web config
├── entity/                      # JPA Entities
│   ├── Product.java            # Entity sản phẩm
│   ├── Order.java              # Entity đơn hàng
│   └── OrderItem.java          # Entity chi tiết đơn hàng
├── repository/                  # JPA Repositories
│   ├── ProductRepository.java
│   └── OrderRepository.java
├── dto/                         # Data Transfer Objects
│   ├── ProductDTO.java
│   ├── OrderDTO.java
│   └── OrderItemDTO.java
└── controller/                  # REST Controllers
    ├── ProductController.java
    ├── OrderController.java
    └── admin/                   # Admin controllers
        ├── AdminProductController.java
        └── AdminOrderController.java
```

## Entities

### Product (Sản phẩm)
- `id`: Long - ID tự động
- `name`: String - Tên sản phẩm
- `price`: Long - Giá (VND)
- `category`: String - Danh mục (Classic, Premium, Business, Modern)
- `description`: String - Mô tả
- `stock`: Integer - Số lượng tồn kho
- `images`: List<String> - Danh sách URL hình ảnh
- `details`: List<String> - Chi tiết sản phẩm
- `status`: ProductStatus - Trạng thái (ACTIVE, OUT_OF_STOCK, HIDDEN)
- `createdAt`: LocalDateTime
- `updatedAt`: LocalDateTime

### Order (Đơn hàng)
- `id`: Long - ID tự động
- `fullName`: String - Họ tên khách hàng
- `email`: String - Email
- `phone`: String - Số điện thoại
- `address`: String - Địa chỉ
- `city`: String - Tỉnh/Thành phố
- `district`: String - Quận/Huyện
- `ward`: String - Phường/Xã
- `note`: String - Ghi chú
- `totalAmount`: Long - Tổng tiền
- `paymentMethod`: PaymentMethod - Phương thức thanh toán (COD, BANKING)
- `status`: OrderStatus - Trạng thái (PENDING, PROCESSING, COMPLETED, CANCELLED)
- `items`: List<OrderItem> - Danh sách sản phẩm
- `createdAt`: LocalDateTime
- `updatedAt`: LocalDateTime

### OrderItem (Chi tiết đơn hàng)
- `id`: Long - ID tự động
- `order`: Order - Đơn hàng
- `product`: Product - Sản phẩm
- `size`: String - Size (S, M, L, XL, XXL)
- `quantity`: Integer - Số lượng
- `price`: Long - Giá tại thời điểm đặt hàng

## API Endpoints

### Public APIs

#### Products
```
GET    /api/products                 - Lấy danh sách sản phẩm (có filter)
GET    /api/products/{id}            - Lấy chi tiết sản phẩm
GET    /api/products/search          - Tìm kiếm sản phẩm
```

#### Orders
```
POST   /api/orders                   - Tạo đơn hàng mới
GET    /api/orders/{id}              - Lấy thông tin đơn hàng
GET    /api/orders/by-email          - Lấy đơn hàng theo email
```

### Admin APIs

#### Admin Products
```
POST   /api/admin/products           - Tạo sản phẩm mới
PUT    /api/admin/products/{id}      - Cập nhật sản phẩm
DELETE /api/admin/products/{id}      - Xóa sản phẩm
PATCH  /api/admin/products/{id}/status   - Cập nhật trạng thái
PATCH  /api/admin/products/{id}/stock    - Cập nhật tồn kho
```

#### Admin Orders
```
GET    /api/admin/orders             - Lấy danh sách đơn hàng
PATCH  /api/admin/orders/{id}/status - Cập nhật trạng thái đơn hàng
GET    /api/admin/orders/statistics  - Lấy thống kê
```

## Cài đặt và Chạy

### Yêu cầu
- Java 17 hoặc cao hơn
- Maven 3.6+
- MySQL 8.0+ (cho production)

### Chạy với H2 Database (Development)

```bash
# Build project
mvn clean install

# Chạy application
mvn spring-boot:run

# Hoặc chạy từ JAR
java -jar target/vest-shop-backend-1.0.0.jar
```

Application sẽ chạy tại: http://localhost:8080
H2 Console: http://localhost:8080/h2-console

### Cấu hình MySQL (Production)

1. Tạo database:
```sql
CREATE DATABASE vestshopdb;
```

2. Cập nhật `application.properties`:
```properties
# Comment H2 config
# Uncomment MySQL config và cập nhật username/password
spring.datasource.url=jdbc:mysql://localhost:3306/vestshopdb?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
```

## TODO - Implement API Logic

Các controller đã được tạo sẵn với structure, bạn cần implement logic:

1. **Tạo Service Layer**
   - ProductService
   - OrderService
   
2. **Implement Controller Methods**
   - Xem các TODO comments trong từng controller
   - Thêm error handling
   - Thêm validation

3. **Tính năng bổ sung**
   - Authentication & Authorization (Spring Security)
   - File upload cho hình ảnh
   - Pagination cho danh sách
   - Email notification
   - Payment integration

## Database Schema

Khi chạy application lần đầu, Hibernate sẽ tự động tạo các bảng:
- `products` - Thông tin sản phẩm
- `product_images` - Hình ảnh sản phẩm
- `product_details` - Chi tiết sản phẩm
- `orders` - Đơn hàng
- `order_items` - Chi tiết đơn hàng

## Testing

API có thể test bằng:
- Postman
- cURL
- Swagger UI (cần thêm dependency)

## CORS

CORS đã được cấu hình cho frontend chạy tại `http://localhost:3000`

Để thay đổi, sửa trong `application.properties`:
```properties
allowed.origins=http://localhost:3000,http://other-domain.com
```

## Tác giả

Trần Hoàng Huy - 801240005

## License

Copyright © 2026 Vest Shop

