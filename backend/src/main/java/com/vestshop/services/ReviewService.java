package com.vestshop.services;

import com.vestshop.enums.ReviewStatus;
import com.vestshop.models.ReviewModel;

import java.util.List;

public interface ReviewService {
    
    // Tạo đánh giá mới
    ReviewModel createReview(Long productId, Long userId, ReviewModel reviewModel);
    
    // Lấy danh sách đánh giá của sản phẩm (chỉ ACTIVE)
    List<ReviewModel> getProductReviews(Long productId);
    
    // Lấy tất cả đánh giá của sản phẩm (bao gồm cả HIDDEN - cho admin)
    List<ReviewModel> getAllProductReviews(Long productId);
    
    // Lấy đánh giá theo ID
    ReviewModel getReviewById(Long reviewId);
    
    // Cập nhật đánh giá (chỉ user sở hữu)
    ReviewModel updateReview(Long reviewId, Long userId, ReviewModel reviewModel);
    
    // Xóa đánh giá (chỉ user sở hữu - soft delete)
    void deleteReview(Long reviewId, Long userId);
    
    // Admin: Lấy tất cả đánh giá (có filter)
    List<ReviewModel> getAllReviews(Long productId, Long userId, ReviewStatus status);
    
    // Admin: Cập nhật trạng thái đánh giá
    ReviewModel updateReviewStatus(Long reviewId, ReviewStatus status);
    
    // Admin: Xóa đánh giá (hard delete)
    void deleteReviewByAdmin(Long reviewId);
    
    // Tính rating trung bình của sản phẩm
    Double getAverageRating(Long productId);
    
    // Đếm số lượng đánh giá của sản phẩm
    Long getReviewCount(Long productId);
    
    // Kiểm tra user đã đánh giá sản phẩm chưa
    boolean hasUserReviewed(Long productId, Long userId);
    
    // Kiểm tra user đã mua sản phẩm và đơn hàng đã thành công chưa
    boolean hasUserPurchasedProduct(Long productId, Long userId);
    
    // Đếm số lượng đơn hàng đã thành công của sản phẩm (để hiển thị "lượt mua")
    Long getCompletedOrderCount(Long productId);
}

