import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../services/api'
import { provinces, getDistricts, getWards } from '../../data/addressData'
import { calculateAge } from '../../utils/ageUtils'

function AdminProfile() {
  const { user: authUser, updateUser } = useAuth()
  const [user, setUser] = useState(null)
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

  useEffect(() => {
    loadUserData()
  }, [])

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

  const loadUserData = async () => {
    try {
      setError('')
      const response = await authAPI.getCurrentUser()
      const userData = response.data
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

  const parseAddress = (fullAddress) => {
    if (!fullAddress) return { detail: '', city: '', district: '', ward: '' }
    
    // Format: "Số nhà, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
    const parts = fullAddress.split(',').map(p => p.trim())
    
    if (parts.length >= 4) {
      const detail = parts[0]
      const ward = parts[1]
      const district = parts[2]
      const city = parts[3]
      
      return { detail, city, district, ward }
    }
    
    return { detail: fullAddress, city: '', district: '', ward: '' }
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
        userId: user.userId,
        fullname: formData.fullname,
        gender: formData.gender,
        email: formData.email,
        phone: formData.phone,
        birth: formattedBirth,
        address: fullAddress,
      }

      const response = await authAPI.userUpdateSelf(user.userId, updateData)
      const updatedUser = response.data
      
      setUser(updatedUser)
      updateUser(updatedUser)
      setEditing(false)
      setSuccess('Cập nhật thông tin thành công!')
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin')
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
    <div>
      <h1 className="text-3xl font-serif font-bold mb-8">Thông tin tài khoản</h1>

      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-semibold text-vest-dark">Thông tin cá nhân</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-vest-dark text-white rounded-lg hover:bg-vest-gold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Chỉnh sửa</span>
              </button>
            )}
          </div>

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
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                  {success}
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-vest-gold transition-all"
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
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
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
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
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
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
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

              {/* Action buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setError('')
                    setSuccess('')
                    loadUserData() // Reload để reset form
                  }}
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
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminProfile

