package com.vestshop.repository;

import com.vestshop.entity.Review;
import com.vestshop.enums.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    // Tìm đánh giá theo sản phẩm và trạng thái
    List<Review> findByProductIdAndStatus(Integer productId, ReviewStatus status);
    // Tìm đánh giá theo sản phẩm (tất cả trạng thái)
    List<Review> findByProductId(Integer productId);
    // Tìm đánh giá theo người dùng (sử dụng @Query vì User có userId, không phải id)
    @Query("SELECT r FROM Review r WHERE r.user.userId = :userId")
    List<Review> findByUserId(@Param("userId") Integer userId);
    // Tìm đánh giá theo sản phẩm và người dùng (để kiểm tra user đã đánh giá chưa)
    @Query("SELECT r FROM Review r WHERE r.product.id = :productId AND r.user.userId = :userId")
    Optional<Review> findByProductIdAndUserId(@Param("productId") Integer productId, @Param("userId") Integer userId);
    // Đếm số đánh giá theo sản phẩm và trạng thái
    Integer countByProductIdAndStatus(Integer productId, ReviewStatus status);
}

