package com.vestshop.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemModel {
    private Integer id;
    
    @NotNull(message = "mã sản phẩm không được để trống")
    @Positive(message = "mã sản phẩm phải lớn hơn 0")
    private Integer productId;
    
    @NotBlank(message = "tên sản phẩm không được để trống")
    @Size(max = 200, message = "tên sản phẩm chỉ được có tối đa 200 ký tự")
    private String productName;
    
    @NotBlank(message = "size không được để trống")
    @Size(max = 10, message = "size chỉ được có tối đa 10 ký tự")
    private String size;
    
    @NotNull(message = "số lượng không được để trống")
    @Positive(message = "số lượng phải lớn hơn 0")
    private Integer quantity;
    
    @NotNull(message = "giá không được để trống")
    @Positive(message = "giá phải lớn hơn 0")
    private Integer price;
}

