import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('login')
  const { cartItems } = useCart()
  const { user, isAuthenticated, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const userMenuRef = useRef(null)

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setIsUserMenuOpen(false)
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  // Listen for custom event to open auth modal
  useEffect(() => {
    const handleOpenAuthModal = (event) => {
      setAuthModalMode(event.detail?.mode || 'login')
      setIsAuthModalOpen(true)
    }

    window.addEventListener('openAuthModal', handleOpenAuthModal)
    return () => {
      window.removeEventListener('openAuthModal', handleOpenAuthModal)
    }
  }, [])

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Vest Shop Logo" 
              className="h-16 w-auto object-contain"
              onError={(e) => {
                // Fallback nếu logo không load được
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            <div className="w-10 h-10 bg-vest-dark rounded-full flex items-center justify-center hidden">
              <span className="text-vest-gold text-xl font-bold">V</span>
            </div>
            <span className="text-2xl font-serif font-bold text-vest-dark">Vest Shop</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-vest-gold transition-colors font-medium">
              Trang chủ
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-vest-gold transition-colors font-medium">
              Sản phẩm
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-vest-gold transition-colors font-medium">
              Giới thiệu
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-vest-gold transition-colors font-medium">
              Liên hệ
            </Link>
          </nav>

          {/* Cart, User Menu & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <svg className="w-6 h-6 text-vest-dark hover:text-vest-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-vest-gold text-vest-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated() ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-vest-gold transition-colors"
                >
                  <div className="w-8 h-8 bg-vest-gold rounded-full flex items-center justify-center">
                    <span className="text-vest-dark font-bold text-sm">
                      {user?.fullname?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium">{user?.fullname || user?.username}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">{user?.fullname || user?.username}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    {isAdmin() ? (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Quản trị
                      </Link>
                    ) : (
                      <Link
                        to="/user/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Tài khoản của tôi
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <button
                  onClick={() => {
                    setAuthModalMode('login')
                    setIsAuthModalOpen(true)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-vest-gold transition-colors"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('register')
                    setIsAuthModalOpen(true)
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-vest-dark hover:bg-vest-gold rounded-md transition-colors"
                >
                  Đăng ký
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-vest-dark"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-vest-gold transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Trang chủ
              </Link>
              <Link
                to="/products"
                className="text-gray-700 hover:text-vest-gold transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Sản phẩm
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-vest-gold transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Giới thiệu
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-vest-gold transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Liên hệ
              </Link>
              {!isAuthenticated() && (
                <>
                  <button
                    onClick={() => {
                      setAuthModalMode('login')
                      setIsAuthModalOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="text-left text-gray-700 hover:text-vest-gold transition-colors font-medium"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalMode('register')
                      setIsAuthModalOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="text-left text-gray-700 hover:text-vest-gold transition-colors font-medium"
                  >
                    Đăng ký
                  </button>
                </>
              )}
              {isAuthenticated() && (
                <>
                  {isAdmin() ? (
                    <Link
                      to="/admin"
                      className="text-gray-700 hover:text-vest-gold transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Quản trị
                    </Link>
                  ) : (
                    <Link
                      to="/user/dashboard"
                      className="text-gray-700 hover:text-vest-gold transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Tài khoản của tôi
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                    className="text-left text-gray-700 hover:text-vest-gold transition-colors font-medium"
                  >
                    Đăng xuất
                  </button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </header>
  )
}

export default Header

