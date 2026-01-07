import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { productAPI } from '../services/api'

function ProductDetail() {
  const { id } = useParams()
  const { cartItems, addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState('M')
  const [quantity, setQuantity] = useState(1)
  const [showNotification, setShowNotification] = useState(false)

  const sizes = ['S', 'M', 'L', 'XL', 'XXL']

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await productAPI.getById(id);
      if (response.data) {
        const data = response.data;
        console.log('Product loaded:', data); // Debug
        console.log('Stock:', data.stock); // Debug
        setProduct(data);
      } else {
        // Fallback to mock data
        loadMockProduct();
      }
    } catch (error) {
      console.error('Error loading product:', error);
      loadMockProduct();
    }
  };

  const loadMockProduct = () => {
    const mockProduct = {
      id: parseInt(id),
      name: 'Vest Đen Cổ Điển',
      price: 3500000,
      images: [
        'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=800',
        'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800',
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800'
      ],
      category: 'Classic',
      description: 'Vest đen cổ điển với thiết kế tinh tế, phù hợp cho mọi dịp quan trọng. Chất liệu vải cao cấp nhập khẩu từ Ý, đường may tỉ mỉ trong từng chi tiết.',
      details: [
        'Chất liệu: Vải wool 100% nhập khẩu từ Italy',
        'Màu sắc: Đen trơn',
        'Kiểu dáng: Slim fit',
        'Đặc điểm: 2 khuy, 2 túi hông, 1 túi ngực',
        'Lót trong: Lụa cao cấp',
        'Bảo hành: 12 tháng'
      ],
      stock: 15,
      status: 'ACTIVE'
    };
    setProduct(mockProduct);
  };

  const handleAddToCart = () => {
    if (product) {
      // Kiểm tra số lượng trong giỏ hàng hiện tại
      const cartItem = cartItems.find(item => item.id === product.id && item.size === selectedSize);
      const currentCartQty = cartItem ? cartItem.quantity : 0;
      
      // Validate tồn kho
      if (currentCartQty + quantity > product.stock) {
        alert(`Chỉ còn ${product.stock} sản phẩm trong kho! (Giỏ hàng đã có ${currentCartQty})`);
        return;
      }
      
      // Thêm vào cart với giá đúng (salePrice nếu có, không thì price)
      // Giữ cả price (gốc) và salePrice để hiển thị đúng trong giỏ hàng
      const productToAdd = {
        ...product,
        // price sẽ là giá thực tế phải trả (salePrice nếu có, không thì price)
        price: product.salePrice || product.price,
        // originalPrice để hiển thị giá gốc trong giỏ hàng
        originalPrice: product.price
      };
      addToCart(productToAdd, quantity, selectedSize);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vest-gold mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm">
          <Link to="/" className="text-gray-500 hover:text-vest-gold">Trang chủ</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/products" className="text-gray-500 hover:text-vest-gold">Sản phẩm</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-vest-dark font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.slice(1).map((image, index) => (
                <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity">
                  <img
                    src={image}
                    alt={`${product.name} ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <span className="text-vest-gold font-medium">{product.category}</span>
            <h1 className="text-4xl font-serif font-bold mt-2 mb-4">{product.name}</h1>
            
            {/* Giá */}
            <div className="mb-6">
              {product.salePrice ? (
                <div className="flex items-baseline gap-2 flex-wrap">
                  <p className="text-2xl text-gray-400 line-through">
                    {product.price.toLocaleString('vi-VN')} ₫
                  </p>
                  <p className="text-4xl font-bold text-red-600">
                    {product.salePrice.toLocaleString('vi-VN')} ₫
                  </p>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{Math.round((1 - product.salePrice / product.price) * 100)}%
                  </span>
                </div>
              ) : (
                <p className="text-4xl font-bold text-vest-dark">
                  {product.price.toLocaleString('vi-VN')} ₫
                </p>
              )}
            </div>

            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Chọn size:
              </label>
              <div className="flex flex-wrap gap-3">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-14 rounded-lg border-2 font-medium transition-all ${
                      selectedSize === size
                        ? 'border-vest-gold bg-vest-gold text-vest-dark'
                        : 'border-gray-300 hover:border-vest-gold'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Số lượng:
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-vest-gold transition-colors"
                >
                  -
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-vest-gold transition-colors"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              {product.stock !== undefined && product.stock !== null && (
                <p className="text-sm text-gray-600 mt-2">
                  Còn <span className="font-semibold text-vest-gold">{product.stock}</span> sản phẩm trong kho
                </p>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!product.stock || product.stock === 0 || product.status === 'OUT_OF_STOCK'}
              className="btn-primary w-full mb-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {(product.stock > 0 && product.status === 'ACTIVE') ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
            </button>

            {/* Product Details */}
            <div className="border-t pt-6 mt-6">
              <h3 className="font-semibold text-lg mb-4">Thông tin chi tiết</h3>
              <ul className="space-y-2">
                {product.details.map((detail, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-vest-gold mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Notification */}
        {showNotification && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Đã thêm vào giỏ hàng!</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetail

