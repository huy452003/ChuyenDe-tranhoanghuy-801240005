package com.vestshop.services;

import com.vestshop.config.JwtConfig;
import com.vestshop.entity.User;
import com.vestshop.repository.UserRepository;
import com.vestshop.models.LoginModel;
import com.vestshop.models.RegisterModel;
import com.vestshop.models.UserModel;
import com.vestshop.models.UpdateUserModel;
import com.vestshop.enums.UserStatus;
import com.vestshop.enums.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.modelmapper.ModelMapper;


import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;


@Service
public class AuthService {
    @Autowired
    UserRepository userRepository;
    @Autowired
    PasswordEncoder passwordEncoder;
    @Autowired
    JwtService jwtService;
    @Autowired
    AuthenticationManager authenticationManager;
    @Autowired
    JwtConfig jwtConfig;
    @Autowired
    ModelMapper modelMapper;

    private String formatExpirationTime(Long expirationMillis) {
        LocalDateTime expirationTime = LocalDateTime.now().plusSeconds(expirationMillis / 1000); // Chuyển đổi từ milliseconds sang seconds
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return expirationTime.format(formatter);
    }

    @Transactional(rollbackFor = Exception.class)
    public UserModel register(RegisterModel request){
        // Kiểm tra username đã tồn tại chưa
        if(userRepository.existsByUsername(request.getUsername())){
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        
        // Kiểm tra email đã tồn tại chưa
        if(userRepository.existsByEmail(request.getEmail())){
            throw new RuntimeException("Email đã được sử dụng");
        }
        
        // Kiểm tra phone đã tồn tại chưa
        if(userRepository.existsByPhone(request.getPhone())){
            throw new RuntimeException("Số điện thoại đã được sử dụng");
        }

        // Gán role cho user
        Role userRole = Role.USER;
        
        // Tạo user mới
        User user = User.builder()
                    .username(request.getUsername())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .fullname(request.getFullname())
                    .age(null) // Không lưu age nữa, sẽ tính từ birth
                    .gender(request.getGender())
                    .birth(request.getBirth())
                    .phone(request.getPhone())
                    .email(request.getEmail())
                    .address(request.getAddress())
                    .role(userRole)
                    .status(UserStatus.ACTIVE)
                    .build();

        // Lưu user vào database
        User savedUser = userRepository.saveAndFlush(user);

        // Tạo custom claims cho token
        Map<String, Object> claim = new HashMap<>();
        claim.put("role", savedUser.getRole().name());
        
        // Tạo access token và refresh token
        String accessToken = jwtService.generateToken(claim, savedUser);
        String refreshToken = jwtService.generateRefreshToken(claim, savedUser);

        return UserModel.builder()
                .userId(savedUser.getUserId())
                .username(savedUser.getUsername())
                .age(null) // Không lưu age, sẽ tính từ birth trong getAge()
                .gender(savedUser.getGender())
                .birth(savedUser.getBirth())
                .phone(savedUser.getPhone())
                .email(savedUser.getEmail()) 
                .role(savedUser.getRole())
                .status(savedUser.getStatus())
                .accessToken(accessToken)
                .expires(formatExpirationTime(jwtConfig.getExpiration()))
                .refreshToken(refreshToken)
                .refExpires(formatExpirationTime(jwtConfig.getRefreshExpiration()))
                .build();
    }

    public UserModel login(LoginModel request){
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        // Kiểm tra status của user
        if (user.getStatus() == UserStatus.DISABLED) {
            throw new RuntimeException("Tài khoản đã bị vô hiệu hóa");
        }

        // Tạo custom claims cho token
        Map<String, Object> claim = new HashMap<>();
        claim.put("role", user.getRole().name());
        
        // Tạo access token và refresh token
        String accessToken = jwtService.generateToken(claim, user);
        String refreshToken = jwtService.generateRefreshToken(claim, user);

        return UserModel.builder()
                .status(user.getStatus())
                .userId(user.getUserId())
                .username(user.getUsername())
                .age(null) // Không lưu age, sẽ tính từ birth trong getAge()
                .gender(user.getGender())
                .birth(user.getBirth())
                .phone(user.getPhone())
                .email(user.getEmail()) 
                .role(user.getRole())
                .status(user.getStatus())
                .accessToken(accessToken)
                .expires(formatExpirationTime(jwtConfig.getExpiration()))
                .refreshToken(refreshToken)
                .refExpires(formatExpirationTime(jwtConfig.getRefreshExpiration()))
                .build();
    }

    public Map<String, Object> logout(String token) {
        Map<String, Object> logoutResponse = new HashMap<>();
        logoutResponse.put("username", getUsernameFromToken(token));
        logoutResponse.put("message", "Logged out successfully");
        logoutResponse.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        return logoutResponse;
    }

    // Lấy user theo username
    public UserModel getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Build UserModel manually to ensure all fields are included
        return UserModel.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .fullname(user.getFullname())
                .age(null) // Không lưu age, sẽ tính từ birth trong getAge()
                .gender(user.getGender())
                .email(user.getEmail())
                .phone(user.getPhone())
                .birth(user.getBirth())
                .address(user.getAddress())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }

