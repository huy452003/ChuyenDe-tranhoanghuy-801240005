import { useState, useEffect } from 'react';
import { adminReviewAPI } from '../../services/api';
import RatingDisplay from '../../components/RatingDisplay';
import Pagination from '../../components/Pagination';

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'ALL', // ALL, ACTIVE, HIDDEN, DELETED
    productId: '',
    userId: ''
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 0) {
      setCurrentPage(0);
    }
  }, [filters.status, filters.productId, filters.userId]);

  useEffect(() => {
    loadReviews();
  }, [filters, currentPage]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (filters.status && filters.status !== 'ALL') {
        params.status = filters.status;
      }
      if (filters.productId && filters.productId.trim() !== '') {
        const productIdNum = parseInt(filters.productId);
        if (!isNaN(productIdNum)) {
          params.productId = productIdNum;
        }
      }
      if (filters.userId && filters.userId.trim() !== '') {
        const userIdNum = parseInt(filters.userId);
        if (!isNaN(userIdNum)) {
          params.userId = userIdNum;
        }
      }

      // Use pagination API
      const response = await adminReviewAPI.getAllPaginated(currentPage, pageSize, params);
      
      // Check if response has pagination info (PageResponse)
      if (response.data && response.data.content) {
        // Paginated response
        const data = response.data.content || [];
        setReviews(data);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || 0);
      } else {
        // Fallback: non-paginated response (backward compatible)
        const data = response.data || [];
        setReviews(data);
        setTotalPages(Math.ceil(data.length / pageSize));
        setTotalElements(data.length);
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách đánh giá');
      setReviews([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      await adminReviewAPI.updateStatus(reviewId, newStatus);
      // Reload reviews
      loadReviews();
    } catch (err) {
      console.error('Error updating review status:', err);
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái đánh giá');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) {
      return;
    }

    try {
      await adminReviewAPI.delete(reviewId);
      // Reload reviews
      loadReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
      alert(err.response?.data?.message || 'Không thể xóa đánh giá');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      ACTIVE: { label: 'Hiển thị', color: 'bg-green-100 text-green-800' },
      HIDDEN: { label: 'Ẩn', color: 'bg-yellow-100 text-yellow-800' },
      DELETED: { label: 'Đã xóa', color: 'bg-red-100 text-red-800' }
    };
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vest-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold text-vest-dark">Quản lý đánh giá</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-vest-gold focus:border-vest-gold"
            >
              <option value="ALL">Tất cả</option>
              <option value="ACTIVE">Hiển thị</option>
              <option value="HIDDEN">Ẩn</option>
              <option value="DELETED">Đã xóa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mã sản phẩm</label>
            <input
              type="number"
              value={filters.productId}
              onChange={(e) => setFilters({ ...filters, productId: e.target.value })}
              placeholder="Lọc theo mã sản phẩm"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-vest-gold focus:border-vest-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mã người dùng</label>
            <input
              type="number"
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              placeholder="Lọc theo mã người dùng"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-vest-gold focus:border-vest-gold"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: 'ALL', productId: '', userId: '' })}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px] max-w-[250px]">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người đánh giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đánh giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bình luận
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    Không có đánh giá nào
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{review.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-[250px] truncate" title={review.productName || `Sản phẩm #${review.productId}`}>
                        {review.productName || `Sản phẩm #${review.productId}`}
                      </div>
                      <div className="text-xs text-gray-500">ID: {review.productId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {review.userFullname || review.username || `User #${review.userId}`}
                      </div>
                      <div className="text-sm text-gray-500">@{review.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RatingDisplay rating={review.rating} reviewCount={null} showReviewCount={false} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={review.comment}>
                        {review.comment || '(Không có bình luận)'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(review.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {review.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleStatusChange(review.id, 'HIDDEN')}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Ẩn đánh giá"
                          >
                            Ẩn
                          </button>
                        )}
                        {review.status === 'HIDDEN' && (
                          <button
                            onClick={() => handleStatusChange(review.id, 'ACTIVE')}
                            className="text-green-600 hover:text-green-900"
                            title="Hiển thị đánh giá"
                          >
                            Hiển thị
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa đánh giá"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm text-gray-500">Tổng số đánh giá</div>
          <div className="text-2xl font-bold text-vest-dark">{totalElements}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm text-gray-500">Đang hiển thị</div>
          <div className="text-2xl font-bold text-green-600">
            {reviews.filter(r => r.status === 'ACTIVE').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm text-gray-500">Đã ẩn</div>
          <div className="text-2xl font-bold text-yellow-600">
            {reviews.filter(r => r.status === 'HIDDEN').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-sm text-gray-500">Đã xóa</div>
          <div className="text-2xl font-bold text-red-600">
            {reviews.filter(r => r.status === 'DELETED').length}
          </div>
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
          <div className="text-center mt-4 text-sm text-gray-500 bg-gray-50 rounded-lg py-3 px-4">
            <span className="font-medium text-gray-700">
              Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)}
            </span>
            <span className="text-gray-500"> trong tổng số </span>
            <span className="font-semibold text-vest-dark">{totalElements}</span>
            <span className="text-gray-500"> đánh giá</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewList;

