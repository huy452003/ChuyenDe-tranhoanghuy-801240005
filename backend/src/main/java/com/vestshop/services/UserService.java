package com.vestshop.services;

import com.vestshop.enums.Gender;
import com.vestshop.enums.Role;
import com.vestshop.enums.UserStatus;
import com.vestshop.models.UserModel;

import java.time.LocalDate;
import java.util.List;

public interface UserService {
    // Lấy danh sách tất cả users
    List<UserModel> getAllUsers();
    
    // Lấy user theo ID
    UserModel getUserById(Integer userId);
    
    // Tìm kiếm users theo keyword (username, fullname, email)
    List<UserModel> searchUsers(String keyword);
    
    // Lọc users theo role
    List<UserModel> getUsersByRole(Role role);
    
    // Lọc users theo status
    List<UserModel> getUsersByStatus(UserStatus status);
    
    // Lọc users theo role và status
    List<UserModel> getUsersByRoleAndStatus(Role role, UserStatus status);
    
    // Lọc users theo nhiều tiêu chí
    List<UserModel> filterUsers(String fullname, String email, String phone, Gender gender, UserStatus status, LocalDate birthFrom, LocalDate birthTo);
    
    // Cập nhật role của user (chỉ admin)
    UserModel updateUserRole(Integer userId, Role role);
    
    // Cập nhật status của user (chỉ admin)
    UserModel updateUserStatus(Integer userId, UserStatus status);
}

