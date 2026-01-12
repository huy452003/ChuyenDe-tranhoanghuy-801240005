package com.vestshop.controller.admin;

import com.vestshop.enums.OrderStatus;
import com.vestshop.enums.PaymentMethod;
import com.vestshop.models.OrderModel;
import com.vestshop.services.OrderService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminOrderController {

    @Autowired
    private OrderService orderService;

    // Lấy danh sách tất cả đơn hàng với filter chi tiết
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<?> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) PaymentMethod paymentMethod,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate createdAtFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate createdAtTo,
            @RequestParam(required = false) Integer totalAmountFrom,
            @RequestParam(required = false) Integer totalAmountTo,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        // Nếu có page hoặc size, trả về paginated response (chưa hỗ trợ filter với pagination)
        if (page != null || size != null) {
            int pageNum = page != null ? page : 0;
            int pageSize = size != null ? size : 10;
            return ResponseEntity.ok(orderService.getAllOrdersPaginated(pageNum, pageSize));
        }
        
        // Nếu không có pagination, dùng logic filter như cũ
        List<OrderModel> orders;
        
        // Nếu có filter chi tiết, dùng filterOrders
        if (fullName != null || email != null || phone != null || paymentMethod != null ||
            createdAtFrom != null || createdAtTo != null || totalAmountFrom != null || totalAmountTo != null) {
            orders = orderService.filterOrders(fullName, email, phone, status, paymentMethod,
                    createdAtFrom, createdAtTo, totalAmountFrom, totalAmountTo);
        } else if (status != null) {
            // Nếu chỉ có status, dùng getOrdersByStatus
            orders = orderService.getOrdersByStatus(status);
        } else {
            // Lấy tất cả
            orders = orderService.getAllOrders();
        }
        
        return ResponseEntity.ok(orders);
    }

    // Cập nhật trạng thái đơn hàng
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderModel> updateOrderStatus(
            @PathVariable Integer id,
            @RequestParam OrderStatus status
    ) {
        OrderModel updatedOrder = orderService.updateOrderStatus(id, status);
        if (updatedOrder == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedOrder);
    }

    // Lấy thống kê đơn hàng
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getOrderStatistics() {
        Map<String, Object> statistics = new HashMap<>();
        
        // Tổng số đơn hàng
        statistics.put("totalOrders", orderService.getAllOrders().size());
        
        // Số đơn hàng theo trạng thái
        statistics.put("pendingOrders", orderService.countOrdersByStatus(OrderStatus.PENDING));
        statistics.put("processingOrders", orderService.countOrdersByStatus(OrderStatus.PROCESSING));
        statistics.put("completedOrders", orderService.countOrdersByStatus(OrderStatus.COMPLETED));
        statistics.put("cancelledOrders", orderService.countOrdersByStatus(OrderStatus.CANCELLED));
        
        // Tổng doanh thu
        statistics.put("totalRevenue", orderService.getTotalRevenue());
        
        return ResponseEntity.ok(statistics);
    }
    
    // Lấy doanh thu theo ngày
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/revenue/by-date")
    public ResponseEntity<Map<String, Integer>> getRevenueByDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        Map<String, Integer> revenue = orderService.getRevenueByDateRange(startDate, endDate);
        return ResponseEntity.ok(revenue);
    }
}

