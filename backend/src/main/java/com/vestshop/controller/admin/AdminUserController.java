package com.vestshop.controller.admin;

import com.vestshop.enums.Gender;
import com.vestshop.enums.Role;
import com.vestshop.enums.UserStatus;
import com.vestshop.models.UserModel;
import com.vestshop.services.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminUserController {

    @Autowired
    private UserService userService;

    // Lấy danh sách tất cả users (chỉ USER, không bao gồm ADMIN) với filter chi tiết
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<UserModel>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String fullname,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) Gender gender,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate birthFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate birthTo
    ) {
        List<UserModel> users;
        
        // Nếu có search keyword, dùng search trước rồi filter
        if (search != null && !search.trim().isEmpty()) {
            users = userService.searchUsers(search.trim());
            // Loại bỏ ADMIN
            users = users.stream()
                    .filter(user -> user.getRole() == Role.USER)
                    .collect(java.util.stream.Collectors.toList());
        } else {
            // Dùng filter chi tiết
            users = userService.filterUsers(fullname, email, phone, gender, status, birthFrom, birthTo);
        }
        
        return ResponseEntity.ok(users);
    }

    // Lấy user theo ID
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{userId}")
    public ResponseEntity<UserModel> getUserById(@PathVariable Integer userId) {
        UserModel user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    // Cập nhật role của user
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{userId}/role")
    public ResponseEntity<UserModel> updateUserRole(
            @PathVariable Integer userId,
            @RequestParam Role role
    ) {
        UserModel updatedUser = userService.updateUserRole(userId, role);
        return ResponseEntity.ok(updatedUser);
    }

    // Cập nhật status của user
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{userId}/status")
    public ResponseEntity<UserModel> updateUserStatus(
            @PathVariable Integer userId,
            @RequestParam UserStatus status
    ) {
        UserModel updatedUser = userService.updateUserStatus(userId, status);
        return ResponseEntity.ok(updatedUser);
    }
}

