import { useState, useEffect } from 'react'
import { adminUserAPI, authAPI } from '../../services/api'
import { calculateAge } from '../../utils/ageUtils'
import { provinces, getDistricts, getWards } from '../../data/addressData'

function UserList() {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    fullname: '',
    email: '',
    phone: '',
    gender: '',
    status: '',
    birthFrom: '',
    birthTo: '',
  })
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    gender: 'NAM',
    birth: '',
    role: 'USER',
    status: 'ACTIVE',
    address: '',
    city: '',
    district: '',
    ward: '',
  })
  const [availableDistricts, setAvailableDistricts] = useState([])
  const [availableWards, setAvailableWards] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [searchTerm, filters])

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
    if (formData.district && formData.city) {
      const wards = getWards(formData.city, formData.district)
      setAvailableWards(wards)
      if (!wards.includes(formData.ward)) {
        setFormData(prev => ({ ...prev, ward: '' }))
      }
    } else {
      setAvailableWards([])
    }
  }, [formData.district, formData.city])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const params = {}
      
      // Nếu có search term, dùng search
      if (searchTerm.trim()) {
        params.search = searchTerm.trim()
      } else {
        // Nếu không có search, dùng filter chi tiết
        if (filters.fullname.trim()) params.fullname = filters.fullname.trim()
        if (filters.email.trim()) params.email = filters.email.trim()
        if (filters.phone.trim()) params.phone = filters.phone.trim()
        if (filters.gender) params.gender = filters.gender
        if (filters.status) params.status = filters.status
        if (filters.birthFrom) params.birthFrom = filters.birthFrom
        if (filters.birthTo) params.birthTo = filters.birthTo
      }
      
      const response = await adminUserAPI.getAll(params)
      setUsers(response.data || [])
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers([])
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
    setSearchTerm('')
    setFilters({
      fullname: '',
      email: '',
      phone: '',
      gender: '',
      status: '',
      birthFrom: '',
      birthTo: '',
    })
  }

  const openUpdateModal = (user) => {
    setSelectedUser(user)
    setError('')
    setSuccess('')
    
    // Parse address để tách thành các phần
    let addressParts = { detail: '', city: '', district: '', ward: '' }
    if (user.address) {
      const parts = user.address.split(',').map(p => p.trim())
      if (parts.length >= 4) {
        addressParts = {
          detail: parts[0],
          ward: parts[1],
          district: parts[2],
          city: parts[3]
        }
      } else {
        addressParts.detail = user.address
      }
    }

    setFormData({
      fullname: user.fullname || '',
      email: user.email || '',
      phone: user.phone || '',
      gender: user.gender || 'NAM',
      birth: user.birth ? formatDateForInput(user.birth) : '',
      role: user.role || 'USER',
      status: user.status || 'ACTIVE',
      address: addressParts.detail || '',
      city: addressParts.city || '',
      district: addressParts.district || '',
      ward: addressParts.ward || '',
    })
    setShowUpdateModal(true)
  }

  const closeUpdateModal = () => {
    setShowUpdateModal(false)
    setSelectedUser(null)
    setFormData({
      fullname: '',
      email: '',
      phone: '',
      gender: 'NAM',
      birth: '',
      role: 'USER',
      status: 'ACTIVE',
      address: '',
      city: '',
      district: '',
      ward: '',
    })
    setError('')
    setSuccess('')
  }

  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    // Backend trả về "YYYY-MM-DD", giữ nguyên cho input type="date"
    if (typeof dateString === 'string') {
      const parts = dateString.split('-')
      if (parts.length === 3) {
        return dateString
      }
      // Nếu là format "DD-MM-YYYY", convert sang "YYYY-MM-DD"
      if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
        const [day, month, year] = dateString.split('-')
        return `${year}-${month}-${day}`
      }
    }
    return dateString
  }

  const formatDateForBackend = (dateString) => {
    if (!dateString) return ''
    const parts = dateString.split('-')
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`
    }
    return dateString
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      // Build full address
      let fullAddress = ''
      if (formData.address || formData.ward || formData.district || formData.city) {
        const parts = []
        if (formData.address) parts.push(formData.address)
        if (formData.ward) parts.push(formData.ward)
        if (formData.district) parts.push(formData.district)
        if (formData.city) parts.push(formData.city)
        fullAddress = parts.join(', ')
      }

      // Format birth date từ "YYYY-MM-DD" sang "DD-MM-YYYY"
      let formattedBirth = formData.birth
      if (formattedBirth) {
        const parts = formattedBirth.split('-')
        if (parts.length === 3) {
          formattedBirth = `${parts[2]}-${parts[1]}-${parts[0]}`
        }
      }

      const updateData = {
        userId: selectedUser.userId,
        fullname: formData.fullname,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        birth: formattedBirth,
        address: fullAddress,
        role: formData.role,
        status: formData.status,
      }

      const response = await authAPI.adminUpdateUser(selectedUser.userId, updateData)
      const updatedUser = response.data
      
      // Update user in list
      setUsers(users.map(user =>
        user.userId === selectedUser.userId ? updatedUser : user
      ))
      
      setSuccess('Cập nhật tài khoản thành công!')
      setTimeout(() => {
        closeUpdateModal()
        loadUsers() // Reload để đảm bảo dữ liệu mới nhất
      }, 1000)
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật tài khoản')
    }
  }

  const roleLabels = {
    ADMIN: 'Quản trị viên',
    USER: 'Người dùng'
  }

  const statusLabels = {
    ACTIVE: 'Hoạt động',
    DISABLED: 'Vô hiệu hóa'
  }

  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-800',
    DISABLED: 'bg-red-100 text-red-800'
  }

  const roleColors = {
    ADMIN: 'bg-purple-100 text-purple-800',
    USER: 'bg-blue-100 text-blue-800'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold">Quản Lý Tài Khoản</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* Search */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Tìm kiếm nhanh</label>
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
          <input
            type="text"
            placeholder="Tên đăng nhập, họ tên, email, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
          />
          <p className="text-xs text-gray-500 mt-1">Tìm kiếm nhanh sẽ bỏ qua các filter chi tiết bên dưới</p>
        </div>

        {/* Detailed Filters */}
        {showFilters && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Lọc chi tiết</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Fullname Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
              <input
                type="text"
                placeholder="Nhập họ và tên..."
                value={filters.fullname}
                onChange={(e) => handleFilterChange('fullname', e.target.value)}
                disabled={!!searchTerm.trim()}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                disabled={!!searchTerm.trim()}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                disabled={!!searchTerm.trim()}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                disabled={!!searchTerm.trim()}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Tất cả</option>
                <option value="NAM">Nam</option>
                <option value="NỮ">Nữ</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                disabled={!!searchTerm.trim()}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Tất cả</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="DISABLED">Vô hiệu hóa</option>
              </select>
            </div>

            {/* Birth Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh từ</label>
              <input
                type="date"
                value={filters.birthFrom}
                onChange={(e) => handleFilterChange('birthFrom', e.target.value)}
                disabled={!!searchTerm.trim()}
                max={filters.birthTo || undefined}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Birth Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh đến</label>
              <input
                type="date"
                value={filters.birthTo}
                onChange={(e) => handleFilterChange('birthTo', e.target.value)}
                disabled={!!searchTerm.trim()}
                min={filters.birthFrom || undefined}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
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

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vest-gold mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tên đăng nhập</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Họ và tên</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Số điện thoại</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tuổi</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Quyền</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Trạng thái</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user) => (
                    <tr key={user.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-medium">#{user.userId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium">{user.username}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span>{user.fullname || 'Chưa cập nhật'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm">{user.email || 'Chưa cập nhật'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm">{user.phone || 'Chưa cập nhật'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm">
                          {user.birth ? (calculateAge(user.birth) !== null ? `${calculateAge(user.birth)} tuổi` : 'N/A') : 'Chưa cập nhật'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || roleColors.USER}`}>
                          {roleLabels[user.role] || user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[user.status] || statusColors.ACTIVE}`}>
                          {statusLabels[user.status] || user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => openUpdateModal(user)}
                            className="px-4 py-2 bg-vest-dark text-white rounded-lg hover:bg-vest-gold transition-colors text-sm font-medium"
                          >
                            Cập nhật
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Không tìm thấy tài khoản nào</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Update User Modal */}
      {showUpdateModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={closeUpdateModal}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-6 py-5 sm:p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-serif font-bold text-vest-dark">
                      Cập nhật tài khoản #{selectedUser.userId}
                    </h2>
                    <button
                      type="button"
                      onClick={closeUpdateModal}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Error/Success Messages */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm mb-4">
                      {success}
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tên đăng nhập
                        </label>
                        <input
                          type="text"
                          value={selectedUser.username}
                          disabled
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="fullname"
                          type="text"
                          required
                          maxLength={50}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
                          value={formData.fullname}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="email"
                          type="email"
                          required
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="phone"
                          type="tel"
                          required
                          minLength={10}
                          maxLength={11}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giới tính <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="gender"
                          required
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
                          value={formData.gender}
                          onChange={handleChange}
                        >
                          <option value="NAM">Nam</option>
                          <option value="NỮ">Nữ</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ngày sinh <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="birth"
                          type="date"
                          required
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
                          value={formData.birth}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quyền <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="role"
                          required
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
                          value={formData.role}
                          onChange={handleChange}
                        >
                          <option value="USER">Người dùng</option>
                          <option value="ADMIN">Quản trị viên</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trạng thái <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="status"
                          required
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
                          value={formData.status}
                          onChange={handleChange}
                        >
                          <option value="ACTIVE">Hoạt động</option>
                          <option value="DISABLED">Vô hiệu hóa</option>
                        </select>
                      </div>
                    </div>

                    {/* Address fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tỉnh/Thành phố <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="city"
                          required
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quận/Huyện <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="district"
                          required
                          disabled={!formData.city}
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phường/Xã <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="ward"
                          required
                          disabled={!formData.district}
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Địa chỉ chi tiết <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="address"
                          type="text"
                          required
                          maxLength={255}
                          placeholder="Số nhà, tên đường..."
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
                          value={formData.address}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-end space-x-4 pt-6 mt-6 border-t">
                    <button
                      type="button"
                      onClick={closeUpdateModal}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-vest-dark text-white rounded-lg hover:bg-vest-gold transition-all shadow-md hover:shadow-lg"
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserList
