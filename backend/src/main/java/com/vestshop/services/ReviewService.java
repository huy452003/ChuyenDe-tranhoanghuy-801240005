package com.vestshop.services;

import com.vestshop.enums.ReviewStatus;
import com.vestshop.models.ReviewModel;
import com.vestshop.models.PageResponseModel;

import java.util.List;

public interface ReviewService {
    
    // Tạo đánh giá mới
    ReviewModel createReview(Integer productId, Integer userId, ReviewModel reviewModel);
    
    // Lấy danh sách đánh giá của sản phẩm (chỉ ACTIVE)
    List<ReviewModel> getProductReviews(Integer productId);
    
    // Lấy tất cả đánh giá của sản phẩm (bao gồm cả HIDDEN - cho admin)
    List<ReviewModel> getAllProductReviews(Integer productId);
    
    // Lấy đánh giá theo ID
    ReviewModel getReviewById(Integer reviewId);
    
    // Cập nhật đánh giá (chỉ user sở hữu)
    ReviewModel updateReview(Integer reviewId, Integer userId, ReviewModel reviewModel);
    
    // Xóa đánh giá (chỉ user sở hữu - soft delete)
    void deleteReview(Integer reviewId, Integer userId);
    
    // Admin: Lấy tất cả đánh giá (có filter)
    List<ReviewModel> getAllReviews(Integer productId, Integer userId, ReviewStatus status);
    
    // Admin: Cập nhật trạng thái đánh giá
    ReviewModel updateReviewStatus(Integer reviewId, ReviewStatus status);
    
    // Admin: Xóa đánh giá (hard delete)
    void deleteReviewByAdmin(Integer reviewId);
    
    // Tính rating trung bình của sản phẩm
    Double getAverageRating(Integer productId);
    
    // Đếm số lượng đánh giá của sản phẩm
    Integer getReviewCount(Integer productId);
    
    // Kiểm tra user đã đánh giá sản phẩm chưa
    boolean hasUserReviewed(Integer productId, Integer userId);
    
    // Kiểm tra user đã mua sản phẩm và đơn hàng đã thành công chưa
    boolean hasUserPurchasedProduct(Integer productId, Integer userId);
    
    // Đếm số lượng đơn hàng đã thành công của sản phẩm (để hiển thị "lượt mua")
    Integer getCompletedOrderCount(Integer productId);
    
    // Admin: Lấy tất cả đánh giá có phân trang (có filter)
    PageResponseModel<ReviewModel> getAllReviewsPaginated(int page, int size, Integer productId, Integer userId, ReviewStatus status);
}

