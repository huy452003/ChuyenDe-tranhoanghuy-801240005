package com.vestshop.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.PastOrPresent;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.vestshop.enums.Gender;
import com.vestshop.utils.AgeUtils;
import jakarta.validation.constraints.AssertTrue;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RegisterModel {

    @NotBlank(message = "tài khoản không được để trống")
    @NotNull(message = "tài khoản không được để trống")
    @Size(min = 3, max = 50, message = "tài khoản phải có ít nhất 3 ký tự và tối đa 50 ký tự")
    private String username;

    @NotBlank(message = "mật khẩu không được để trống")
    @NotNull(message = "mật khẩu không được để trống")
    @Size(min = 6, message = "mật khẩu có ít nhất 6 ký tự")
    private String password;

    @NotBlank(message = "họ và tên không được để trống")
    @NotNull(message = "họ và tên không được để trống")
    @Size(max = 50, message = "họ và tên chỉ được có tối đa 50 ký tự")
    private String fullname;

    @NotNull(message = "giới tính không được để trống")
    private Gender gender;

    @NotBlank(message = "email không được để trống")
    @NotNull(message = "email không được để trống")
    @Email(message = "email không hợp lệ")
    private String email;

    @NotBlank(message = "số điện thoại không được để trống")
    @NotNull(message = "số điện thoại không được để trống")
    @Size(max = 11, min = 10, message = "số điện thoại phải có ít nhất 10 ký tự và tối đa 11 ký tự")
    private String phone;

    @NotNull(message = "ngày sinh không được để trống")
    @JsonFormat(pattern = "dd-MM-yyyy")
    @PastOrPresent(message = "bạn đang nhập vào ngày tương lai, vui lòng nhập đúng ngày sinh!")
    private LocalDate birth;

    @NotBlank(message = "địa chỉ không được để trống")
    @NotNull(message = "địa chỉ không được để trống")
    @Size(min = 1, max = 255, message = "địa chỉ phải có từ 1 đến 255 ký tự")
    private String address;

    @AssertTrue(message = "Bạn phải đủ 16 tuổi trở lên mới được đăng ký tài khoản")
    public boolean isAgeValid() {
        if (birth == null) {
            return false; // Đã có @NotNull validation cho birth
        }
        Integer age = AgeUtils.calculateAge(birth);
        return age != null && age >= 16;
    }

}
