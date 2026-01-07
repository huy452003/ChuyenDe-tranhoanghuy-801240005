package com.vestshop.services.Imp;

import com.vestshop.services.OrderService;
import com.vestshop.models.OrderModel;
import com.vestshop.models.OrderItemModel;
import com.vestshop.entity.Order;
import com.vestshop.entity.OrderItem;
import com.vestshop.entity.Product;
import com.vestshop.enums.OrderStatus;
import com.vestshop.enums.PaymentMethod;
import com.vestshop.repository.OrderRepository;
import com.vestshop.repository.ProductRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.modelmapper.ModelMapper;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderServiceImp implements OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private ModelMapper modelMapper;
    
    @Override
    @Transactional
    public OrderModel createOrder(OrderModel orderModel) {
        // Normalize email to lowercase để đảm bảo consistency
        String normalizedEmail = orderModel.getEmail() != null ? 
            orderModel.getEmail().trim().toLowerCase() : null;
        
        // Map OrderModel to Order entity
        Order order = Order.builder()
            .fullName(orderModel.getFullName())
            .email(normalizedEmail)
            .phone(orderModel.getPhone())
            .address(orderModel.getAddress())
            .city(orderModel.getCity())
            .district(orderModel.getDistrict())
            .ward(orderModel.getWard())
            .note(orderModel.getNote())
            .totalAmount(orderModel.getTotalAmount())
            .paymentMethod(orderModel.getPaymentMethod())
            .status(OrderStatus.PENDING)
            .build();
        
        // Lưu order trước để có ID
        Order savedOrder = orderRepository.save(order);
        
        // Tạo order items
        if (orderModel.getItems() != null && !orderModel.getItems().isEmpty()) {
            List<OrderItem> orderItems = orderModel.getItems().stream().map(itemModel -> {
                Product product = productRepository.findById(itemModel.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + itemModel.getProductId()));

                        
                // Kiểm tra tồn kho
                if (product.getStock() < itemModel.getQuantity()) {
                    throw new RuntimeException("Insufficient stock for product: " + product.getName() + 
                            ". Available: " + product.getStock() + ", Requested: " + itemModel.getQuantity());
                }
                
                OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .size(itemModel.getSize())
                    .quantity(itemModel.getQuantity())
                    .price(itemModel.getPrice())
                    .build();
                
                // Giảm số lượng tồn kho
                product.setStock(product.getStock() - itemModel.getQuantity());
                productRepository.save(product);
                
                return orderItem;
            }).collect(Collectors.toList());
            
            savedOrder.setItems(orderItems);
            Order createdOrder = orderRepository.save(savedOrder);
            return convertToModel(createdOrder);
        }
        
        return null;
    }
    
    @Override
    public List<OrderModel> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream()
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }
    
    @Override
    public OrderModel getOrderById(Long id) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) {
            return null;
        }
        return convertToModel(order);
    }
    
    @Override
    public List<OrderModel> getOrdersByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return new ArrayList<>();
        }
        String trimmedEmail = email.trim();
        String normalizedEmail = trimmedEmail.toLowerCase();
        
        System.out.println("DEBUG OrderService: Searching orders for email: " + normalizedEmail);
        System.out.println("DEBUG OrderService: Original email: " + trimmedEmail);
        
        // Thử tìm với email normalize trước (cho các order mới)
        List<Order> orders = orderRepository.findByEmail(normalizedEmail);
        System.out.println("DEBUG OrderService: Found " + orders.size() + " orders with normalized email");
        
        // Nếu không tìm thấy, thử tìm với email gốc (cho các order cũ có thể chưa normalize)
        if (orders.isEmpty() && !normalizedEmail.equals(trimmedEmail)) {
            orders = orderRepository.findByEmail(trimmedEmail);
            System.out.println("DEBUG OrderService: Found " + orders.size() + " orders with original email");
        }
        
        return orders.stream()
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<OrderModel> getOrdersByStatus(OrderStatus status) {
        List<Order> orders = orderRepository.findByStatus(status);
        return orders.stream()
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public OrderModel updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) {
            return null;
        }
        
        OrderStatus oldStatus = order.getStatus();
        
        // Nếu đơn hàng đang ở PENDING hoặc PROCESSING và được hủy (CANCELLED)
        // thì cộng lại tồn kho
        if ((oldStatus == OrderStatus.PENDING || oldStatus == OrderStatus.PROCESSING) 
                && status == OrderStatus.CANCELLED) {
            // Cộng lại tồn kho cho tất cả sản phẩm trong đơn hàng
            if (order.getItems() != null && !order.getItems().isEmpty()) {
                for (OrderItem item : order.getItems()) {
                    Product product = item.getProduct();
                    if (product != null) {
                        product.setStock(product.getStock() + item.getQuantity());
                        productRepository.save(product);
                    }
                }
            }
        }
        
        // Nếu đơn hàng đang ở CANCELLED và được khôi phục về PENDING hoặc PROCESSING
        // thì trừ lại tồn kho
        if (oldStatus == OrderStatus.CANCELLED 
                && (status == OrderStatus.PENDING || status == OrderStatus.PROCESSING)) {
            // Trừ lại tồn kho cho tất cả sản phẩm trong đơn hàng
            if (order.getItems() != null && !order.getItems().isEmpty()) {
                for (OrderItem item : order.getItems()) {
                    Product product = item.getProduct();
                    if (product != null) {
                        // Kiểm tra tồn kho trước khi trừ
                        if (product.getStock() < item.getQuantity()) {
                            throw new RuntimeException("Insufficient stock for product: " + product.getName() + 
                                    ". Available: " + product.getStock() + ", Required: " + item.getQuantity());
                        }
                        product.setStock(product.getStock() - item.getQuantity());
                        productRepository.save(product);
                    }
                }
            }
        }
        
        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        return convertToModel(updatedOrder);
    }
    
    @Override
    public Long countOrdersByStatus(OrderStatus status) {
        return orderRepository.countByStatus(status);
    }
    
    @Override
    public Long getTotalRevenue() {
        List<Order> completedOrders = orderRepository.findByStatus(OrderStatus.COMPLETED);
        return completedOrders.stream()
                .mapToLong(Order::getTotalAmount)
                .sum();
    }
    
    @Override
    public Map<String, Long> getRevenueByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        List<Order> orders = orderRepository.findByCreatedAtBetween(start, end);
        
        // Lọc chỉ lấy đơn hàng đã hoàn thành
        List<Order> completedOrders = orders.stream()
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                .collect(Collectors.toList());
        
        // Nhóm theo ngày và tính tổng doanh thu
        Map<String, Long> revenueByDate = new HashMap<>();
        
        completedOrders.forEach(order -> {
            LocalDate orderDate = order.getCreatedAt().toLocalDate();
            String dateKey = orderDate.toString(); // Format: YYYY-MM-DD
            
            revenueByDate.put(dateKey, 
                revenueByDate.getOrDefault(dateKey, 0L) + order.getTotalAmount()
            );
        });
        
        return revenueByDate;
    }

    @Override
    public List<OrderModel> filterOrders(String fullName, String email, String phone, OrderStatus status,
                                          PaymentMethod paymentMethod, LocalDate createdAtFrom, LocalDate createdAtTo,
                                          Long totalAmountFrom, Long totalAmountTo) {
        return orderRepository.findAll().stream()
                .filter(order -> {
                    // Filter theo fullName
                    if (fullName != null && !fullName.trim().isEmpty()) {
                        if (order.getFullName() == null || !order.getFullName().toLowerCase().contains(fullName.toLowerCase().trim())) {
                            return false;
                        }
                    }
                    
                    // Filter theo email
                    if (email != null && !email.trim().isEmpty()) {
                        if (order.getEmail() == null || !order.getEmail().toLowerCase().contains(email.toLowerCase().trim())) {
                            return false;
                        }
                    }
                    
                    // Filter theo phone
                    if (phone != null && !phone.trim().isEmpty()) {
                        if (order.getPhone() == null || !order.getPhone().contains(phone.trim())) {
                            return false;
                        }
                    }
                    
                    // Filter theo status
                    if (status != null) {
                        if (order.getStatus() != status) {
                            return false;
                        }
                    }
                    
                    // Filter theo paymentMethod
                    if (paymentMethod != null) {
                        if (order.getPaymentMethod() != paymentMethod) {
                            return false;
                        }
                    }
                    
                    // Filter theo createdAt date range
                    if (createdAtFrom != null || createdAtTo != null) {
                        if (order.getCreatedAt() == null) {
                            return false;
                        }
                        LocalDate orderDate = order.getCreatedAt().toLocalDate();
                        if (createdAtFrom != null && orderDate.isBefore(createdAtFrom)) {
                            return false;
                        }
                        if (createdAtTo != null && orderDate.isAfter(createdAtTo)) {
                            return false;
                        }
                    }
                    
                    // Filter theo totalAmount range
                    if (totalAmountFrom != null || totalAmountTo != null) {
                        if (order.getTotalAmount() == null) {
                            return false;
                        }
                        if (totalAmountFrom != null && order.getTotalAmount() < totalAmountFrom) {
                            return false;
                        }
                        if (totalAmountTo != null && order.getTotalAmount() > totalAmountTo) {
                            return false;
                        }
                    }
                    
                    return true;
                })
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }

    // Helper method để convert Entity sang Model
    private OrderModel convertToModel(Order order) {
        OrderModel model = modelMapper.map(order, OrderModel.class);
        
        // Convert order items
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            List<OrderItemModel> itemModels = order.getItems().stream().map(item -> {
                OrderItemModel itemModel = modelMapper.map(item, OrderItemModel.class);
                return itemModel;
            }).collect(Collectors.toList());
            
            model.setItems(itemModels);
        }
        
        return model;
    }
}

