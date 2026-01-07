import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { authAPI, orderAPI } from '../services/api'
import { provinces, getDistricts, getWards } from '../data/addressData'

function Checkout() {
  const navigate = useNavigate()
  const { cartItems, getTotalPrice, clearCart } = useCart()
  const { isAuthenticated, loading: authLoading, user: authUser } = useAuth()

  // Show login modal if not authenticated (handled by Layout/Header)
  useEffect(() => {
    if (!authLoading && !isAuthenticated()) {
      // Trigger login modal via custom event
      window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode: 'login' } }))
    }
  }, [authLoading, isAuthenticated])

  // Redirect to home if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !authLoading) {
      navigate('/cart')
    }
  }, [cartItems.length, navigate, authLoading])

  const [showQRModal, setShowQRModal] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: '',
    paymentMethod: 'COD'
  })
  const [errors, setErrors] = useState({})
  const [availableDistricts, setAvailableDistricts] = useState([])
  const [availableWards, setAvailableWards] = useState([])
  const [userLoaded, setUserLoaded] = useState(false)

  // Load user data and auto-fill address
  useEffect(() => {
    const loadUserData = async () => {
      if (isAuthenticated() && !userLoaded) {
        try {
          const response = await authAPI.getCurrentUser()
          const user = response.data
          
          // Auto-fill user info
          setFormData(prev => ({
            ...prev,
            fullName: user.fullname || prev.fullName,
            email: user.email || prev.email,
            phone: user.phone || prev.phone,
          }))

          // Parse and fill address
          if (user.address) {
            const addressParts = parseAddress(user.address)
            setFormData(prev => ({
              ...prev,
              address: addressParts.detail || prev.address,
              city: addressParts.city || prev.city,
              district: addressParts.district || prev.district,
              ward: addressParts.ward || prev.ward,
            }))
          }
          
          setUserLoaded(true)
        } catch (error) {
          console.error('Error loading user data:', error)
        }
      }
    }

    loadUserData()
  }, [isAuthenticated, userLoaded])

  const parseAddress = (fullAddress) => {
    if (!fullAddress) return { detail: '', city: '', district: '', ward: '' }
    
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

  const handleUseSavedAddress = async () => {
    try {
      const response = await authAPI.getCurrentUser()
      const user = response.data
      
      setFormData(prev => ({
        ...prev,
        fullName: user.fullname || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }))

      if (user.address) {
        const addressParts = parseAddress(user.address)
        setFormData(prev => ({
          ...prev,
          address: addressParts.detail || '',
          city: addressParts.city || '',
          district: addressParts.district || '',
          ward: addressParts.ward || '',
        }))
      }
    } catch (error) {
      console.error('Error loading saved address:', error)
    }
  }

  // Tự động hiện QR code khi chọn BANKING
  useEffect(() => {
    if (formData.paymentMethod === 'BANKING') {
      setShowQRModal(true)
    } else {
      setShowQRModal(false)
    }
  }, [formData.paymentMethod])

  // Cập nhật danh sách quận/huyện khi tỉnh/thành phố thay đổi
  useEffect(() => {
    if (formData.city) {
      const districts = getDistricts(formData.city)
      setAvailableDistricts(districts)
      // Reset district và ward khi city thay đổi
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
      // Reset ward nếu không còn trong danh sách
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
      [name]: value
    })
    // Clear error khi user nhập lại
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validate tên
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ và tên phải có ít nhất 2 ký tự'
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    // Validate số điện thoại
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại'
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678)'
    }

    // Validate địa chỉ
    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ chi tiết'
    } else if (formData.address.trim().length < 1) {
      newErrors.address = 'Địa chỉ phải có ít nhất 1 ký tự'
    } else if (formData.address.trim().length > 10) {
      newErrors.address = 'Địa chỉ không được quá 10 ký tự'
    }

    // Validate tỉnh/thành phố
    if (!formData.city) {
      newErrors.city = 'Vui lòng chọn tỉnh/thành phố'
    }

    // Validate quận/huyện
    if (!formData.district) {
      newErrors.district = 'Vui lòng chọn quận/huyện'
    }

    // Validate phường/xã
    if (!formData.ward) {
      newErrors.ward = 'Vui lòng chọn phường/xã'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form trước khi submit
    if (!validateForm()) {
      alert('Vui lòng kiểm tra lại thông tin đã nhập!')
      return
    }
    
    try {
      // Prepare order data
      const orderData = {
        ...formData,
        phone: formData.phone.replace(/\s/g, ''), // Remove spaces from phone
        totalAmount: getTotalPrice(),
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price
        }))
      };

      // Call API to create order
      const response = await orderAPI.create(orderData);
      const createdOrder = response.data;
      console.log('Order created:', createdOrder);
      
      // Clear cart and redirect
      clearCart();
      alert(`Đặt hàng thành công! Mã đơn hàng: #${createdOrder.id}\nCảm ơn bạn đã mua hàng.`);
      navigate('/');
    } catch (error) {
      console.error('Error creating order:', error);
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message || error.message;
      
      if (status === 401 || status === 403) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
        window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode: 'login' } }));
      } else if (errorMessage.includes('stock') || errorMessage.includes('Insufficient')) {
        alert('Một số sản phẩm không đủ số lượng trong kho. Vui lòng kiểm tra lại giỏ hàng!');
      } else {
        alert(errorMessage || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!');
      }
    }
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vest-gold mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated (handled by useEffect, but show nothing while redirecting)
  if (!isAuthenticated()) {
    return null
  }

  if (cartItems.length === 0) {
    return null
  }

  return (
    <div className="py-12">
      <div className="container-custom">
        <h1 className="text-4xl font-serif font-bold mb-8">Thanh toán</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-serif font-semibold">Thông tin giao hàng</h2>
                  {isAuthenticated() && (
                    <button
                      type="button"
                      onClick={handleUseSavedAddress}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Sử dụng địa chỉ đã lưu
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className={`input-field ${errors.fullName ? 'border-red-500' : ''}`}
                      placeholder="Nhập họ và tên"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="email@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                      placeholder="0912345678 hoặc +84912345678"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ chi tiết (Số nhà, tên đường) *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className={`input-field ${errors.address ? 'border-red-500' : ''}`}
                      placeholder="VD: 123 Đường Nguyễn Huệ"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tỉnh/Thành phố *
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className={`input-field ${errors.city ? 'border-red-500' : ''}`}
                    >
                      <option value="">-- Chọn Tỉnh/Thành phố --</option>
                      {provinces.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quận/Huyện *
                    </label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      required
                      disabled={!formData.city}
                      className={`input-field ${errors.district ? 'border-red-500' : ''} ${!formData.city ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    >
                      <option value="">-- Chọn Quận/Huyện --</option>
                      {availableDistricts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                    {errors.district && (
                      <p className="text-red-500 text-xs mt-1">{errors.district}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phường/Xã *
                    </label>
                    <select
                      name="ward"
                      value={formData.ward}
                      onChange={handleChange}
                      required
                      disabled={!formData.district}
                      className={`input-field ${errors.ward ? 'border-red-500' : ''} ${!formData.district ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    >
                      <option value="">-- Chọn Phường/Xã --</option>
                      {availableWards.map(ward => (
                        <option key={ward} value={ward}>{ward}</option>
                      ))}
                    </select>
                    {errors.ward && (
                      <p className="text-red-500 text-xs mt-1">{errors.ward}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú đơn hàng (tùy chọn)
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      rows={4}
                      className="input-field"
                      placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-serif font-semibold mb-6">Phương thức thanh toán</h2>
                
                <div className="space-y-4">
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-vest-gold transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === 'COD'}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-semibold">Thanh toán khi nhận hàng (COD)</div>
                      <div className="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận hàng</div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-vest-gold transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BANKING"
                      checked={formData.paymentMethod === 'BANKING'}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <div className="flex-grow">
                      <div className="font-semibold">Chuyển khoản ngân hàng</div>
                      <div className="text-sm text-gray-600">Chuyển khoản trước khi nhận hàng</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* QR Code Modal */}
            {showQRModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowQRModal(false)}>
                <div className="bg-white rounded-lg p-6 max-w-md" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end mb-2">
                    <button onClick={() => setShowQRModal(false)} className="text-gray-500 hover:text-gray-700">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* QR Code Image */}
                  <div className="text-center">
                    <img 
                      src="/QR.jpg" 
                      alt="QR Code Banking" 
                      className="w-full max-w-sm mx-auto"
                      onError={(e) => {
                        e.target.src = '/qr-banking.png';
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-2xl font-serif font-bold mb-6">Đơn hàng</h2>
                
                <div className="space-y-4 mb-6">
                  {cartItems.map(item => (
                    <div key={`${item.id}-${item.size}`} className="flex items-center space-x-3">
                      <img
                        src={item.images?.[0] || 'https://via.placeholder.com/100'}
                        alt={item.name}
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div className="flex-grow">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">Size: {item.size} | SL: {item.quantity}</p>
                        <p className="text-sm font-semibold text-vest-dark">
                          {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-semibold">{getTotalPrice().toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="font-semibold">Miễn phí</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Tổng cộng</span>
                      <span className="text-2xl font-bold text-vest-dark">
                        {getTotalPrice().toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full">
                  Đặt hàng
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Checkout

