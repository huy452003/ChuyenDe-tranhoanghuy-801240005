import { useState, useEffect } from 'react'
import { adminOrderAPI } from '../../services/api'

function OrderList() {
  const [orders, setOrders] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    fullName: '',
    email: '',
    phone: '',
    paymentMethod: '',
    createdAtFrom: '',
    createdAtTo: '',
    totalAmountFrom: '',
    totalAmountTo: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [filterStatus, filters])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const params = {}
      
      // Nếu có filter status từ button, thêm vào params
      if (filterStatus !== 'all') {
        params.status = filterStatus.toUpperCase()
      }
      
      // Thêm các filter chi tiết nếu có
      if (filters.fullName.trim()) params.fullName = filters.fullName.trim()
      if (filters.email.trim()) params.email = filters.email.trim()
      if (filters.phone.trim()) params.phone = filters.phone.trim()
      if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod
      if (filters.createdAtFrom) params.createdAtFrom = filters.createdAtFrom
      if (filters.createdAtTo) params.createdAtTo = filters.createdAtTo
      if (filters.totalAmountFrom) params.totalAmountFrom = parseInt(filters.totalAmountFrom.replace(/\./g, ''))
      if (filters.totalAmountTo) params.totalAmountTo = parseInt(filters.totalAmountTo.replace(/\./g, ''))
      
      const response = await adminOrderAPI.getAll(params)
      setOrders(response.data || [])
    } catch (error) {
      console.error('Error loading orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value,
    })
  }

  const clearFilters = () => {
    setFilterStatus('all')
    setFilters({
      fullName: '',
      email: '',
      phone: '',
      paymentMethod: '',
      createdAtFrom: '',
      createdAtTo: '',
      totalAmountFrom: '',
      totalAmountTo: '',
    })
  }

  const formatPrice = (price) => {
    if (!price) return ''
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const handlePriceChange = (field, value) => {
    // Chỉ cho phép số
    const numericValue = value.replace(/[^\d]/g, '')
    setFilters({ ...filters, [field]: numericValue })
  }

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  const statusLabels = {
    PENDING: 'Chờ xử lý',
    PROCESSING: 'Đang xử lý',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  }

  const getStatusKey = (status) => {
    if (!status) return 'PENDING'
    return typeof status === 'string' ? status.toUpperCase() : status
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const statusUpper = newStatus.toUpperCase()
      const response = await adminOrderAPI.updateStatus(orderId, statusUpper)

      if (response.data) {
        setOrders(orders.map(order =>
          order.id === orderId ? response.data : order
        ))
        alert('Đã cập nhật trạng thái đơn hàng!')
        loadOrders()
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái!')
    }
  }

  // Tính số lượng đơn hàng theo status
  const getOrderCountByStatus = (status) => {
    if (status === 'all') return orders.length
    return orders.filter(o => getStatusKey(o.status) === status.toUpperCase()).length
  }

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold mb-8">Quản Lý Đơn Hàng</h1>

      {/* Filter Status Buttons */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-vest-gold text-vest-dark'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả ({getOrderCountByStatus('all')})
            </button>
            {Object.entries(statusLabels)
              .filter(([status]) => status === status.toUpperCase())
              .map(([status, label]) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status.toLowerCase())}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === status.toLowerCase()
                      ? 'bg-vest-gold text-vest-dark'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label} ({getOrderCountByStatus(status.toLowerCase())})
                </button>
              ))}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-vest-dark hover:text-vest-gold transition-colors"
          >
            <span>{showFilters ? 'Ẩn' : 'Hiện'} bộ lọc chi tiết</span>
            <svg
              className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Detailed Filters */}
        {showFilters && (
          <div className="border-t pt-6 mt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Lọc chi tiết</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* FullName Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên khách hàng</label>
                <input
                  type="text"
                  placeholder="Nhập tên khách hàng..."
                  value={filters.fullName}
                  onChange={(e) => handleFilterChange('fullName', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
                />
              </div>

              {/* Email Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="Nhập email..."
                  value={filters.email}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
                />
              </div>

              {/* Phone Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  placeholder="Nhập số điện thoại..."
                  value={filters.phone}
                  onChange={(e) => handleFilterChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
                />
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức thanh toán</label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
                >
                  <option value="">Tất cả</option>
                  <option value="COD">Thanh toán khi nhận hàng</option>
                  <option value="BANKING">Chuyển khoản ngân hàng</option>
                </select>
              </div>

              {/* Created Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày đặt từ</label>
                <input
                  type="date"
                  value={filters.createdAtFrom}
                  onChange={(e) => handleFilterChange('createdAtFrom', e.target.value)}
                  max={filters.createdAtTo || undefined}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
                />
              </div>

              {/* Created Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày đặt đến</label>
                <input
                  type="date"
                  value={filters.createdAtTo}
                  onChange={(e) => handleFilterChange('createdAtTo', e.target.value)}
                  min={filters.createdAtFrom || undefined}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
                />
              </div>

              {/* Total Amount From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tổng tiền từ (₫)</label>
                <input
                  type="text"
                  placeholder="0"
                  value={formatPrice(filters.totalAmountFrom)}
                  onChange={(e) => handlePriceChange('totalAmountFrom', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
                />
              </div>

              {/* Total Amount To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tổng tiền đến (₫)</label>
                <input
                  type="text"
                  placeholder="Không giới hạn"
                  value={formatPrice(filters.totalAmountTo)}
                  onChange={(e) => handlePriceChange('totalAmountTo', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
                />
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vest-gold mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex flex-wrap items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-serif font-bold mb-1">
                      Đơn hàng #{order.id}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {order.createdAt ? (typeof order.createdAt === 'string' 
                        ? new Date(order.createdAt).toLocaleString('vi-VN')
                        : order.createdAt) 
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[getStatusKey(order.status)] || statusColors.PENDING}`}>
                      {statusLabels[getStatusKey(order.status)] || 'Chờ xử lý'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold mb-2">Thông tin khách hàng</h4>
                    <p className="text-sm text-gray-700">Tên: {order.fullName || order.customerName || 'N/A'}</p>
                    <p className="text-sm text-gray-700">Email: {order.email || 'N/A'}</p>
                    <p className="text-sm text-gray-700">SĐT: {order.phone || 'N/A'}</p>
                    {order.address && (
                      <p className="text-sm text-gray-700">Địa chỉ: {order.address}, {order.ward}, {order.district}, {order.city}</p>
                    )}
                    {order.paymentMethod && (
                      <p className="text-sm text-gray-700">Thanh toán: {order.paymentMethod === 'COD' ? 'COD' : 'Chuyển khoản'}</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Sản phẩm</h4>
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, index) => (
                        <p key={index} className="text-sm text-gray-700">
                          {item.productName || item.name} - Size {item.size} x {item.quantity} - {item.price?.toLocaleString('vi-VN')} ₫
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Không có sản phẩm</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between pt-4 border-t">
                  <div>
                    <span className="text-lg font-bold text-vest-dark">
                      Tổng: {order.totalAmount.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusKey(order.status) === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(order.id, 'PROCESSING')}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        >
                          Xử lý
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          Hủy
                        </button>
                      </>
                    )}
                    {getStatusKey(order.status) === 'PROCESSING' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'COMPLETED')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        Hoàn thành
                      </button>
                    )}
                    {getStatusKey(order.status) === 'COMPLETED' && (
                      <span className="text-sm text-green-600 font-medium">Đã hoàn thành</span>
                    )}
                    {getStatusKey(order.status) === 'CANCELLED' && (
                      <span className="text-sm text-red-600 font-medium">Đã hủy</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500">Không có đơn hàng nào</p>
        </div>
      )}
    </div>
  )
}

export default OrderList
