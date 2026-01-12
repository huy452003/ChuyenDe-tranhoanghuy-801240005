package com.vestshop.controller;

import com.vestshop.models.ReviewModel;
import com.vestshop.services.AuthService;
import com.vestshop.services.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@CrossOrigin(origins = "http://localhost:3000")
@Validated
public class ReviewController {

    @Autowired
    private ReviewService reviewService;
    
    @Autowired
    private AuthService authService;

    // Lấy danh sách đánh giá của sản phẩm (chỉ ACTIVE)
    @GetMapping
    public ResponseEntity<List<ReviewModel>> getProductReviews(@PathVariable Integer productId) {
        try {
            List<ReviewModel> reviews = reviewService.getProductReviews(productId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Tạo đánh giá mới
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createReview(
            @PathVariable Integer productId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody ReviewModel reviewModel) {
        try {
            // Lấy user ID từ token
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authorization header is missing or invalid");
            }
            String token = authHeader.substring(7);
            String username = authService.getUsernameFromToken(token);
            if (username == null || username.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid token: username is null or empty");
            }
            var currentUser = authService.getUserByUsername(username);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not found: " + username);
            }
            Integer userId = currentUser.getUserId();
            
            // Kiểm tra user đã đánh giá chưa
            if (reviewService.hasUserReviewed(productId, userId)) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Bạn đã đánh giá sản phẩm này rồi");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            ReviewModel createdReview = reviewService.createReview(productId, userId, reviewModel);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdReview);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error creating review: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Cập nhật đánh giá (chỉ user sở hữu)
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PutMapping("/{reviewId}")
    public ResponseEntity<?> updateReview(
            @PathVariable Integer productId,
            @PathVariable Integer reviewId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody ReviewModel reviewModel) {
        try {
            // Lấy user ID từ token
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authorization header is missing or invalid");
            }
            String token = authHeader.substring(7);
            String username = authService.getUsernameFromToken(token);
            if (username == null || username.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid token: username is null or empty");
            }
            var currentUser = authService.getUserByUsername(username);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not found: " + username);
            }
            Integer userId = currentUser.getUserId();
            
            ReviewModel updatedReview = reviewService.updateReview(reviewId, userId, reviewModel);
            return ResponseEntity.ok(updatedReview);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error updating review: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Xóa đánh giá (chỉ user sở hữu - soft delete)
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(
            @PathVariable Integer productId,
            @PathVariable Integer reviewId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Lấy user ID từ token
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authorization header is missing or invalid");
            }
            String token = authHeader.substring(7);
            String username = authService.getUsernameFromToken(token);
            if (username == null || username.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid token: username is null or empty");
            }
            var currentUser = authService.getUserByUsername(username);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not found: " + username);
            }
            Integer userId = currentUser.getUserId();
            
            reviewService.deleteReview(reviewId, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error deleting review: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // Kiểm tra user đã đánh giá sản phẩm chưa
    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkUserReviewed(
            @PathVariable Integer productId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                response.put("hasReviewed", false);
                return ResponseEntity.ok(response);
            }
            
            String token = authHeader.substring(7);
            String username;
            try {
                username = authService.getUsernameFromToken(token);
            } catch (Exception e) {
                // Token không hợp lệ - trả về false
                response.put("hasReviewed", false);
                return ResponseEntity.ok(response);
            }
            
            if (username == null || username.isEmpty()) {
                response.put("hasReviewed", false);
                return ResponseEntity.ok(response);
            }
            
            var currentUser = authService.getUserByUsername(username);
            if (currentUser == null) {
                response.put("hasReviewed", false);
                return ResponseEntity.ok(response);
            }
            
            Integer userId = currentUser.getUserId();
            boolean hasReviewed = reviewService.hasUserReviewed(productId, userId);
            response.put("hasReviewed", hasReviewed);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Log error for debugging
            System.err.println("Error in checkUserReviewed: " + e.getMessage());
            e.printStackTrace();
            // Trả về false nếu có lỗi
            response.put("hasReviewed", false);
            return ResponseEntity.ok(response);
        }
    }
}

