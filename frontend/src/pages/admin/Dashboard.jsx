import { useState, useEffect } from 'react'
import { productAPI, adminOrderAPI } from '../../services/api'

function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [bestSellingProducts, setBestSellingProducts] = useState([])
  const [showRevenueModal, setShowRevenueModal] = useState(false)
  const [revenueData, setRevenueData] = useState({})
  const [ordersInRange, setOrdersInRange] = useState([])
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [loadingRevenue, setLoadingRevenue] = useState(false)

  useEffect(() => {
    loadStatistics();
    loadRecentOrders();
    loadBestSellingProducts();
  }, []);

  const loadStatistics = async () => {
    try {
      // Load products count
      const productsRes = await productAPI.getAll();
      const products = productsRes.data || [];

      // Load orders statistics
      const statsRes = await adminOrderAPI.getStatistics();
      const statistics = statsRes.data || {};

      setStats({
        totalProducts: products.length,
        totalOrders: statistics.totalOrders || 0,
        totalRevenue: statistics.totalRevenue || 0,
        pendingOrders: statistics.pendingOrders || 0
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0
      });
    }
  };

  const loadRecentOrders = async () => {
    try {
      const response = await adminOrderAPI.getAll();
      const orders = response.data || [];
      // Sắp xếp theo createdAt mới nhất trước, lấy 5 đơn đầu tiên
      const sorted = orders
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        })
        .slice(0, 5);
      setRecentOrders(sorted);
    } catch (error) {
      console.error('Error loading recent orders:', error);
      setRecentOrders([]);
    }
  };

  const loadBestSellingProducts = async () => {
    try {
      const response = await adminOrderAPI.getAll();
      const orders = response.data || [];
      
      // Tính toán số lượng bán của mỗi sản phẩm
      // Chỉ tính các đơn hàng đã hoàn thành (COMPLETED), không tính đơn đã hủy (CANCELLED)
      const productSales = {};
      
      orders.forEach(order => {
        const orderStatus = getStatusKey(order.status);
        // Chỉ tính đơn hàng đã hoàn thành
        if (orderStatus === 'COMPLETED' && order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            const productName = item.productName || item.name || 'Unknown';
            if (!productSales[productName]) {
              productSales[productName] = 0;
            }
            productSales[productName] += item.quantity || 0;
          });
        }
      });
      
      // Chuyển đổi thành mảng và sắp xếp theo số lượng bán
      const sortedProducts = Object.entries(productSales)
        .map(([name, sold]) => ({ name, sold }))
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5); // Lấy top 5
      
      setBestSellingProducts(sortedProducts);
    } catch (error) {
      console.error('Error loading best selling products:', error);
      setBestSellingProducts([]);
    }
  };

  const getStatusKey = (status) => {
    if (!status) return 'PENDING'
    return typeof status === 'string' ? status.toUpperCase() : status
  }

  const statusLabels = {
    PENDING: 'Chờ xử lý',
    PROCESSING: 'Đang xử lý',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy'
  }

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800'
  }

  const statCards = [
    {
      title: 'Tổng Sản Phẩm',
      value: stats.totalProducts,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'bg-blue-500'
    },
    {
      title: 'Tổng Đơn Hàng',
      value: stats.totalOrders,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'bg-green-500'
    },
    {
      title: 'Báo Cáo Doanh Thu',
      value: 'Xem báo cáo',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-yellow-500',
      onClick: () => setShowRevenueModal(true)
    },
    {
      title: 'Đơn Chờ Xử Lý',
      value: stats.pendingOrders,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-red-500'
    }
  ]

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold mb-8">Doanh Mục</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-lg shadow-md p-6 ${stat.onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
            onClick={stat.onClick}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                <p className={`${stat.onClick ? 'text-base' : 'text-3xl'} font-bold`}>{stat.value}</p>
              </div>
              <div className={`${stat.color} text-white p-3 rounded-lg`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-serif font-bold mb-4">Đơn Hàng Gần Đây</h2>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-semibold">Đơn hàng #{order.id}</p>
                    <p className="text-sm text-gray-600">{order.fullName || 'N/A'}</p>
                    <p className="text-xs text-gray-500">
                      {order.createdAt ? (typeof order.createdAt === 'string' 
                        ? new Date(order.createdAt).toLocaleString('vi-VN')
                        : order.createdAt) 
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{order.totalAmount?.toLocaleString('vi-VN') || '0'} ₫</p>
                    <span className={`text-xs px-2 py-1 rounded ${statusColors[getStatusKey(order.status)] || statusColors.PENDING}`}>
                      {statusLabels[getStatusKey(order.status)] || 'Chờ xử lý'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Chưa có đơn hàng nào</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-serif font-bold mb-4">Sản Phẩm Bán Chạy</h2>
          <div className="space-y-4">
            {bestSellingProducts.length > 0 ? (
              (() => {
                const maxSold = bestSellingProducts[0]?.sold || 1;
                return bestSellingProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3">
                    <div className="flex-1">
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-gray-600">Đã bán: {product.sold}</p>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2 ml-4">
                      <div
                        className="bg-vest-gold h-2 rounded-full transition-all"
                        style={{ width: `${(product.sold / maxSold) * 100}%` }}
                      />
                    </div>
                  </div>
                ));
              })()
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Chưa có dữ liệu bán hàng</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Report Modal */}
      {showRevenueModal && (
        <RevenueReportModal
          isOpen={showRevenueModal}
          onClose={() => {
            setShowRevenueModal(false)
            setRevenueData({})
            setOrdersInRange([])
            setDateRange({ startDate: '', endDate: '' })
          }}
          revenueData={revenueData}
          ordersInRange={ordersInRange}
          dateRange={dateRange}
          setDateRange={setDateRange}
          loadingRevenue={loadingRevenue}
          setLoadingRevenue={setLoadingRevenue}
          setRevenueData={setRevenueData}
          setOrdersInRange={setOrdersInRange}
        />
      )}
    </div>
  )
}

