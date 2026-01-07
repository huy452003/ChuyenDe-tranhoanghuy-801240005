import { useState } from 'react'
import { contactAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

function Contact() {
  const { isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateField = (name, value) => {
    const trimmedValue = value.trim()
    let error = ''
    
    switch (name) {
      case 'email':
        if (!trimmedValue) {
          error = 'Email không được để trống'
        } else {
          // Email phải có format: text@domain.extension (ít nhất 1 ký tự sau dấu chấm)
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
          if (!emailRegex.test(trimmedValue)) {
            error = 'Email không hợp lệ (ví dụ: email@example.com)'
          } else if (trimmedValue.length > 100) {
            error = 'Email không được quá 100 ký tự'
          }
        }
        break
      case 'phone':
        if (!trimmedValue) {
          error = 'Số điện thoại không được để trống'
        } else {
          const phoneNumber = trimmedValue.replace(/\s+/g, '')
          // Chỉ cho phép số và phải có đúng 10-11 chữ số
          if (!/^[0-9]+$/.test(phoneNumber)) {
            error = 'Số điện thoại chỉ được chứa chữ số'
          } else if (phoneNumber.length < 10 || phoneNumber.length > 11) {
            error = 'Số điện thoại phải có từ 10 đến 11 chữ số'
          } else if (phoneNumber.length > 20) {
            error = 'Số điện thoại không được quá 20 ký tự'
          }
        }
        break
      case 'name':
        if (!trimmedValue) {
          error = 'Họ và tên không được để trống'
        } else if (trimmedValue.length > 100) {
          error = 'Họ và tên không được quá 100 ký tự'
        }
        break
      case 'subject':
        if (!trimmedValue) {
          error = 'Tiêu đề không được để trống'
        } else if (trimmedValue.length > 200) {
          error = 'Tiêu đề không được quá 200 ký tự'
        }
        break
      case 'message':
        if (!trimmedValue) {
          error = 'Nội dung tin nhắn không được để trống'
        } else if (trimmedValue.length > 2000) {
          error = 'Nội dung tin nhắn không được quá 2000 ký tự'
        }
        break
      default:
        break
    }
    
    return error
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Đối với phone, chỉ cho phép nhập số
    let processedValue = value
    if (name === 'phone') {
      // Chỉ giữ lại số và khoảng trắng (để user có thể format)
      processedValue = value.replace(/[^0-9\s]/g, '')
    }
    
    setFormData({
      ...formData,
      [name]: processedValue
    })
    
    // Validate real-time khi user nhập (chỉ validate nếu đã có lỗi trước đó hoặc field đã được blur)
    if (errors[name]) {
      const error = validateField(name, processedValue)
      setErrors({
        ...errors,
        [name]: error
      })
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    setErrors({
      ...errors,
      [name]: error
    })
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Validate tất cả các field
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key])
      if (error) {
        newErrors[key] = error
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form trước khi submit
    if (!validateForm()) {
      return
    }
    
    // Kiểm tra đăng nhập trước khi gửi
    if (!isAuthenticated()) {
      alert('Hãy đăng nhập để liên hệ với chúng tôi')
      // Mở auth modal
      window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode: 'login' } }))
      return
    }

    setLoading(true)
    setErrors({}) // Clear errors khi submit
    try {
      // Normalize phone number (remove spaces)
      const normalizedData = {
        ...formData,
        phone: formData.phone.trim().replace(/\s+/g, ''),
        email: formData.email.trim(),
        name: formData.name.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim()
      }
      
      await contactAPI.createMessage(normalizedData)
      alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.')
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
      setErrors({})
    } catch (error) {
      console.error('Error sending contact message:', error)
      const status = error.response?.status
      
      // Xử lý lỗi 401/403 với message đẹp hơn
      if (status === 401 || status === 403) {
        alert('Hãy đăng nhập để liên hệ với chúng tôi')
        window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode: 'login' } }))
      } else {
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại!')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-12">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif font-bold mb-6">Liên Hệ</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy để lại thông tin và chúng tôi sẽ liên hệ lại sớm nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-serif font-bold mb-6">Gửi Tin Nhắn</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    maxLength={100}
                    className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Nhập họ và tên"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
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
                    onBlur={handleBlur}
                    required
                    maxLength={100}
                    className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="email@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
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
                    onBlur={handleBlur}
                    required
                    maxLength={11}
                    pattern="[0-9]{10,11}"
                    className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="0123456789"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    maxLength={200}
                    className={`input-field ${errors.subject ? 'border-red-500' : ''}`}
                    placeholder="Tiêu đề tin nhắn"
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    rows={6}
                    maxLength={2000}
                    className={`input-field ${errors.message ? 'border-red-500' : ''}`}
                    placeholder="Nhập nội dung tin nhắn của bạn..."
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
                </button>
              </div>
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <div className="bg-vest-dark text-white rounded-lg shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-serif font-bold mb-6 text-vest-gold">Thông Tin Liên Hệ</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <svg className="w-6 h-6 text-vest-gold flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold mb-1">Địa chỉ</h3>
                    <p className="text-gray-300">123 Đường Lừa Đảo, Quận Không Có, Campuchia</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <svg className="w-6 h-6 text-vest-gold flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold mb-1">Điện thoại</h3>
                    <p className="text-gray-300">0909 090 909</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <svg className="w-6 h-6 text-vest-gold flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-gray-300">huyk3@vestshop.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <svg className="w-6 h-6 text-vest-gold flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold mb-1">Giờ làm việc</h3>
                    <p className="text-gray-300">Thứ 2 - Thứ 6: 8:00 - 20:00</p>
                    <p className="text-gray-300">Thứ 7 - CN: 9:00 - 18:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map */}
            <div className="rounded-lg overflow-hidden shadow-lg h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.1268840593!2d106.6296553152604!3d10.8018262617604!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752be27d8b4f4d%3A0x92a4c5e5a2995c40!2zVHLhuqduIGNobyBUaOG7pyDEkOG6oWkgaOG7jWMgR1RWVA!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Vest Shop Location"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact

