package com.vestshop.models;

import com.vestshop.enums.ProductStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductModel {
    private Long id;
    
    @NotBlank(message = "tên sản phẩm không được để trống")
    @Size(max = 200, message = "tên sản phẩm chỉ được có tối đa 200 ký tự")
    private String name;
    
    @NotNull(message = "giá không được để trống")
    @Positive(message = "giá phải lớn hơn 0")
    private Long price;
    
    @PositiveOrZero(message = "giá giảm phải lớn hơn hoặc bằng 0")
    private Long salePrice; // Giá giảm
    
    @NotBlank(message = "danh mục không được để trống")
    @Size(max = 100, message = "danh mục chỉ được có tối đa 100 ký tự")
    private String category;
    
    @Size(max = 2000, message = "mô tả chỉ được có tối đa 2000 ký tự")
    private String description;
    
    @NotNull(message = "số lượng tồn kho không được để trống")
    @PositiveOrZero(message = "số lượng tồn kho phải lớn hơn hoặc bằng 0")
    private Integer stock;
    
    private List<String> images;
    private List<String> details;
    
    private ProductStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

