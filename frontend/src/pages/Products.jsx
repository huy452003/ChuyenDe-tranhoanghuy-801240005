import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productAPI } from '../services/api'

function Products() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productAPI.getAll();
      const data = response.data || [];
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      // Fallback to mock data if API fails
      const mockProducts = [
      {
        id: 1,
        name: 'Vest Đen Cổ Điển',
        price: 3500000,
        image: 'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=500',
        category: 'Classic',
        description: 'Vest đen cổ điển, phù hợp cho mọi dịp'
      },
      {
        id: 2,
        name: 'Vest Xanh Navy Sang Trọng',
        price: 4200000,
        image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500',
        category: 'Premium',
        description: 'Vest xanh navy cao cấp'
      },
      {
        id: 3,
        name: 'Vest Xám Lịch Lãm',
        price: 3800000,
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500',
        category: 'Business',
        description: 'Vest xám thanh lịch cho doanh nhân'
      },
      {
        id: 4,
        name: 'Vest Nâu Đậm Modern',
        price: 4500000,
        image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=500',
        category: 'Modern',
        description: 'Thiết kế hiện đại, trẻ trung'
      },
      {
        id: 5,
        name: 'Vest Kẻ Sọc Thanh Lịch',
        price: 3900000,
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500',
        category: 'Classic',
        description: 'Họa tiết kẻ sọc tinh tế'
      },
      {
        id: 6,
        name: 'Vest Xanh Lam Nhạt',
        price: 3600000,
        image: 'https://images.unsplash.com/photo-1598522325074-042db73aa4e6?w=500',
        category: 'Business',
        description: 'Tông màu nhẹ nhàng, dễ phối'
      },
      {
        id: 7,
        name: 'Vest Đen Cao Cấp Premium',
        price: 5500000,
        image: 'https://images.unsplash.com/photo-1600091166971-7f9faad6c1e2?w=500',
        category: 'Premium',
        description: 'Dòng cao cấp nhất, vải Ý'
      },
      {
        id: 8,
        name: 'Vest Trắng Kem Dự Tiệc',
        price: 4800000,
        image: 'https://images.unsplash.com/photo-1562788869-4ed32648eb72?w=500',
        category: 'Modern',
        description: 'Hoàn hảo cho các dịp đặc biệt'
      }
      ];
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
    }
  };

  useEffect(() => {
    let filtered = [...products]

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    // Filter by price range
    if (priceRange === 'under4m') {
      filtered = filtered.filter(p => p.price < 4000000)
    } else if (priceRange === '4m-5m') {
      filtered = filtered.filter(p => p.price >= 4000000 && p.price <= 5000000)
    } else if (priceRange === 'over5m') {
      filtered = filtered.filter(p => p.price > 5000000)
    }

    // Sort
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price)
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    }

    setFilteredProducts(filtered)
  }, [selectedCategory, priceRange, sortBy, products])

  return (
    <div className="py-12">
      <div className="container-custom">
        <h1 className="text-4xl font-serif font-bold text-center mb-12">Sản Phẩm</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
              >
                <option value="all">Tất cả</option>
                <option value="Classic">Classic</option>
                <option value="Premium">Premium</option>
                <option value="Business">Business</option>
                <option value="Modern">Modern</option>
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng giá</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="input-field"
              >
                <option value="all">Tất cả</option>
                <option value="under4m">Dưới 4 triệu</option>
                <option value="4m-5m">4 - 5 triệu</option>
                <option value="over5m">Trên 5 triệu</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sắp xếp</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field"
              >
                <option value="name">Tên A-Z</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
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
                <span className="text-sm text-vest-gold font-medium">{product.category}</span>
                <h3 className="text-lg font-serif font-semibold mt-1 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.salePrice ? (
                    <>
                      <p className="text-lg text-gray-400 line-through">
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products

