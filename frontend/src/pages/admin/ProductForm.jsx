import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminProductAPI } from '../../services/api'

function ProductForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    salePrice: '',
    category: 'Classic',
    description: '',
    stock: '',
    images: [''],
    details: [''],
    status: 'ACTIVE'
  })

  useEffect(() => {
    if (isEditMode) {
      loadProductData();
    }
  }, [id, isEditMode]);

  const loadProductData = async () => {
    try {
      const response = await productAPI.getById(id);
      const product = response.data;
      if (product) {
        setFormData({
          name: product.name || '',
          price: product.price?.toString() || '',
          salePrice: product.salePrice?.toString() || '',
          category: product.category || 'Classic',
          description: product.description || '',
          stock: product.stock?.toString() || '',
          images: product.images && product.images.length > 0 ? product.images : [''],
          details: product.details && product.details.length > 0 ? product.details : [''],
          status: product.status || 'ACTIVE' // Đảm bảo uppercase
        });
      }
    } catch (error) {
      console.error('Error loading product:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleArrayChange = (index, value, field) => {
    const newArray = [...formData[field]]
    newArray[index] = value
    setFormData({
      ...formData,
      [field]: newArray
    })
  }

  const addArrayField = (field) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    })
  }

  const removeArrayField = (index, field) => {
    const newArray = formData[field].filter((_, i) => i !== index)
    setFormData({
      ...formData,
      [field]: newArray
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const productData = {
        name: formData.name,
        price: parseInt(formData.price.toString().replace(/\./g, '')), // Xóa dấu chấm
        salePrice: formData.salePrice ? parseInt(formData.salePrice.toString().replace(/\./g, '')) : null,
        category: formData.category,
        description: formData.description,
        stock: parseInt(formData.stock.toString().replace(/\./g, '')), // Xóa dấu chấm
        images: formData.images.filter(img => img.trim() !== ''),
        details: formData.details.filter(detail => detail.trim() !== ''),
        status: formData.status // Đã là ACTIVE rồi, không cần .toUpperCase()
      };
      
      console.log('Sending product data:', productData); // Debug

      if (isEditMode) {
        // Update existing product
        await adminProductAPI.update(id, productData);
      } else {
        // Create new product
        await adminProductAPI.create(productData);
      }

      alert(isEditMode ? 'Đã cập nhật sản phẩm!' : 'Đã thêm sản phẩm mới!');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Có lỗi xảy ra! Vui lòng thử lại.');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold">
          {isEditMode ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
        </h1>
        <button
          onClick={() => navigate('/admin/products')}
          className="btn-outline"
        >
          Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-serif font-semibold mb-6">Thông Tin Cơ Bản</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên sản phẩm *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Nhập tên sản phẩm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá gốc *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="3500000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá giảm (tùy chọn)
                  </label>
                  <input
                    type="number"
                    name="salePrice"
                    value={formData.salePrice}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="2999000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Để trống nếu không giảm giá
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Danh mục *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="input-field"
                    >
                      <option value="Classic">Classic</option>
                      <option value="Premium">Premium</option>
                      <option value="Business">Business</option>
                      <option value="Modern">Modern</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="input-field"
                    placeholder="Mô tả chi tiết về sản phẩm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số lượng tồn kho *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="15"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-serif font-semibold mb-6">Hình Ảnh</h2>
              <div className="space-y-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => handleArrayChange(index, e.target.value, 'images')}
                      className="input-field"
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField(index, 'images')}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('images')}
                  className="btn-outline text-sm py-2"
                >
                  + Thêm ảnh
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-serif font-semibold mb-6">Thông Tin Chi Tiết</h2>
              <div className="space-y-3">
                {formData.details.map((detail, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      value={detail}
                      onChange={(e) => handleArrayChange(index, e.target.value, 'details')}
                      className="input-field"
                      placeholder="Chất liệu: Vải wool 100%"
                    />
                    {formData.details.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField(index, 'details')}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('details')}
                  className="btn-outline text-sm py-2"
                >
                  + Thêm chi tiết
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-serif font-semibold mb-6">Trạng Thái</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái sản phẩm
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="ACTIVE">Đang bán</option>
                  <option value="OUT_OF_STOCK">Hết hàng</option>
                  <option value="HIDDEN">Ẩn</option>
                </select>
              </div>

              <button type="submit" className="btn-primary w-full mb-3">
                {isEditMode ? 'Cập nhật' : 'Thêm sản phẩm'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="btn-outline w-full"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ProductForm

