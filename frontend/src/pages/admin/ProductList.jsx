import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminProductAPI } from '../../services/api'
import Pagination from '../../components/Pagination'

function ProductList() {
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(false)
  const pageSize = 10
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, statusFilter, priceFilter.min, priceFilter.max, sortBy, sortOrder]);

  useEffect(() => {
    loadProducts();
  }, [currentPage, searchTerm, statusFilter, priceFilter.min, priceFilter.max, sortBy, sortOrder]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Build filter params
      const filters = {
        searchTerm: searchTerm,
        status: statusFilter,
        sortBy: sortBy,
        sortOrder: sortOrder
      };

      // Convert price filter to minPrice/maxPrice
      if (priceFilter.min && priceFilter.min.trim() !== '') {
        const minPrice = parseInt(priceFilter.min.replace(/\./g, ''));
        if (!isNaN(minPrice)) {
          filters.minPrice = minPrice;
        }
      }
      if (priceFilter.max && priceFilter.max.trim() !== '') {
        const maxPrice = parseInt(priceFilter.max.replace(/\./g, ''));
        if (!isNaN(maxPrice)) {
          filters.maxPrice = maxPrice;
        }
      }

      const response = await adminProductAPI.getAllPaginated(currentPage, pageSize, filters);
      
      // Check if response has pagination info (PageResponse)
      if (response.data && response.data.content) {
        // Paginated response
        const data = response.data.content || [];
        setProducts(data);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || 0);
      } else {
        // Fallback: non-paginated response (backward compatible)
        const data = response.data || [];
        setProducts(data);
        setTotalPages(Math.ceil(data.length / pageSize));
        setTotalElements(data.length);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await adminProductAPI.delete(id);
        // Reload products to update pagination
        await loadProducts();
        alert('Đã xóa sản phẩm!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Có lỗi xảy ra khi xóa sản phẩm!');
      }
    }
  }

  const formatPrice = (price) => {
    if (!price) return ''
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const handlePriceChange = (field, value) => {
    // Chỉ cho phép số
    const numericValue = value.replace(/[^\d]/g, '')
    setPriceFilter({ ...priceFilter, [field]: numericValue })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold">Quản Lý Sản Phẩm</h1>
        <Link to="/admin/products/new" className="btn-primary">
          <span className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm Sản Phẩm</span>
          </span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
            >
              <option value="all">Tất cả</option>
              <option value="ACTIVE">Đang bán</option>
              <option value="OUT_OF_STOCK">Hết hàng</option>
              <option value="HIDDEN">Ẩn</option>
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giá từ (₫)</label>
            <input
              type="text"
              placeholder="0"
              value={formatPrice(priceFilter.min)}
              onChange={(e) => handlePriceChange('min', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giá đến (₫)</label>
            <input
              type="text"
              placeholder="Không giới hạn"
              value={formatPrice(priceFilter.max)}
              onChange={(e) => handlePriceChange('max', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
            />
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Sắp xếp theo:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
          >
            <option value="name">Tên sản phẩm</option>
            <option value="price">Giá</option>
            <option value="stock">Tồn kho</option>
            <option value="status">Trạng thái</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <span>{sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sortOrder === 'asc' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              )}
            </svg>
          </button>
          <button
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('all')
              setPriceFilter({ min: '', max: '' })
              setSortBy('name')
              setSortOrder('asc')
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vest-gold mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      ) : (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-gray-600 min-w-[250px]">Sản phẩm</th>
                <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Danh mục</th>
                <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap min-w-[120px]">Giá</th>
                <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap">Tồn kho</th>
                <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap min-w-[100px]">Trạng thái</th>
                <th className="px-4 md:px-6 py-4 text-right text-sm font-semibold text-gray-600 whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={product.images?.[0] || 'https://via.placeholder.com/200'}
                        alt={product.name}
                        className="w-16 h-20 object-cover rounded flex-shrink-0"
                      />
                      <span className="font-medium truncate">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className="text-vest-gold text-sm whitespace-nowrap">{product.category}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex flex-col whitespace-nowrap">
                      {product.salePrice && product.salePrice < product.price ? (
                        <>
                          <span className="font-semibold text-red-600 text-sm leading-tight">
                            {product.salePrice.toLocaleString('vi-VN')}<span className="text-xs ml-0.5">₫</span>
                          </span>
                          <span className="text-xs text-gray-500 line-through leading-tight">
                            {product.price.toLocaleString('vi-VN')}<span className="text-xs ml-0.5">₫</span>
                          </span>
                        </>
                      ) : (
                        <span className="font-semibold text-sm leading-tight">
                          {product.price?.toLocaleString('vi-VN') || '0'}<span className="text-xs ml-0.5">₫</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className={`whitespace-nowrap ${product.stock === 0 ? 'text-red-600 font-semibold' : ''}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        product.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : product.status === 'OUT_OF_STOCK'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {product.status === 'ACTIVE' && 'Đang bán'}
                      {product.status === 'OUT_OF_STOCK' && 'Hết hàng'}
                      {product.status === 'HIDDEN' && 'Ẩn'}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center justify-end space-x-2 whitespace-nowrap">
                      <Link
                        to={`/admin/products/edit/${product.id}`}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50"
                        title="Sửa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                        title="Xóa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
          </div>
        )}
      </div>
      )}
      
      {/* Pagination */}
      {!loading && totalElements > 0 && (
        <div className="mt-8">
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
          <div className="text-center mt-4 text-sm text-gray-500 bg-gray-50 rounded-lg py-3 px-4">
            <span className="font-medium text-gray-700">
              Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)}
            </span>
            <span className="text-gray-500"> trong tổng số </span>
            <span className="font-semibold text-vest-dark">{totalElements}</span>
            <span className="text-gray-500"> sản phẩm</span>
            {totalPages > 1 && (
              <span className="text-gray-500"> (Trang {currentPage + 1}/{totalPages})</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductList


