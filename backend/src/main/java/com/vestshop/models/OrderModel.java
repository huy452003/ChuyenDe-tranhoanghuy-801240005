package com.vestshop.models;

import com.vestshop.enums.OrderStatus;
import com.vestshop.enums.PaymentMethod;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import jakarta.validation.Valid;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderModel {
    private Integer id;
    
    @NotBlank(message = "họ và tên không được để trống")
    @Size(max = 100, message = "họ và tên chỉ được có tối đa 100 ký tự")
    private String fullName;
    
    @NotBlank(message = "email không được để trống")
    @Email(message = "email không hợp lệ")
    @Size(max = 100, message = "email chỉ được có tối đa 100 ký tự")
    private String email;
    
    @NotBlank(message = "số điện thoại không được để trống")
    @Size(min = 10, max = 11, message = "số điện thoại phải có từ 10 đến 11 ký tự")
    private String phone;
    
    @NotBlank(message = "địa chỉ không được để trống")
    @Size(min = 1, max = 10, message = "địa chỉ phải có từ 1 đến 10 ký tự")
    private String address;
    
    @NotBlank(message = "tỉnh/thành phố không được để trống")
    @Size(max = 100, message = "tỉnh/thành phố chỉ được có tối đa 100 ký tự")
    private String city;
    
    @NotBlank(message = "quận/huyện không được để trống")
    @Size(max = 100, message = "quận/huyện chỉ được có tối đa 100 ký tự")
    private String district;
    
    @NotBlank(message = "phường/xã không được để trống")
    @Size(max = 100, message = "phường/xã chỉ được có tối đa 100 ký tự")
    private String ward;
    
    @Size(max = 500, message = "ghi chú chỉ được có tối đa 500 ký tự")
    private String note;
    
    @NotNull(message = "tổng tiền không được để trống")
    @Positive(message = "tổng tiền phải lớn hơn 0")
    private Integer totalAmount;
    
    @NotNull(message = "phương thức thanh toán không được để trống")
    private PaymentMethod paymentMethod;
    
    private OrderStatus status;
    
    @NotNull(message = "danh sách sản phẩm không được để trống")
    @Size(min = 1, message = "đơn hàng phải có ít nhất 1 sản phẩm")
    @Valid
    private List<OrderItemModel> items;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

