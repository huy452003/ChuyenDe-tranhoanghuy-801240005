package com.vestshop.models;

import com.vestshop.enums.Gender;
import com.vestshop.enums.UserStatus;
import com.vestshop.enums.Role;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserModel {
    private Integer userId;
    
    // Username và password là optional khi update (chỉ validate nếu có giá trị)
    @Size(min = 3, max = 50, message = "tài khoản phải có từ 3 đến 50 ký tự")
    private String username;
    
    @Size(min = 6, message = "mật khẩu phải có ít nhất 6 ký tự")
    private String password;
    
    @NotBlank(message = "họ và tên không được để trống")
    @Size(max = 50, message = "họ và tên chỉ được có tối đa 50 ký tự")
    private String fullname;
    
    @Deprecated // Không còn sử dụng, tuổi sẽ tính từ birth
    private Integer age; // Giữ lại để backward compatibility
    
    @NotNull(message = "giới tính không được để trống")
    private Gender gender;
    
    @NotBlank(message = "email không được để trống")
    @Email(message = "email không hợp lệ")
    @Size(max = 100, message = "email chỉ được có tối đa 100 ký tự")
    private String email;
    
    @NotBlank(message = "số điện thoại không được để trống")
    @Size(min = 10, max = 11, message = "số điện thoại phải có từ 10 đến 11 ký tự")
    private String phone;
    
    @NotNull(message = "ngày sinh không được để trống")
    @JsonFormat(pattern = "dd-MM-yyyy")
    @PastOrPresent(message = "ngày sinh không được là ngày tương lai")
    private LocalDate birth;
    
    @NotBlank(message = "địa chỉ không được để trống")
    @Size(min = 1, max = 255, message = "địa chỉ phải có từ 1 đến 255 ký tự")
    private String address;
    
    private Role role;
    private UserStatus status;

}
