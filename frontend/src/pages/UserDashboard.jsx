import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI, orderAPI, reviewAPI } from '../services/api'
import { provinces, getDistricts, getWards } from '../data/addressData'
import { calculateAge } from '../utils/ageUtils'
import ReviewForm from '../components/ReviewForm'

function UserDashboard() {
  const navigate = useNavigate()
  const { user: authUser, updateUser, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullname: '',
    gender: 'NAM',
    email: '',
    phone: '',
    birth: '',
    address: '',
    city: '',
    district: '',
    ward: '',
  })
  const [availableDistricts, setAvailableDistricts] = useState([])
  const [availableWards, setAvailableWards] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [reviewingProduct, setReviewingProduct] = useState(null) // { productId, productName }
  const [productReviewedStatus, setProductReviewedStatus] = useState({}) // { productId: boolean }

  useEffect(() => {
    // ProtectedRoute already handles authentication check
    // Only load data when component mounts or tab changes
    loadUserData()
    if (activeTab === 'history') {
      loadOrders()
    }
  }, [activeTab])

  const loadUserData = async () => {
    try {
      setError('')
      const response = await authAPI.getCurrentUser()
      const userData = response.data
      console.log('User data loaded:', userData) // Debug log
      setUser(userData)
      
      // Parse address để tách thành các phần
      if (userData.address) {
        const addressParts = parseAddress(userData.address)
        setFormData({
          fullname: userData.fullname || '',
          gender: userData.gender || 'NAM',
          email: userData.email || '',
          phone: userData.phone || '',
          birth: userData.birth ? formatDateForInput(userData.birth) : '',
          address: addressParts.detail || '',
          city: addressParts.city || '',
          district: addressParts.district || '',
          ward: addressParts.ward || '',
        })
      } else {
        setFormData({
          fullname: userData.fullname || '',
          gender: userData.gender || 'NAM',
          email: userData.email || '',
          phone: userData.phone || '',
          birth: userData.birth ? formatDateForInput(userData.birth) : '',
          address: '',
          city: '',
          district: '',
          ward: '',
        })
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      setError('Không thể tải thông tin tài khoản')
    } finally {
      setLoading(false)
    }
  }

  const loadOrders = async () => {
    // Also check review status for completed orders
    const checkReviewStatuses = async (orders) => {
      const statusMap = {};
      for (const order of orders) {
        if (order.status === 'COMPLETED' && order.items) {
          for (const item of order.items) {
            if (item.productId && !statusMap[item.productId]) {
              try {
                const response = await reviewAPI.checkUserReviewed(item.productId);
                statusMap[item.productId] = response.data?.hasReviewed || false;
              } catch (error) {
                console.error(`Error checking review for product ${item.productId}:`, error);
                statusMap[item.productId] = false;
              }
            }
          }
        }
      }
      setProductReviewedStatus(statusMap);
    };

    try {
      // Lấy đơn hàng của user hiện tại từ token (không cần truyền email)
      const response = await orderAPI.getMyOrders()
      const ordersData = response.data || []
      setOrders(ordersData)
      
      // Kiểm tra trạng thái đã đánh giá cho các sản phẩm trong đơn hàng đã hoàn thành
      await checkReviewStatuses(ordersData)
    } catch (error) {
      console.error('Error loading orders:', error)
      setOrders([])
    }
  }

  const parseAddress = (fullAddress) => {
    if (!fullAddress) return { detail: '', city: '', district: '', ward: '' }
    
    // Format: "Số nhà, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
    const parts = fullAddress.split(',').map(p => p.trim())
    
    if (parts.length >= 4) {
      return {
        detail: parts[0],
        ward: parts[1],
        district: parts[2],
        city: parts[3],
      }
    } else if (parts.length === 3) {
      return {
        detail: '',
        ward: parts[0],
        district: parts[1],
        city: parts[2],
      }
    }
    
    return { detail: fullAddress, city: '', district: '', ward: '' }
  }

  const formatDateForInput = (dateString) => {
    // Convert date to YYYY-MM-DD for input type="date"
    if (!dateString) return ''
    
    // Nếu là object Date hoặc LocalDate, convert sang string
    if (dateString instanceof Date) {
      const year = dateString.getFullYear()
      const month = String(dateString.getMonth() + 1).padStart(2, '0')
      const day = String(dateString.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    // Nếu đã là format YYYY-MM-DD (từ backend), trả về luôn
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString
    }
    
    // Nếu là format DD-MM-YYYY, convert sang YYYY-MM-DD
    if (typeof dateString === 'string') {
      const parts = dateString.split('-')
      if (parts.length === 3) {
        // Kiểm tra xem có phải là DD-MM-YYYY không (phần đầu < 32)
        if (parts[0].length <= 2 && parseInt(parts[0]) <= 31 && parseInt(parts[2]) > 31) {
          return `${parts[2]}-${parts[1]}-${parts[0]}`
        }
        // Nếu không, có thể đã là YYYY-MM-DD rồi
        return dateString
      }
    }
    
    return dateString
  }

  const formatDateForBackend = (dateString) => {
    // Convert YYYY-MM-DD to DD-MM-YYYY
    if (!dateString) return ''
    const parts = dateString.split('-')
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`
    }
    return dateString
  }

  useEffect(() => {
    if (formData.city) {
      const districts = getDistricts(formData.city)
      setAvailableDistricts(districts)
      if (!districts.includes(formData.district)) {
        setFormData(prev => ({ ...prev, district: '', ward: '' }))
        setAvailableWards([])
      }
    } else {
      setAvailableDistricts([])
      setAvailableWards([])
    }
  }, [formData.city])

  useEffect(() => {
    if (formData.city && formData.district) {
      const wards = getWards(formData.city, formData.district)
      setAvailableWards(wards)
      if (!wards.includes(formData.ward)) {
        setFormData(prev => ({ ...prev, ward: '' }))
      }
    } else {
      setAvailableWards([])
    }
  }, [formData.city, formData.district])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Chỉ clear error khi user đang nhập, giữ lại success message
    setError('')
  }

  const handleSave = async () => {
    try {
      setError('')
      setSuccess('')
      
      // Validate required fields
      if (!formData.fullname || !formData.fullname.trim()) {
        setError('Họ và tên không được để trống')
        return
      }
      if (!formData.email || !formData.email.trim()) {
        setError('Email không được để trống')
        return
      }
      if (!formData.phone || !formData.phone.trim()) {
        setError('Số điện thoại không được để trống')
        return
      }
      if (!formData.birth || !formData.birth.trim()) {
        setError('Ngày sinh không được để trống')
        return
      }
      
      // Validate tất cả các field địa chỉ đều phải có giá trị
      if (!formData.address || !formData.address.trim()) {
        setError('Địa chỉ chi tiết không được để trống')
        return
      }
      if (!formData.city || !formData.city.trim()) {
        setError('Tỉnh/Thành phố không được để trống')
        return
      }
      if (!formData.district || !formData.district.trim()) {
        setError('Quận/Huyện không được để trống')
        return
      }
      if (!formData.ward || !formData.ward.trim()) {
        setError('Phường/Xã không được để trống')
        return
      }
      
      // Validate chỉ phần address detail (không phải full address)
      if (formData.address.trim().length > 10) {
        setError('Địa chỉ chi tiết không được quá 10 ký tự')
        return
      }
      
      // Format address sau khi đã validate
      const addressParts = []
      addressParts.push(formData.address.trim())
      addressParts.push(formData.ward.trim())
      addressParts.push(formData.district.trim())
      addressParts.push(formData.city.trim())
      const fullAddress = addressParts.join(', ')

      const updateData = {
        userId: user.userId,
        fullname: formData.fullname.trim(),
        gender: formData.gender,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        birth: formatDateForBackend(formData.birth),
        address: fullAddress.trim(),
      }

      const response = await authAPI.userUpdateSelf(user.userId, updateData)
      const updatedUser = response.data
      
      setUser(updatedUser)
      updateUser(updatedUser)
      
      // Set success message trước, sau đó mới chuyển về view mode
      // Sử dụng setTimeout để đảm bảo React render đúng thứ tự
      setSuccess('Cập nhật thông tin thành công!')
      
      // Chuyển về view mode sau một tick để đảm bảo success message được render
      setTimeout(() => {
        setEditing(false)
      }, 0)
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('')
      }, 5000)
    } catch (error) {
      console.error('Update error:', error.response?.data) // Debug log
      // Xử lý lỗi validation từ backend
      if (error.response?.status === 400) {
        const errorData = error.response?.data
        if (errorData?.errors) {
          // Nếu có nhiều lỗi validation
          const errorMessages = errorData.errors.map(err => err.defaultMessage || err.message).join(', ')
          setError(errorMessages || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!')
        } else if (errorData?.message) {
          setError(errorData.message)
        } else {
          setError('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!')
        }
      } else {
        setError(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin')
      }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật'
    // Backend trả về LocalDate dạng "YYYY-MM-DD", convert sang "DD-MM-YYYY"
    if (typeof dateString === 'string') {
      const parts = dateString.split('-')
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`
      }
    }
    return dateString
  }

  const formatOrderDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vest-gold mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="container-custom">
        <h1 className="text-4xl font-serif font-bold mb-8">Tài khoản của tôi</h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-vest-gold text-vest-gold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Thông tin tài khoản
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-vest-gold text-vest-gold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Lịch sử mua hàng
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
          {/* Thông tin tài khoản - Tích hợp xem và chỉnh sửa */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-semibold text-vest-dark">Thông tin tài khoản</h2>
                {!editing && (
                  <button
                    onClick={() => {
                      setError('') // Clear error khi vào edit mode
                      setEditing(true)
                    }}
                    className="flex items-center space-x-2 px-6 py-3 bg-vest-dark text-white rounded-lg hover:bg-vest-gold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Chỉnh sửa</span>
                  </button>
                )}
              </div>

              {/* Thông báo success - hiển thị cả khi editing và không editing */}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                  {success}
                </div>
              )}

              {/* Thông báo error - hiển thị cả khi editing và không editing */}
              {error && !editing && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Hiển thị thông tin khi không editing */}
              {!editing && user && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-vest-gold transition-colors">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Tên đăng nhập
                    </label>
                    <p className="text-gray-900 font-medium text-lg">{user.username}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-vest-gold transition-colors">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Họ và tên
                    </label>
                    <p className="text-gray-900 font-medium text-lg">{user.fullname || 'Chưa cập nhật'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-vest-gold transition-colors">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Email
                    </label>
                    <p className="text-gray-900 font-medium text-lg">{user.email || 'Chưa cập nhật'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-vest-gold transition-colors">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Số điện thoại
                    </label>
                    <p className="text-gray-900 font-medium text-lg">{user.phone || 'Chưa cập nhật'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-vest-gold transition-colors">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Tuổi
                    </label>
                    <p className="text-gray-900 font-medium text-lg">
                      {user.birth ? (calculateAge(user.birth) !== null ? `${calculateAge(user.birth)} tuổi` : 'Chưa cập nhật') : 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-vest-gold transition-colors">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Giới tính
                    </label>
                    <p className="text-gray-900 font-medium text-lg">{user.gender === 'NAM' ? 'Nam' : user.gender === 'NỮ' ? 'Nữ' : user.gender || 'Chưa cập nhật'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-vest-gold transition-colors">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Ngày sinh
                    </label>
                    <p className="text-gray-900 font-medium text-lg">{formatDate(user.birth) || 'Chưa cập nhật'}</p>
                  </div>
                  <div className="md:col-span-2 bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-vest-gold transition-colors">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Địa chỉ
                    </label>
                    <p className="text-gray-900 font-medium text-lg">{user.address || 'Chưa cập nhật'}</p>
                  </div>
                </div>
              )}

              {/* Form chỉnh sửa khi editing */}
              {editing && (
                <>
                  {/* Thông báo error khi đang editing */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="fullname"
                    type="text"
                    required
                    maxLength={50}
                    disabled={!editing}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={formData.fullname}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    disabled={!editing}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    minLength={10}
                    maxLength={11}
                    disabled={!editing}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    required
                    disabled={!editing}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="NAM">Nam</option>
                    <option value="NỮ">Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="birth"
                    type="date"
                    required
                    disabled={!editing}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={formData.birth}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Address fields */}
              <div className="space-y-6 mt-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="city"
                    required
                    disabled={!editing}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={formData.city}
                    onChange={handleChange}
                  >
                    <option value="">Chọn tỉnh/thành phố</option>
                    {provinces.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Quận/Huyện <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="district"
                    required
                    disabled={!editing || !formData.city}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={formData.district}
                    onChange={handleChange}
                  >
                    <option value="">Chọn quận/huyện</option>
                    {availableDistricts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Phường/Xã <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="ward"
                    required
                    disabled={!editing || !formData.district}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={formData.ward}
                    onChange={handleChange}
                  >
                    <option value="">Chọn phường/xã</option>
                    {availableWards.map((ward) => (
                      <option key={ward} value={ward}>
                        {ward}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Địa chỉ chi tiết <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="address"
                    type="text"
                    required
                    maxLength={255}
                    placeholder="Số nhà, tên đường..."
                    disabled={!editing}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

                  <div className="flex space-x-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-6 py-3 bg-vest-dark text-white rounded-lg hover:bg-vest-gold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Lưu thay đổi</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false)
                        loadUserData() // Reload để reset form
                        setError('')
                        setSuccess('')
                      }}
                      className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all shadow-sm hover:shadow-md"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Hủy</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Lịch sử mua hàng */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-semibold mb-4">
                Lịch sử mua hàng
              </h2>
              
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Chưa có đơn hàng nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-semibold text-lg">Đơn hàng #{order.id}</p>
                          <p className="text-sm text-gray-500">
                            Ngày đặt: {formatOrderDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-vest-gold">
                            {new Intl.NumberFormat('vi-VN').format(order.totalAmount)}đ
                          </p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Người nhận:</span> {order.fullName}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Địa chỉ:</span> {order.address}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">SĐT:</span> {order.phone}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Phương thức thanh toán:</span> {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}
                        </p>
                      </div>

                      {order.items && order.items.length > 0 && (
                        <div className="mt-4 border-t pt-4">
                          <p className="font-medium mb-2">Sản phẩm:</p>
                          <div className="space-y-3">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span>{item.productName} x {item.quantity}</span>
                                    <span className="font-medium">
                                      {new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)}đ
                                    </span>
                                  </div>
                                  {order.status === 'COMPLETED' && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      {reviewingProduct?.productId === item.productId ? (
                                        <div>
                                          <p className="text-sm font-medium text-gray-700 mb-2">
                                            Đánh giá: <span className="font-semibold">{item.productName}</span>
                                          </p>
                                          <ReviewForm
                                            productId={item.productId}
                                            onReviewSubmitted={() => {
                                              setReviewingProduct(null);
                                              setProductReviewedStatus(prev => ({
                                                ...prev,
                                                [item.productId]: true
                                              }));
                                            }}
                                            onCancel={() => setReviewingProduct(null)}
                                          />
                                        </div>
                                      ) : (
                                        <button
                                          onClick={async () => {
                                            // Check if user already reviewed
                                            try {
                                              const response = await reviewAPI.checkUserReviewed(item.productId);
                                              if (response.data?.hasReviewed) {
                                                setProductReviewedStatus(prev => ({
                                                  ...prev,
                                                  [item.productId]: true
                                                }));
                                                alert('Bạn đã đánh giá sản phẩm này rồi!');
                                              } else {
                                                setReviewingProduct({
                                                  productId: item.productId,
                                                  productName: item.productName
                                                });
                                              }
                                            } catch (error) {
                                              console.error('Error checking review:', error);
                                              setReviewingProduct({
                                                productId: item.productId,
                                                productName: item.productName
                                              });
                                            }
                                          }}
                                          disabled={productReviewedStatus[item.productId]}
                                          className="flex items-center gap-2 px-4 py-2 bg-vest-gold text-vest-dark rounded-lg hover:bg-yellow-500 transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-sm font-medium"
                                        >
                                          {productReviewedStatus[item.productId] ? (
                                            <>
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                              </svg>
                                              <span>Đã đánh giá</span>
                                            </>
                                          ) : (
                                            <>
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                              </svg>
                                              <span>Viết đánh giá</span>
                                            </>
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard

