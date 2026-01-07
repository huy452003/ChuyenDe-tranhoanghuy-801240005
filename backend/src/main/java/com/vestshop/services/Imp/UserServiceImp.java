package com.vestshop.services.Imp;

import com.vestshop.entity.User;
import com.vestshop.enums.Gender;
import com.vestshop.enums.Role;
import com.vestshop.enums.UserStatus;
import com.vestshop.models.UserModel;
import com.vestshop.repository.UserRepository;
import com.vestshop.services.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.modelmapper.ModelMapper;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImp implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public List<UserModel> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }

    @Override
    public UserModel getUserById(Integer userId) {
        return userRepository.findById(userId)
                .map(this::convertToModel)
                .orElse(null);
    }

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

    @Override
    public List<UserModel> getUsersByRole(Role role) {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == role)
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserModel> getUsersByStatus(UserStatus status) {
        return userRepository.findByStatus(status).stream()
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserModel> getUsersByRoleAndStatus(Role role, UserStatus status) {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == role && user.getStatus() == status)
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserModel> filterUsers(String fullname, String email, String phone, Gender gender, UserStatus status, LocalDate birthFrom, LocalDate birthTo) {
        return userRepository.findAll().stream()
                .filter(user -> {
                    // Chỉ lấy USER, không lấy ADMIN
                    if (user.getRole() != Role.USER) {
                        return false;
                    }
                    
                    // Filter theo fullname
                    if (fullname != null && !fullname.trim().isEmpty()) {
                        if (user.getFullname() == null || !user.getFullname().toLowerCase().contains(fullname.toLowerCase().trim())) {
                            return false;
                        }
                    }
                    
                    // Filter theo email
                    if (email != null && !email.trim().isEmpty()) {
                        if (user.getEmail() == null || !user.getEmail().toLowerCase().contains(email.toLowerCase().trim())) {
                            return false;
                        }
                    }
                    
                    // Filter theo phone
                    if (phone != null && !phone.trim().isEmpty()) {
                        if (user.getPhone() == null || !user.getPhone().contains(phone.trim())) {
                            return false;
                        }
                    }
                    
                    // Filter theo gender
                    if (gender != null) {
                        if (user.getGender() != gender) {
                            return false;
                        }
                    }
                    
                    // Filter theo status
                    if (status != null) {
                        if (user.getStatus() != status) {
                            return false;
                        }
                    }
                    
                    // Filter theo birth date range
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

    @Override
    public UserModel updateUserRole(Integer userId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setRole(role);
        User savedUser = userRepository.save(user);
        return convertToModel(savedUser);
    }

    @Override
    public UserModel updateUserStatus(Integer userId, UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setStatus(status);
        User savedUser = userRepository.save(user);
        return convertToModel(savedUser);
    }

    private UserModel convertToModel(User user) {
        return UserModel.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .fullname(user.getFullname())
                .age(null) // Tính từ birth
                .gender(user.getGender())
                .email(user.getEmail())
                .phone(user.getPhone())
                .birth(user.getBirth())
                .address(user.getAddress())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }
}

