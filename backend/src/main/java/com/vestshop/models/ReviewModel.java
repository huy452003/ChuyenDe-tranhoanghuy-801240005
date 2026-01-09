package com.vestshop.models;

import com.vestshop.enums.ReviewStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewModel {
    private Long id;
    
    // productId không cần validate vì lấy từ path variable
    private Long productId;
    
    private String productName; // Để hiển thị, không cần validate
    
    // userId không cần validate vì lấy từ token trong controller
    private Long userId;
    
    private String userFullname; // Để hiển thị, không cần validate
    
    private String username; // Để hiển thị, không cần validate
    
    @NotNull(message = "Đánh giá sao không được để trống")
    @Min(value = 1, message = "Đánh giá sao phải từ 1 đến 5")
    @Max(value = 5, message = "Đánh giá sao phải từ 1 đến 5")
    private Integer rating;
    
    @NotBlank(message = "Bình luận không được để trống")
    private String comment;
    
    private ReviewStatus status;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