// Revenue Report Modal Component
function RevenueReportModal({ isOpen, onClose, revenueData, ordersInRange, dateRange, setDateRange, loadingRevenue, setLoadingRevenue, setRevenueData, setOrdersInRange }) {
  const getStatusLabel = (status) => {
    const statusMap = {
      PENDING: 'Chờ xử lý',
      PROCESSING: 'Đang xử lý',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status) => {
    const colorMap = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  const loadRevenueData = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      alert('Vui lòng chọn khoảng thời gian!')
      return
    }

    if (new Date(dateRange.startDate) > new Date(dateRange.endDate)) {
      alert('Ngày bắt đầu phải nhỏ hơn ngày kết thúc!')
      return
    }

    try {
      setLoadingRevenue(true)
      
      // Load revenue data
      const revenueResponse = await adminOrderAPI.getRevenueByDateRange(dateRange.startDate, dateRange.endDate)
      setRevenueData(revenueResponse.data || {})
      
      // Load all orders and filter by date range
      const ordersResponse = await adminOrderAPI.getAll()
      const allOrders = ordersResponse.data || []
      
      // Filter orders by date range and only COMPLETED orders
      const startDate = new Date(dateRange.startDate)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(dateRange.endDate)
      endDate.setHours(23, 59, 59, 999)
      
      const filteredOrders = allOrders.filter(order => {
        const orderDate = new Date(order.createdAt)
        const orderStatus = typeof order.status === 'string' ? order.status.toUpperCase() : order.status
        return orderDate >= startDate && 
               orderDate <= endDate && 
               orderStatus === 'COMPLETED'
      })
      
      // Sort by date descending
      filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      
      setOrdersInRange(filteredOrders)
    } catch (error) {
      console.error('Error loading revenue data:', error)
      alert('Không thể tải dữ liệu doanh thu!')
      setRevenueData({})
      setOrdersInRange([])
    } finally {
      setLoadingRevenue(false)
    }
  }

  // Format date từ YYYY-MM-DD sang DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const parts = dateString.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return dateString
  }

  // Tính tổng doanh thu
  const totalRevenue = Object.values(revenueData).reduce((sum, revenue) => sum + (revenue || 0), 0)

  // Sắp xếp theo ngày
  const sortedDates = Object.keys(revenueData).sort()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-6 py-5 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-serif font-bold text-vest-dark">Báo Cáo Doanh Thu</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Date Range Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Từ ngày <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đến ngày <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={loadRevenueData}
                  disabled={loadingRevenue}
                  className="w-full px-6 py-3 bg-vest-dark text-white rounded-lg hover:bg-vest-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingRevenue ? 'Đang tải...' : 'Xem báo cáo'}
                </button>
              </div>
            </div>

            {/* Revenue Data */}
            {Object.keys(revenueData).length > 0 && (
              <div className="space-y-6">
                <div className="bg-vest-gold bg-opacity-10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-700">Tổng doanh thu:</span>
                    <span className="text-2xl font-bold text-vest-gold">
                      {new Intl.NumberFormat('vi-VN').format(totalRevenue)} ₫
                    </span>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-700">Doanh thu theo ngày</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ngày</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Doanh thu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {sortedDates.map((date) => (
                          <tr key={date} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{formatDate(date)}</td>
                            <td className="px-4 py-3 text-sm text-right font-semibold text-vest-gold">
                              {new Intl.NumberFormat('vi-VN').format(revenueData[date] || 0)} ₫
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Orders List */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-700">Danh sách đơn hàng ({ordersInRange.length})</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {ordersInRange.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {ordersInRange.map((order) => (
                          <div key={order.id} className="p-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-gray-900">Đơn hàng #{order.id}</p>
                                <p className="text-sm text-gray-600">{order.fullName || 'N/A'}</p>
                                <p className="text-xs text-gray-500">
                                  {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'N/A'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-vest-gold">
                                  {new Intl.NumberFormat('vi-VN').format(order.totalAmount || 0)} ₫
                                </p>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                  {getStatusLabel(order.status)}
                                </span>
                              </div>
                            </div>
                            {order.items && order.items.length > 0 && (
                              <div className="mt-2 pl-4 border-l-2 border-gray-200">
                                {order.items.map((item, idx) => (
                                  <p key={idx} className="text-sm text-gray-600">
                                    {item.productName || item.name} - Size {item.size} x {item.quantity}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>Không có đơn hàng nào</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {Object.keys(revenueData).length === 0 && !loadingRevenue && dateRange.startDate && dateRange.endDate && (
              <div className="text-center py-12 text-gray-500">
                <p>Không có dữ liệu doanh thu trong khoảng thời gian này</p>
              </div>
            )}

            {!dateRange.startDate || !dateRange.endDate ? (
              <div className="text-center py-12 text-gray-500">
                <p>Vui lòng chọn khoảng thời gian để xem báo cáo</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

