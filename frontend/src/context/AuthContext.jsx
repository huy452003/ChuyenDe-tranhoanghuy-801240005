import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password })
      const userData = response.data
      
      // Store user and token FIRST before setting state
      if (userData && userData.accessToken) {
        // Kiểm tra nếu đăng nhập với tài khoản khác
        const previousUser = localStorage.getItem('user')
        if (previousUser) {
          const previousUserData = JSON.parse(previousUser)
          if (previousUserData.userId !== userData.userId) {
            // Đăng nhập với tài khoản khác, cart sẽ được load từ localStorage của user mới
            // Không cần clear vì mỗi user có cart riêng
          }
        }
        
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', userData.accessToken)
        setUser(userData)
        // Dispatch event to notify cart context that user changed (login)
        window.dispatchEvent(new CustomEvent('userChanged'))
        return { success: true, data: userData }
      } else {
        return { success: false, error: 'Không nhận được token từ server' }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Đăng nhập thất bại'
      return { success: false, error: errorMessage }
    }
  }

  const register = async (registerData) => {
    try {
      const response = await authAPI.register(registerData)
      const userData = response.data
      
      // Store user and token
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', userData.accessToken)
      
      setUser(userData)
      // Dispatch event to notify cart context that user changed (register - new user, cart sẽ rỗng)
      window.dispatchEvent(new CustomEvent('userChanged'))
      return { success: true, data: userData }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Đăng ký thất bại'
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await authAPI.logout(token)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear storage regardless of API call success
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      setUser(null)
      // Dispatch event to notify cart context that user changed (logout)
      window.dispatchEvent(new CustomEvent('userChanged'))
    }
  }

  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const isAuthenticated = () => {
    const token = localStorage.getItem('token')
    return user !== null && token !== null
  }

  const isAdmin = () => {
    return user?.role === 'ADMIN'
  }

  const getToken = () => {
    return localStorage.getItem('token')
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated,
    isAdmin,
    getToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

