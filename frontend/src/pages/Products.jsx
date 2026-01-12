import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productAPI } from '../services/api'
import Pagination from '../components/Pagination'

function Products() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(false)
  const pageSize = 8

  // Reset page to 0 when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategory, priceRange, sortBy]);

  useEffect(() => {
    loadProducts();
  }, [currentPage, selectedCategory, priceRange, sortBy]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Build filter params
      const filters = {
        category: selectedCategory,
        sortBy: sortBy
      };

      // Convert price range to minPrice/maxPrice
      if (priceRange === 'under4m') {
        filters.maxPrice = 3999999;
      } else if (priceRange === '4m-5m') {
        filters.minPrice = 4000000;
        filters.maxPrice = 5000000;
      } else if (priceRange === 'over5m') {
        filters.minPrice = 5000001;
      }

      const response = await productAPI.getAllPaginated(currentPage, pageSize, filters);
      
      // Check if response has pagination info (PageResponse)
      if (response.data && response.data.content) {
        // Paginated response
        const data = response.data.content || [];
        setProducts(data);
        setFilteredProducts(data);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || 0);
      } else {
        // Fallback: non-paginated response (backward compatible)
        const data = response.data || [];
        setProducts(data);
        setFilteredProducts(data);
        setTotalPages(Math.ceil(data.length / pageSize));
        setTotalElements(data.length);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
      setFilteredProducts([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vest-gold mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
          </div>
        ) : (
          <>
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-vest-gold font-medium">{product.category}</span>
                      {(product.status === 'OUT_OF_STOCK' || product.stock === 0) && (
                        <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded">
                          Hết hàng
                        </span>
                      )}
                    </div>
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

            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
                <div className="text-center mt-6 text-sm text-gray-500 bg-gray-50 rounded-lg py-3 px-4">
                  <span className="font-medium text-gray-700">
                    Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)}
                  </span>
                  <span className="text-gray-500"> trong tổng số </span>
                  <span className="font-semibold text-vest-dark">{totalElements}</span>
                  <span className="text-gray-500"> sản phẩm</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Products

