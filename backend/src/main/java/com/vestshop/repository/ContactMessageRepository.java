package com.vestshop.repository;

import com.vestshop.entity.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Integer> {
    // Lấy tất cả tin nhắn theo thứ tự ngày tạo giảm dần
    List<ContactMessage> findAllByOrderByCreatedAtDesc();
    // Lấy tất cả tin nhắn đã đọc theo thứ tự ngày tạo giảm dần
    List<ContactMessage> findByIsReadOrderByCreatedAtDesc(Boolean isRead);
    // Đếm số lượng tin nhắn chưa đọc
    Integer countByIsReadFalse();
}

