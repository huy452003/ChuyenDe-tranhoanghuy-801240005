import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice } = useCart()

  if (cartItems.length === 0) {
    return (
      <div className="py-20">
        <div className="container-custom text-center">
          <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-2xl font-serif font-bold mb-4">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-8">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
          <Link to="/products" className="btn-primary">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="container-custom">
        <h1 className="text-4xl font-serif font-bold mb-8">Giỏ hàng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={`${item.id}-${item.size}`} className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row gap-4">
                  <img
                    src={item.images?.[0] || 'https://via.placeholder.com/200'}
                    alt={item.name}
                    className="w-full sm:w-32 h-40 object-cover rounded-lg"
                  />
                  
                  <div className="flex-grow">
                    <Link to={`/products/${item.id}`} className="text-xl font-serif font-semibold hover:text-vest-gold">
                      {item.name}
                    </Link>
                    <p className="text-gray-600 mt-1">Size: {item.size}</p>
                    {/* Hiển thị giá gốc, giá sale và phần trăm giảm */}
                    {item.originalPrice && item.originalPrice > item.price ? (
                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        <p className="text-lg text-gray-400 line-through">
                          {item.originalPrice.toLocaleString('vi-VN')} ₫
                        </p>
                        <p className="text-xl font-bold text-red-600">
                          {item.price.toLocaleString('vi-VN')} ₫
                        </p>
                        <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                          -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                        </span>
                      </div>
                    ) : (
                      <p className="text-xl font-bold text-vest-dark mt-2">
                        {item.price.toLocaleString('vi-VN')} ₫
                      </p>
                    )}
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                        className="w-8 h-8 rounded border-2 border-gray-300 hover:border-vest-gold transition-colors"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        className="w-8 h-8 rounded border-2 border-gray-300 hover:border-vest-gold transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id, item.size)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-serif font-bold mb-6">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-3 mb-6">
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

              <Link to="/checkout" className="btn-primary w-full text-center block mb-4">
                Thanh toán
              </Link>
              
              <Link to="/products" className="btn-outline w-full text-center block">
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart

