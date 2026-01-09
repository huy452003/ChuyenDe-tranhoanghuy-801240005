import axios from 'axios';

// Sử dụng environment variable cho production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const url = config.url || '';
    
    // Public endpoints that don't require token
    const isPublicEndpoint = url.includes('/auth/login') || 
                             url.includes('/auth/register') ||
                             url.includes('/products') ||
                             url.includes('/contact/messages');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (!isPublicEndpoint) {
      // Only warn for protected endpoints that need token
      console.warn('No token found in localStorage for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 and 403 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const status = error.response?.status;
    
    // Don't handle errors for login/register endpoints - those are handled in AuthModal
    const isLoginOrRegister = url.includes('/auth/login') || url.includes('/auth/register');
    
    // Only handle 401/403 for protected endpoints (not login/register)
    if (!isLoginOrRegister && (status === 401 || status === 403)) {
      // Token expired, invalid, or forbidden - clear storage and redirect to login
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      // Only dispatch event if we're not already on a protected route
      if (!window.location.hash.includes('/user/dashboard') && !window.location.hash.includes('/admin')) {
        window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode: 'login' } }));
      }
      // Redirect to home
      if (window.location.hash.includes('/user/dashboard') || window.location.hash.includes('/admin')) {
        window.location.href = '/#/';
      }
    }
    return Promise.reject(error);
  }
);

// Products API
export const productAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  search: (keyword) => api.get(`/products/search?keyword=${keyword}`),
};

// Orders API
export const orderAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getById: (id) => api.get(`/orders/${id}`),
  getMyOrders: () => api.get('/orders/my-orders'),
  getByEmail: (email) => api.get(`/orders/by-email?email=${email}`), // Chỉ dùng cho admin
};

// Admin Products API
export const adminProductAPI = {
  getAll: () => api.get('/admin/products'),
  getById: (id) => api.get(`/admin/products/${id}`),
  create: (productData) => api.post('/admin/products', productData),
  update: (id, productData) => api.put(`/admin/products/${id}`, productData),
  delete: (id) => api.delete(`/admin/products/${id}`),
  updateStatus: (id, status) => api.patch(`/admin/products/${id}/status?status=${status}`),
  updateStock: (id, stock) => api.patch(`/admin/products/${id}/stock?stock=${stock}`),
};

// Admin Orders API
export const adminOrderAPI = {
  getAll: (params) => api.get('/admin/orders', { params }),
  updateStatus: (id, status) => api.patch(`/admin/orders/${id}/status?status=${status}`),
  getStatistics: () => api.get('/admin/orders/statistics'),
  getRevenueByDateRange: (startDate, endDate) => api.get(`/admin/orders/revenue/by-date?startDate=${startDate}&endDate=${endDate}`),
};

// Admin Users API
export const adminUserAPI = {
  getAll: (params) => api.get('/admin/users', { params }),
  getById: (userId) => api.get(`/admin/users/${userId}`),
  updateRole: (userId, role) => api.patch(`/admin/users/${userId}/role?role=${role}`),
  updateStatus: (userId, status) => api.patch(`/admin/users/${userId}/status?status=${status}`),
};

// Contact API
export const contactAPI = {
  createMessage: (messageData) => api.post('/contact/messages', messageData),
};

// Admin Contact API
export const adminContactAPI = {
  getAll: () => api.get('/admin/contact/messages'),
  getById: (id) => api.get(`/admin/contact/messages/${id}`),
  markAsRead: (id) => api.patch(`/admin/contact/messages/${id}/read`),
  getUnreadCount: () => api.get('/admin/contact/messages/unread/count'),
};

// Auth API
export const authAPI = {
  register: (registerData) => api.post('/auth/register', registerData),
  login: (loginData) => api.post('/auth/login', loginData),
  logout: (token) => api.post('/auth/logout', null, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getCurrentUser: () => api.get('/auth/me'),
  adminUpdateUser: (userId, updateData) => api.put(`/auth/users/${userId}/admin-update`, updateData),
  userUpdateSelf: (userId, updateData) => api.put(`/auth/users/${userId}/user-update`, updateData),
};

// Reviews API
export const reviewAPI = {
  getProductReviews: (productId) => api.get(`/products/${productId}/reviews`),
  createReview: (productId, reviewData) => api.post(`/products/${productId}/reviews`, reviewData),
  updateReview: (productId, reviewId, reviewData) => api.put(`/products/${productId}/reviews/${reviewId}`, reviewData),
  deleteReview: (productId, reviewId) => api.delete(`/products/${productId}/reviews/${reviewId}`),
  checkUserReviewed: (productId) => api.get(`/products/${productId}/reviews/check`),
};

// Admin Reviews API
export const adminReviewAPI = {
  getAll: (params) => api.get('/admin/reviews', { params }),
  getById: (id) => api.get(`/admin/reviews/${id}`),
  updateStatus: (id, status) => api.patch(`/admin/reviews/${id}/status?status=${status}`),
  delete: (id) => api.delete(`/admin/reviews/${id}`),
};

export default api;

