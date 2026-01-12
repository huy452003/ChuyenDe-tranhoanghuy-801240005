package com.vestshop.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import com.vestshop.entity.User;
import com.vestshop.enums.Role;
import com.vestshop.enums.UserStatus;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer>{
    // Tìm user theo username
    Optional<User> findByUsername(String username);
    // Tìm user theo email
    Optional<User> findByEmail(String email);
    // Tìm user theo phone
    Optional<User> findByPhone(String phone);
    // Tìm user theo userId
    Optional<User> findByUserId(Integer userId);
    // Kiểm tra xem user có tồn tại theo username
    boolean existsByUsername(String username);
    // Kiểm tra xem user có tồn tại theo email
    boolean existsByEmail(String email);
    // Kiểm tra xem user có tồn tại theo phone
    boolean existsByPhone(String phone);
    // Kiểm tra xem user có tồn tại theo username và userId khác
    boolean existsByUsernameAndUserIdNot(String username, Integer userId);
    // Kiểm tra xem user có tồn tại theo email và userId khác
    boolean existsByEmailAndUserIdNot(String email, Integer userId);
    // Kiểm tra xem user có tồn tại theo phone và userId khác
    boolean existsByPhoneAndUserIdNot(String phone, Integer userId);
    // Kiểm tra xem user có tồn tại theo userId
    boolean existsByUserId(Integer userId);
    // Đếm số lượng user theo role
    Integer countByRole(Role role);
    // Tìm các user với status cụ thể
    List<User> findByStatus(UserStatus status);
    
}
