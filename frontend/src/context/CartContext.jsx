import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export function CartProvider({ children }) {
  const getCartKey = (userId) => userId ? `cart_${userId}` : 'cart_guest'
  
  const [cartItems, setCartItems] = useState(() => {
    const currentUser = localStorage.getItem('user')
    const currentUserId = currentUser ? JSON.parse(currentUser)?.userId : null
    
    if (currentUserId) {
      // Có user đăng nhập, load cart của user đó
      const cartKey = getCartKey(currentUserId)
      const savedCart = localStorage.getItem(cartKey)
      return savedCart ? JSON.parse(savedCart) : []
    } else {
      // Không có user, load cart guest (nếu có)
      const guestCart = localStorage.getItem('cart_guest')
      return guestCart ? JSON.parse(guestCart) : []
    }
  })

  // Listen for clearCart event (khi logout)
  useEffect(() => {
    const handleClearCart = () => {
      // Chỉ clear cart hiện tại trong state, không xóa khỏi localStorage
      // Vì có thể user sẽ login lại và cần khôi phục cart
      setCartItems([])
    }
    
    window.addEventListener('clearCart', handleClearCart)
    return () => {
      window.removeEventListener('clearCart', handleClearCart)
    }
  }, [])

  // Listen for user change event (khi login/logout)
  useEffect(() => {
    const handleUserChange = () => {
      const currentUser = localStorage.getItem('user')
      const currentUserId = currentUser ? JSON.parse(currentUser)?.userId : null
      
      if (currentUserId) {
        // User đăng nhập, load cart của user đó
        const cartKey = getCartKey(currentUserId)
        const savedCart = localStorage.getItem(cartKey)
        setCartItems(savedCart ? JSON.parse(savedCart) : [])
      } else {
        // User logout, chuyển sang cart guest (rỗng)
        setCartItems([])
      }
    }
    
    window.addEventListener('userChanged', handleUserChange)
    return () => {
      window.removeEventListener('userChanged', handleUserChange)
    }
  }, [])

  useEffect(() => {
    const currentUser = localStorage.getItem('user')
    const currentUserId = currentUser ? JSON.parse(currentUser)?.userId : null
    const cartKey = getCartKey(currentUserId)
    
    if (cartItems.length > 0) {
      // Lưu cart theo userId
      localStorage.setItem(cartKey, JSON.stringify(cartItems))
    } else {
      // Nếu cart rỗng, xóa cart của user đó
      localStorage.removeItem(cartKey)
    }
  }, [cartItems])

  const addToCart = (product, quantity = 1, size = 'M') => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(
        item => item.id === product.id && item.size === size
      )

      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }

      return [...prevItems, { ...product, quantity, size }]
    })
  }

  const removeFromCart = (productId, size) => {
    setCartItems(prevItems =>
      prevItems.filter(item => !(item.id === productId && item.size === size))
    )
  }

  const updateQuantity = (productId, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size)
      return
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    const currentUser = localStorage.getItem('user')
    const currentUserId = currentUser ? JSON.parse(currentUser)?.userId : null
    const cartKey = getCartKey(currentUserId)
    
    setCartItems([])
    localStorage.removeItem(cartKey)
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

