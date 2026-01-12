package com.vestshop.controller;

import com.vestshop.models.UserModel;
import com.vestshop.models.UpdateUserModel;
import com.vestshop.models.RegisterModel;
import com.vestshop.models.LoginModel;
import com.vestshop.services.AuthService;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;


import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {
    @Autowired
    private AuthService authService;

    // Đăng ký user
    @PostMapping("/register")
    public ResponseEntity<UserModel> register(@Valid @RequestBody RegisterModel request){ 
        UserModel userModel = authService.register(request);
        return ResponseEntity.ok(userModel);
    }

    // Đăng nhập user
    @PostMapping("/login")
    public ResponseEntity<UserModel> login(@Valid @RequestBody LoginModel request){
        UserModel userModel = authService.login(request);
        return ResponseEntity.ok(userModel);
    }
        
    // Đăng xuất user
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(@RequestHeader("Authorization") String authHeader){
        String token = authHeader.substring(7);
        Map<String, Object> logoutResponse = authService.logout(token);

        return ResponseEntity.ok(logoutResponse);
    }

    // Lấy thông tin user hiện tại
    @GetMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<UserModel> getCurrentUser(@RequestHeader("Authorization") String authHeader){
        String token = authHeader.substring(7);
        String username = authService.getUsernameFromToken(token);
        UserModel user = authService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }

    // Cập nhật role, username, password, status - chỉ cho ADMIN
    @PutMapping("/users/{userId}/admin-update")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<UserModel> adminUpdateUser(
        @PathVariable("userId") Integer userId,
        @Valid @RequestBody UpdateUserModel updateDto,
        @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.substring(7);
        String username = authService.getUsernameFromToken(token);
        UserModel currentUser = authService.getUserByUsername(username);

        updateDto.setUserId(userId);
        UserModel updatedUser = authService.adminUpdateUser(updateDto, currentUser);
        return ResponseEntity.ok(updatedUser);
    }

    // Cập nhật thông tin user
    @PutMapping("/users/{userId}/user-update")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<UserModel> userUpdateSelf(
        @PathVariable("userId") Integer userId,
        @Valid @RequestBody UpdateUserModel updateDto,
        @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.substring(7);
        String username = authService.getUsernameFromToken(token);
        UserModel currentUser = authService.getUserByUsername(username);

        updateDto.setUserId(userId);
        UserModel updatedUser = authService.userUpdateSelf(updateDto, currentUser);
        return ResponseEntity.ok(updatedUser);
    }
    

}
