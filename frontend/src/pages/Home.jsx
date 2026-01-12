import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { productAPI } from '../services/api'

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const response = await productAPI.getAll();
      const data = response.data || [];
      // Lấy 4 sản phẩm đầu tiên làm featured
      setFeaturedProducts(data.slice(0, 4));
    } catch (error) {
      console.error('Error loading products:', error);
      // Fallback to mock data
      setFeaturedProducts([
      {
        id: 1,
        name: 'Vest Đen Cổ Điển',
        price: 3500000,
        image: 'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=500',
        category: 'Classic'
      },
      {
        id: 2,
        name: 'Vest Xanh Navy Sang Trọng',
        price: 4200000,
        image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500',
        category: 'Premium'
      },
      {
        id: 3,
        name: 'Vest Xám Lịch Lãm',
        price: 3800000,
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500',
        category: 'Business'
      },
      {
        id: 4,
        name: 'Vest Nâu Đậm Modern',
        price: 4500000,
        image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=500',
        category: 'Modern'
      }
      ]);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] bg-cover bg-center" style={{
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200)'
      }}>
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="text-white max-w-3xl px-4">
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">
              Vest Cao Cấp Dành Cho Quý Ông
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Phong cách. Đẳng cấp. Hoàn hảo trong từng chi tiết.
            </p>
            <Link to="/products" className="btn-secondary inline-block">
              Khám Phá Bộ Sưu Tập
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-vest-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-vest-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">Chất Lượng Cao Cấp</h3>
              <p className="text-gray-600">Vải nhập khẩu 100% từ Italy và Anh Quốc</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-vest-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-vest-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">May Đo Theo Yêu Cầu</h3>
              <p className="text-gray-600">Đo và thiết kế riêng cho từng khách hàng</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-vest-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-vest-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">Giao Hàng Nhanh</h3>
              <p className="text-gray-600">Hoàn thành trong 7-10 ngày làm việc</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold mb-4">Sản Phẩm Nổi Bật</h2>
            <p className="text-gray-600 text-lg">Những mẫu vest được yêu thích nhất</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map(product => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="card group"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={product.images?.[0] || 'https://via.placeholder.com/500'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-vest-gold font-medium">{product.category}</span>
                    {(product.status === 'OUT_OF_STOCK' || product.stock === 0) && (
                      <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded">
                        Hết hàng
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-serif font-semibold mt-1 mb-2">{product.name}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.salePrice ? (
                      <>
                        <p className="text-md text-gray-400 line-through">
                          {product.price.toLocaleString('vi-VN')} ₫
                        </p>
                        <p className="text-xl font-bold text-red-600">
                          {product.salePrice.toLocaleString('vi-VN')} ₫
                        </p>
                        <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                          -{Math.round((1 - product.salePrice / product.price) * 100)}%
                        </span>
                      </>
                    ) : (
                      <p className="text-xl font-bold text-vest-dark">
                        {product.price.toLocaleString('vi-VN')} ₫
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/products" className="btn-outline">
              Xem Tất Cả Sản Phẩm
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-vest-dark text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-serif font-bold mb-6">
            Đặt May Đo Theo Số Đo Riêng
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Hãy để chúng tôi tạo nên bộ vest hoàn hảo dành riêng cho bạn
          </p>
          <Link to="/contact" className="btn-secondary">
            Liên Hệ Ngay
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home