    // Lấy username từ token
    public String getUsernameFromToken(String token) {
        try {
            return jwtService.extractUsername(token);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi xác thực token. Vui lòng đăng nhập lại");
        }
    }

    // Cập nhật thông tin người dùng bởi admin
    @Transactional(rollbackFor = Exception.class)
    public UserModel adminUpdateUser(UpdateUserModel updateDto, UserModel currentUser) {        
        // Kiểm tra chỉ ADMIN mới được update
        if (currentUser == null || currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("Chỉ quản trị viên mới có quyền cập nhật thông tin người dùng");
        }
        
        User user = userRepository.findById(updateDto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update username nếu có
        if (updateDto.getUsername() != null && !updateDto.getUsername().trim().isEmpty()) {
            String newUsername = updateDto.getUsername().trim();
            // Validate username length
            if (newUsername.length() < 3 || newUsername.length() > 50) {
                throw new RuntimeException("Tên đăng nhập phải có từ 3 đến 50 ký tự");
            }
            // Kiểm tra username đã tồn tại chưa (trừ chính user này)
            if (userRepository.existsByUsernameAndUserIdNot(newUsername, updateDto.getUserId())) {
                throw new RuntimeException("Tên đăng nhập đã tồn tại");
            }
            user.setUsername(newUsername);
        }
        
        // Update password nếu có
        if (updateDto.getPassword() != null && !updateDto.getPassword().trim().isEmpty()) {
            String newPassword = updateDto.getPassword().trim();
            // Validate password length
            if (newPassword.length() < 6) {
                throw new RuntimeException("Mật khẩu phải có ít nhất 6 ký tự");
            }
            user.setPassword(passwordEncoder.encode(newPassword));
        }
        
        // Update role nếu có (chỉ admin mới có thể thay đổi role)
        if (updateDto.getRole() != null) {
            user.setRole(updateDto.getRole());
        }
        
        // Update status - luôn update (required field)
        if (updateDto.getStatus() != null) {
            UserStatus newStatus = updateDto.getStatus();
            user.setStatus(newStatus);
        }

        // Update other fields
        if (updateDto.getFullname() != null && !updateDto.getFullname().trim().isEmpty()) {
            user.setFullname(updateDto.getFullname().trim());
        }
        // Age không còn được lưu, sẽ tính từ birth - bỏ qua updateDto.getAge()
        if (updateDto.getGender() != null) {
            user.setGender(updateDto.getGender());
        }
        if (updateDto.getEmail() != null && !updateDto.getEmail().trim().isEmpty()) {
            String newEmail = updateDto.getEmail().trim();
            // Kiểm tra email đã tồn tại chưa (trừ chính user này)
            if (userRepository.existsByEmailAndUserIdNot(newEmail, updateDto.getUserId())) {
                throw new RuntimeException("Email đã được sử dụng");
            }
            user.setEmail(newEmail);
        }
        if (updateDto.getPhone() != null && !updateDto.getPhone().trim().isEmpty()) {
            String newPhone = updateDto.getPhone().trim();
            // Kiểm tra phone đã tồn tại chưa (trừ chính user này)
            if (userRepository.existsByPhoneAndUserIdNot(newPhone, updateDto.getUserId())) {
                throw new RuntimeException("Số điện thoại đã được sử dụng");
            }
            user.setPhone(newPhone);
        }
        if (updateDto.getBirth() != null) {
            user.setBirth(updateDto.getBirth());
        }
        if (updateDto.getAddress() != null && !updateDto.getAddress().trim().isEmpty()) {
            user.setAddress(updateDto.getAddress().trim());
        }

        User savedUser = userRepository.saveAndFlush(user);
        
        return modelMapper.map(savedUser, UserModel.class);
    }

    // Cập nhật thông tin người dùng bởi chính user đó
    public UserModel userUpdateSelf(UpdateUserModel updateDto, UserModel currentUser) {
        if (currentUser == null || updateDto.getUserId() == null) {
            throw new RuntimeException("Thông tin người dùng là bắt buộc");
        }
        // Use .equals() for Integer comparison, and allow admin to update their own info
        if (!currentUser.getUserId().equals(updateDto.getUserId())) {
            throw new RuntimeException("Bạn chỉ có thể cập nhật thông tin của chính mình");
        }
        
        User user = userRepository.findById(updateDto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update username nếu có
        if (updateDto.getUsername() != null && !updateDto.getUsername().trim().isEmpty()) {
            if (userRepository.existsByUsernameAndUserIdNot(updateDto.getUsername().trim(), updateDto.getUserId())) {
                throw new RuntimeException("Tên đăng nhập đã tồn tại");
            }
            String newUsername = updateDto.getUsername().trim();
            // Validate username length
            if (newUsername.length() < 3 || newUsername.length() > 50) {
                throw new RuntimeException("Tên đăng nhập phải có từ 3 đến 50 ký tự");
            }
            user.setUsername(newUsername);
        }

        // Update password nếu có - yêu cầu xác thực password cũ
        if (updateDto.getPassword() != null && !updateDto.getPassword().trim().isEmpty()) {
            // Yêu cầu nhập password cũ để xác thực
            if (updateDto.getCurrentPassword() == null || updateDto.getCurrentPassword().trim().isEmpty()) {
                throw new RuntimeException("Vui lòng nhập mật khẩu hiện tại để xác thực");
            }
            
            // Verify password cũ
            String currentPassword = updateDto.getCurrentPassword().trim();
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                throw new RuntimeException("Mật khẩu hiện tại không đúng");
            }
            
            String newPassword = updateDto.getPassword().trim();
            // Validate password length
            if (newPassword.length() < 6) {
                throw new RuntimeException("Mật khẩu phải có ít nhất 6 ký tự");
            }
            
            // Kiểm tra mật khẩu mới không được giống mật khẩu cũ
            if (passwordEncoder.matches(newPassword, user.getPassword())) {
                throw new RuntimeException("Mật khẩu mới không được giống mật khẩu cũ");
            }
            
            user.setPassword(passwordEncoder.encode(newPassword));
        }

        // Update other fields
        if (updateDto.getFullname() != null && !updateDto.getFullname().trim().isEmpty()) {
            user.setFullname(updateDto.getFullname().trim());
        }
        // Age không còn được lưu, sẽ tính từ birth - bỏ qua updateDto.getAge()
        if (updateDto.getGender() != null) {
            user.setGender(updateDto.getGender());
        }
        if (updateDto.getEmail() != null && !updateDto.getEmail().trim().isEmpty()) {
            String newEmail = updateDto.getEmail().trim();
            // Kiểm tra email đã tồn tại chưa (trừ chính user này)
            if (userRepository.existsByEmailAndUserIdNot(newEmail, updateDto.getUserId())) {
                throw new RuntimeException("Email đã được sử dụng");
            }
            user.setEmail(newEmail);
        }
        if (updateDto.getPhone() != null && !updateDto.getPhone().trim().isEmpty()) {
            String newPhone = updateDto.getPhone().trim();
            // Kiểm tra phone đã tồn tại chưa (trừ chính user này)
            if (userRepository.existsByPhoneAndUserIdNot(newPhone, updateDto.getUserId())) {
                throw new RuntimeException("Số điện thoại đã được sử dụng");
            }
            user.setPhone(newPhone);
        }
        if (updateDto.getBirth() != null) {
            user.setBirth(updateDto.getBirth());
        }
        if (updateDto.getAddress() != null && !updateDto.getAddress().trim().isEmpty()) {
            user.setAddress(updateDto.getAddress().trim());
        }

        User savedUser = userRepository.saveAndFlush(user);
        
        return modelMapper.map(savedUser, UserModel.class);
    }
    
}
