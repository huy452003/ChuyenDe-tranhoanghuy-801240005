package com.vestshop.models;

import java.time.LocalDate;

import com.vestshop.enums.UserStatus;
import com.vestshop.enums.Role;
import com.vestshop.enums.Gender;
import com.vestshop.utils.AgeUtils;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserModel {

    private Integer userId;
    private String username;
    private String fullname;
    @Deprecated // Sử dụng getAge() method thay vì field này
    private Integer age; // Giữ lại để backward compatibility, nhưng sẽ tính từ birth
    private Gender gender;
    private String email;
    private String phone;
    private LocalDate birth;
    private String address;
    private Role role;
    private UserStatus status;
    private String accessToken;
    private String expires;
    private String refreshToken;
    private String refExpires;
    
    public Integer getAge() {
        return AgeUtils.calculateAge(this.birth);
    }
    
}
