import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminProductAPI } from '../../services/api'

function ProductList() {
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await adminProductAPI.getAll();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  };

  const filteredProducts = products
    .filter(product => {
      // Filter by search term
      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false
      
      // Filter by status
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter
      
      // Filter by price range
      const productPrice = product.salePrice || product.price || 0
      const matchesMinPrice = !priceFilter.min || productPrice >= parseInt(priceFilter.min.replace(/\./g, ''))
      const matchesMaxPrice = !priceFilter.max || productPrice <= parseInt(priceFilter.max.replace(/\./g, ''))
      
      return matchesSearch && matchesStatus && matchesMinPrice && matchesMaxPrice
    })
    .sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() || ''
          bValue = b.name?.toLowerCase() || ''
          break
        case 'price':
          aValue = a.salePrice || a.price || 0
          bValue = b.salePrice || b.price || 0
          break
        case 'stock':
          aValue = a.stock || 0
          bValue = b.stock || 0
          break
        case 'status':
          aValue = a.status || ''
          bValue = b.status || ''
          break
        default:
          return 0
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await adminProductAPI.delete(id);
        setProducts(products.filter(p => p.id !== id));
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
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Sản phẩm</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Danh mục</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Giá</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tồn kho</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Trạng thái</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.images?.[0] || 'https://via.placeholder.com/200'}
                        alt={product.name}
                        className="w-16 h-20 object-cover rounded"
                      />
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-vest-gold text-sm">{product.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      {product.salePrice && product.salePrice < product.price ? (
                        <>
                          <span className="font-semibold text-red-600">
                            {product.salePrice.toLocaleString('vi-VN')} ₫
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            {product.price.toLocaleString('vi-VN')} ₫
                          </span>
                        </>
                      ) : (
                        <span className="font-semibold">{product.price?.toLocaleString('vi-VN') || '0'} ₫</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={product.stock === 0 ? 'text-red-600 font-semibold' : ''}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductList


