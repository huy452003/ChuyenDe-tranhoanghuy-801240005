# Vest Shop - Frontend

Website bán quần áo vest cao cấp với giao diện hiện đại và responsive.

## Tính năng

### Phần Khách hàng
- 🏠 Trang chủ với hero section và sản phẩm nổi bật
- 🛍️ Danh sách sản phẩm với filter và sort
- 📦 Chi tiết sản phẩm với nhiều ảnh
- 🛒 Giỏ hàng với local storage
- 💳 Trang thanh toán đầy đủ
- 📱 Responsive design cho mobile, tablet, desktop
- ℹ️ Trang giới thiệu và liên hệ

### Phần Admin
- 📊 Dashboard với thống kê
- ✏️ Quản lý sản phẩm (CRUD)
- 📋 Quản lý đơn hàng
- 🎨 UI Admin riêng biệt

## Công nghệ sử dụng

- **React 18** - Framework UI
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Axios** - HTTP client

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build

# Preview production build
npm run preview
```

## Cấu trúc thư mục

```
src/
├── components/          # Components dùng chung
│   ├── admin/          # Components cho admin
│   ├── Header.jsx
│   ├── Footer.jsx
│   └── Layout.jsx
├── pages/              # Các trang
│   ├── admin/          # Trang admin
│   ├── Home.jsx
│   ├── Products.jsx
│   ├── ProductDetail.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── About.jsx
│   └── Contact.jsx
├── context/            # React Context
│   └── CartContext.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## API Integration

Backend API chạy ở `http://localhost:8080`

Các endpoint cần implement:
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/admin/orders` - Lấy danh sách đơn hàng (admin)
- `PUT /api/admin/products/:id` - Cập nhật sản phẩm (admin)
- `DELETE /api/admin/products/:id` - Xóa sản phẩm (admin)

## Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Màu sắc chính

- Primary Dark: `#1a1a1a`
- Gold: `#d4af37`
- Navy: `#001f3f`
- Silver: `#c0c0c0`

## Tác giả

Trần Hoàng Huy - 801240005

