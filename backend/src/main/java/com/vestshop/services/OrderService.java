package com.vestshop.services;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import com.vestshop.enums.OrderStatus;
import com.vestshop.models.OrderModel;
import com.vestshop.models.PageResponseModel;

public interface OrderService {
    
    // Tạo đơn hàng mới
    OrderModel createOrder(OrderModel orderModel);
    
    // Lấy tất cả đơn hàng
    List<OrderModel> getAllOrders();
    
    // Lấy đơn hàng theo ID
    OrderModel getOrderById(Integer id);
    
    // Lấy đơn hàng theo email
    List<OrderModel> getOrdersByEmail(String email);
    
    // Lấy đơn hàng theo trạng thái
    List<OrderModel> getOrdersByStatus(OrderStatus status);
    
    // Cập nhật trạng thái đơn hàng
    OrderModel updateOrderStatus(Integer id, OrderStatus status);
    
    // Đếm đơn hàng theo trạng thái
    Integer countOrdersByStatus(OrderStatus status);
    
    // Tính tổng doanh thu
    Integer getTotalRevenue();
    
    // Lấy doanh thu theo ngày
    Map<String, Integer> getRevenueByDateRange(LocalDate startDate, LocalDate endDate);
    
    // Lọc đơn hàng theo nhiều tiêu chí
    List<OrderModel> filterOrders(String fullName, String email, String phone, OrderStatus status, 
                                   com.vestshop.enums.PaymentMethod paymentMethod,
                                   LocalDate createdAtFrom, LocalDate createdAtTo,
                                   Integer totalAmountFrom, Integer totalAmountTo);
    
    // Lấy danh sách đơn hàng có phân trang (cho admin)
    PageResponseModel<OrderModel> getAllOrdersPaginated(int page, int size);
}

