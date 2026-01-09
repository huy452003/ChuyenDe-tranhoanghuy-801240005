import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import About from './pages/About'
import Contact from './pages/Contact'
import UserDashboard from './pages/UserDashboard'

// Admin pages
import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import ProductList from './pages/admin/ProductList'
import ProductForm from './pages/admin/ProductForm'
import OrderList from './pages/admin/OrderList'
import UserList from './pages/admin/UserList'
import AdminProfile from './pages/admin/AdminProfile'
import ContactMessages from './pages/admin/ContactMessages'
import ReviewList from './pages/admin/ReviewList'

// Protected Route
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Auth Routes - redirect to home and open modal */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />

      {/* Customer Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route 
          path="user/dashboard" 
          element={
            <ProtectedRoute requireAdmin={false}>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Admin Routes (Protected) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/edit/:id" element={<ProductForm />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="users" element={<UserList />} />
        <Route path="contact-messages" element={<ContactMessages />} />
        <Route path="reviews" element={<ReviewList />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>
    </Routes>
  )
}

export default App

