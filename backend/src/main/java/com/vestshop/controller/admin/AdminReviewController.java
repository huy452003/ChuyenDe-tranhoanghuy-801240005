package com.vestshop.controller.admin;

import com.vestshop.enums.ReviewStatus;
import com.vestshop.models.ReviewModel;
import com.vestshop.services.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminReviewController {

    @Autowired
    private ReviewService reviewService;

    // Lấy tất cả đánh giá (có filter)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<?> getAllReviews(
            @RequestParam(required = false) Integer productId,
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) ReviewStatus status,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        // Nếu có page hoặc size, trả về paginated response
        if (page != null || size != null) {
            int pageNum = page != null ? page : 0;
            int pageSize = size != null ? size : 10;
            return ResponseEntity.ok(reviewService.getAllReviewsPaginated(pageNum, pageSize, productId, userId, status));
        }
        // Nếu không có pagination params, trả về list như cũ
        return ResponseEntity.ok(reviewService.getAllReviews(productId, userId, status));
    }

    // Lấy đánh giá theo ID
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ReviewModel> getReviewById(@PathVariable Integer id) {
        ReviewModel review = reviewService.getReviewById(id);
        if (review == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(review);
    }

    // Cập nhật trạng thái đánh giá (ACTIVE/HIDDEN)
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<ReviewModel> updateReviewStatus(
            @PathVariable Integer id,
            @RequestParam ReviewStatus status) {
        try {
            ReviewModel updatedReview = reviewService.updateReviewStatus(id, status);
            return ResponseEntity.ok(updatedReview);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Xóa đánh giá (hard delete)
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Integer id) {
        try {
            reviewService.deleteReviewByAdmin(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

