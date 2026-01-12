package com.vestshop.repository;

import com.vestshop.entity.Order;
import com.vestshop.enums.OrderStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    // Tìm đơn hàng theo email
    List<Order> findByEmail(String email);
    // Tìm đơn hàng theo số điện thoại
    List<Order> findByPhone(String phone);
    // Tìm đơn hàng theo trạng thái
    List<Order> findByStatus(OrderStatus status);
    // Tìm đơn hàng theo khoảng thời gian
    List<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    // Đếm số đơn hàng theo trạng thái
    Integer countByStatus(OrderStatus status);
}

