import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-vest-dark text-white mt-20">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-3 items-start md:justify-items-center">
          {/* About */}
          <div className="flex flex-col md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-white p-2 rounded-lg shadow-sm flex-shrink-0">
                <img 
                  src="/logo.png" 
                  alt="Vest Shop Logo" 
                  className="h-12 w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <h3 className="text-xl font-serif font-bold text-vest-gold">Vest Shop</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Chuyên cung cấp vest nam cao cấp, may đo theo yêu cầu với chất liệu và thiết kế đẳng cấp.
            </p>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col">
            <h4 className="text-lg font-semibold mb-4 text-vest-gold">Liên hệ</h4>
            <ul className="space-y-2 text-gray-300 text-sm flex-grow">
              <li>Địa chỉ: 123 Đường Lừa Đảo, Quận Không Có, Campuchia</li>
              <li>Điện thoại: 0909 090 909</li>
              <li>Email: huyk3@vestshop.com</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col md:px-4">
            <h4 className="text-lg font-semibold mb-4 text-vest-gold">Liên kết</h4>
            <ul className="space-y-2.5 flex-grow">
              <li>
                <Link to="/products" className="text-gray-300 hover:text-vest-gold transition-colors text-sm inline-block">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-vest-gold transition-colors text-sm inline-block">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-vest-gold transition-colors text-sm inline-block">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="flex flex-col">
            <h4 className="text-lg font-semibold mb-4 text-vest-gold">Mạng xã hội</h4>
            <div className="flex space-x-4 flex-grow items-start">
              <a 
                href="https://www.facebook.com/page.ngoctrinh" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-vest-gold transition-colors"
                title="Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/ngoctrinh89/?hl=vi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-vest-gold transition-colors"
                title="Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2026 Vest Shop. All rights reserved. | Design by Trần Hoàng Huy
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

