package com.vestshop.services.Imp;

import com.vestshop.entity.User;
import com.vestshop.enums.Gender;
import com.vestshop.enums.Role;
import com.vestshop.enums.UserStatus;
import com.vestshop.models.UserModel;
import com.vestshop.repository.UserRepository;
import com.vestshop.services.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import com.vestshop.models.PageResponseModel;

@Service
public class UserServiceImp implements UserService {

    @Autowired
    private UserRepository userRepository;

    // Lấy danh sách tất cả users
    @Override
    public List<UserModel> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }

    // Lấy user theo ID
    @Override
    public UserModel getUserById(Integer userId) {
        return userRepository.findById(userId)
                .map(this::convertToModel)
                .orElse(null);
    }

    // Tìm kiếm users theo keyword (username, fullname, email)
    @Override
    public List<UserModel> searchUsers(String keyword) {
        String lowerKeyword = keyword.toLowerCase();
        return userRepository.findAll().stream()
                .filter(user -> 
                    (user.getUsername() != null && user.getUsername().toLowerCase().contains(lowerKeyword)) ||
                    (user.getFullname() != null && user.getFullname().toLowerCase().contains(lowerKeyword)) ||
                    (user.getEmail() != null && user.getEmail().toLowerCase().contains(lowerKeyword)) ||
                    (user.getPhone() != null && user.getPhone().contains(keyword))
                )
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }

    // Lọc users theo role
    @Override
    public List<UserModel> getUsersByRole(Role role) {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == role)
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }

    // Lọc users theo status
    @Override
    public List<UserModel> getUsersByStatus(UserStatus status) {
        return userRepository.findByStatus(status).stream()
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }


    // Lọc users theo role và status
    @Override
    public List<UserModel> getUsersByRoleAndStatus(Role role, UserStatus status) {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == role && user.getStatus() == status)
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }

    // Lọc users theo nhiều tiêu chí
    @Override
    public List<UserModel> filterUsers(String fullname, String email, String phone, Gender gender, UserStatus status, LocalDate birthFrom, LocalDate birthTo) {
        return userRepository.findAll().stream()
                .filter(user -> {
                    // Chỉ lấy USER, không lấy ADMIN - để tránh lấy quyền ADMIN
                    if (user.getRole() != Role.USER) {
                        return false;
                    }
                    
                    // Lọc theo fullname
                    if (fullname != null && !fullname.trim().isEmpty()) {
                        if (user.getFullname() == null || !user.getFullname().toLowerCase().contains(fullname.toLowerCase().trim())) {
                            return false;
                        }
                    }
                    
                    // Lọc theo email
                    if (email != null && !email.trim().isEmpty()) {
                        if (user.getEmail() == null || !user.getEmail().toLowerCase().contains(email.toLowerCase().trim())) {
                            return false;
                        }
                    }
                    
                    // Lọc theo phone
                    if (phone != null && !phone.trim().isEmpty()) {
                        if (user.getPhone() == null || !user.getPhone().contains(phone.trim())) {
                            return false;
                        }
                    }
                    
                    // Lọc theo gender
                    if (gender != null) {
                        if (user.getGender() != gender) {
                            return false;
                        }
                    }
                    
                    // Lọc theo status
                    if (status != null) {
                        if (user.getStatus() != status) {
                            return false;
                        }
                    }
                    
                    // Lọc theo birth date range
                    if (birthFrom != null || birthTo != null) {
                        if (user.getBirth() == null) {
                            return false;
                        }
                        if (birthFrom != null && user.getBirth().isBefore(birthFrom)) {
                            return false;
                        }
                        if (birthTo != null && user.getBirth().isAfter(birthTo)) {
                            return false;
                        }
                    }
                    
                    return true;
                })
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }

    // Cập nhật role user (chỉ admin)
    @Override
    public UserModel updateUserRole(Integer userId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setRole(role);
        User savedUser = userRepository.save(user);
        return convertToModel(savedUser);
    }

    // Cập nhật trạng thái user (chỉ admin)
    @Override
    public UserModel updateUserStatus(Integer userId, UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setStatus(status);
        User savedUser = userRepository.save(user);
        return convertToModel(savedUser);
    }


    // Chuyển đổi từ User sang UserModel
    private UserModel convertToModel(User user) {
        return UserModel.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .fullname(user.getFullname())
                .age(null) // Tính từ birth - cần tính toán từ ngày sinh
                .gender(user.getGender())
                .email(user.getEmail())
                .phone(user.getPhone())
                .birth(user.getBirth())
                .address(user.getAddress())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }
    
    // Lấy danh sách users có phân trang (cho admin)
    @Override
    public PageResponseModel<UserModel> getAllUsersPaginated(int page, int size) {
        // Kiểm tra page và size
        if (page < 0) page = 0;
        if (size < 1) size = 10; // Kích thước mặc định là 10
        
        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage = userRepository.findAll(pageable);
        
        // Chuyển đổi từ User sang UserModel
        List<UserModel> content = userPage.getContent().stream()
            .map(user -> convertToModel(user))
            .collect(Collectors.toList());
        
        // Tạo PageResponse
        PageResponseModel<UserModel> response = new PageResponseModel<>();
        response.setContent(content);
        response.setPage(userPage.getNumber());
        response.setSize(userPage.getSize());
        response.setTotalElements(userPage.getTotalElements());
        response.setTotalPages(userPage.getTotalPages());
        response.setFirst(userPage.isFirst());
        response.setLast(userPage.isLast());
        
        return response;
    }
}

