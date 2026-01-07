package com.vestshop.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.vestshop.models.OrderModel;
import com.vestshop.models.UserModel;
import com.vestshop.services.OrderService;
import com.vestshop.services.AuthService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
@Validated
public class OrderController {

    @Autowired
    private OrderService orderService;
    
    @Autowired
    private AuthService authService;

    // Tạo đơn hàng mới
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<OrderModel> createOrder(@Valid @RequestBody OrderModel orderModel) {
        try {
            OrderModel createdOrder = orderService.createOrder(orderModel);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Lấy thông tin đơn hàng theo ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<OrderModel> getOrderById(@PathVariable Long id) {
        OrderModel order = orderService.getOrderById(id);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(order);
    }

    // Lấy danh sách đơn hàng của user hiện tại
    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getMyOrders(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Lấy email từ token của user hiện tại
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authorization header is missing or invalid");
            }
            String token = authHeader.substring(7);
            String username;
            try {
                username = authService.getUsernameFromToken(token);
            } catch (Exception e) {
                System.err.println("ERROR extracting username from token: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid token: cannot extract username - " + e.getMessage());
            }
            if (username == null || username.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid token: username is null or empty");
            }
            UserModel currentUser;
            try {
                currentUser = authService.getUserByUsername(username);
            } catch (Exception e) {
                System.err.println("ERROR getting user by username: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not found: " + username + " - " + e.getMessage());
            }
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not found: " + username);
            }
            String userEmail = currentUser.getEmail();
            if (userEmail == null || userEmail.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("User email is missing");
            }
            System.out.println("DEBUG OrderController: Current user email (original): " + userEmail);
            System.out.println("DEBUG OrderController: Current user username: " + username);
            System.out.println("DEBUG OrderController: Current user ID: " + currentUser.getUserId());
            
            List<OrderModel> orders;
            try {
                orders = orderService.getOrdersByEmail(userEmail);
            } catch (Exception e) {
                System.err.println("ERROR in getOrdersByEmail: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving orders: " + e.getMessage());
            }
            System.out.println("DEBUG OrderController: Found " + orders.size() + " orders for email: " + userEmail);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("ERROR in getMyOrders: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error retrieving orders: " + e.getMessage());
        }
    }
    
    // Lấy danh sách đơn hàng theo email (chỉ dùng cho admin)
    @GetMapping("/by-email")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderModel>> getOrdersByEmail(@RequestParam String email) {
        List<OrderModel> orders = orderService.getOrdersByEmail(email);
        return ResponseEntity.ok(orders);
    }
}

