import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { provinces, getDistricts, getWards } from '../data/addressData'

function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode) // 'login' or 'register'
  const [formData, setFormData] = useState({
    username: '',
    password: '',
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
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const [availableDistricts, setAvailableDistricts] = useState([])
  const [availableWards, setAvailableWards] = useState([])

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setFormData({
        username: '',
        password: '',
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
      setError('')
    }
  }, [isOpen, initialMode])

  // Cập nhật danh sách quận/huyện khi tỉnh/thành phố thay đổi
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

  // Cập nhật danh sách phường/xã khi quận/huyện thay đổi
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
    setError('')
  }

  const formatDateForBackend = (dateString) => {
    if (!dateString) return ''
    const parts = dateString.split('-')
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`
    }
    return dateString
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const result = await login(formData.username, formData.password)
        if (result.success) {
          onClose()
          // Redirect based on user role
          if (result.data?.role === 'ADMIN') {
            window.location.href = '/#/admin'
          } else {
            window.location.href = '/#/'
          }
        } else {
          setError(result.error || 'Đăng nhập thất bại')
        }
      } else {
        // Format address from city, district, ward
        const addressParts = []
        if (formData.address) addressParts.push(formData.address)
        if (formData.ward) addressParts.push(formData.ward)
        if (formData.district) addressParts.push(formData.district)
        if (formData.city) addressParts.push(formData.city)
        const fullAddress = addressParts.join(', ')
        
        const registerData = {
          username: formData.username,
          password: formData.password,
          fullname: formData.fullname,
          gender: formData.gender,
          email: formData.email,
          phone: formData.phone,
          birth: formatDateForBackend(formData.birth),
          address: fullAddress,
        }

        const result = await register(registerData)
        if (result.success) {
          onClose()
          // Redirect based on user role
          if (result.data?.role === 'ADMIN') {
            window.location.href = '/#/admin'
          } else {
            window.location.href = '/#/'
          }
        } else {
          setError(result.error || 'Đăng ký thất bại')
        }
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

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
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-6 py-5 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-serif font-bold text-vest-dark">
                {mode === 'login' ? 'Đăng nhập' : 'Đăng ký tài khoản'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Switch mode */}
            <div className="mb-6 text-center">
              {mode === 'login' ? (
                <p className="text-sm text-gray-600">
                  Chưa có tài khoản?{' '}
                  <button
                    onClick={() => setMode('register')}
                    className="font-medium text-vest-gold hover:text-vest-dark transition-colors"
                  >
                    Đăng ký ngay
                  </button>
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  Đã có tài khoản?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="font-medium text-vest-gold hover:text-vest-dark transition-colors"
                  >
                    Đăng nhập ngay
                  </button>
                </p>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Login Form */}
              {mode === 'login' && (
                <>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      Tên đăng nhập
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-transparent transition-all"
                      placeholder="Nhập tên đăng nhập"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-transparent transition-all"
                      placeholder="Nhập mật khẩu"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              {/* Register Form */}
              {mode === 'register' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên đăng nhập <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="username"
                        type="text"
                        required
                        minLength={3}
                        maxLength={50}
                        className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-transparent transition-all"
                        value={formData.username}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-transparent transition-all"
                        value={formData.password}
                        onChange={handleChange}
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
                        className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-transparent transition-all"
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
                        className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-transparent transition-all"
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
                        className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-transparent transition-all"
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
                        className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-transparent transition-all"
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
                        className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-transparent transition-all"
                        value={formData.birth}
                        onChange={handleChange}
                      />
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
                        className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-transparent transition-all"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                        className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vest-gold focus:border-transparent transition-all"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-vest-dark text-white font-medium rounded-lg hover:bg-vest-gold focus:outline-none focus:ring-2 focus:ring-vest-gold focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading 
                    ? (mode === 'login' ? 'Đang đăng nhập...' : 'Đang đăng ký...')
                    : (mode === 'login' ? 'Đăng nhập' : 'Đăng ký')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthModal

