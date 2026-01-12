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
    private Integer id;
    
    // Lấy productId từ path variable
    private Integer productId;
    
    // Hiển thị tên sản phẩm, không cần validate
    private String productName; 
    
    // Lấy userId từ token trong controller
    private Integer userId;
    
    // Hiển thị tên người dùng, không cần validate
    private String userFullname; 
    
    // Hiển thị tên đăng nhập, không cần validate
    private String username; 
    
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

