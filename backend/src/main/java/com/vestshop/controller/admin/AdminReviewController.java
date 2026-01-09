package com.vestshop.controller.admin;

import com.vestshop.enums.ReviewStatus;
import com.vestshop.models.ReviewModel;
import com.vestshop.services.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminReviewController {

    @Autowired
    private ReviewService reviewService;

    // Lấy tất cả đánh giá (có filter)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<ReviewModel>> getAllReviews(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) ReviewStatus status) {
        List<ReviewModel> reviews = reviewService.getAllReviews(productId, userId, status);
        return ResponseEntity.ok(reviews);
    }

    // Lấy đánh giá theo ID
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ReviewModel> getReviewById(@PathVariable Long id) {
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
            @PathVariable Long id,
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
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        try {
            reviewService.deleteReviewByAdmin(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

