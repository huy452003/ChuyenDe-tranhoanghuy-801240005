package com.vestshop.services.Imp;

import com.vestshop.services.OrderService;
import com.vestshop.models.OrderModel;
import com.vestshop.models.OrderItemModel;
import com.vestshop.entity.Order;
import com.vestshop.entity.OrderItem;
import com.vestshop.entity.Product;
import com.vestshop.enums.OrderStatus;
import com.vestshop.enums.PaymentMethod;
import com.vestshop.enums.ProductStatus;
import com.vestshop.repository.OrderRepository;
import com.vestshop.repository.ProductRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
import com.vestshop.models.PageResponseModel;

@Service
public class OrderServiceImp implements OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private ModelMapper modelMapper;
    
    // Tạo đơn hàng mới
    @Override
    @Transactional
    public OrderModel createOrder(OrderModel orderModel) {
        // Chuẩn hóa email thành lowercase để đảm bảo tính nhất quán
        String normalizedEmail = orderModel.getEmail() != null ? 
            orderModel.getEmail().trim().toLowerCase() : null;
        
        // Chuyển đổi OrderModel sang Order entity
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
        
        // Lưu đơn hàng trước để có ID
        Order savedOrder = orderRepository.save(order);
        
        // Tạo các item trong đơn hàng
        if (orderModel.getItems() != null && !orderModel.getItems().isEmpty()) {
            List<OrderItem> orderItems = orderModel.getItems().stream().map(itemModel -> {
                Product product = productRepository.findById(itemModel.getProductId())
                        .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại: " + itemModel.getProductId()));

                        
                // Kiểm tra tồn kho của sản phẩm
                if (product.getStock() < itemModel.getQuantity()) {
                    throw new RuntimeException("Sản phẩm '" + product.getName() + "' không đủ số lượng. Còn lại: " + product.getStock() + ", Yêu cầu: " + itemModel.getQuantity());
                }
                
                OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .size(itemModel.getSize())
                    .quantity(itemModel.getQuantity())
                    .price(itemModel.getPrice())
                    .build();
                
                // Giảm số lượng tồn kho của sản phẩm
                int newStock = product.getStock() - itemModel.getQuantity();
                product.setStock(newStock);
                
                // Tự động chuyển trạng thái dựa trên số tồn kho của sản phẩm
                if (newStock <= 0) {
                    product.setStatus(ProductStatus.OUT_OF_STOCK);
                }
                
                productRepository.save(product);
                
                return orderItem;
            }).collect(Collectors.toList());
            
            savedOrder.setItems(orderItems);
            Order createdOrder = orderRepository.save(savedOrder);
            return convertToModel(createdOrder);
        }
        
        return null;
    }
    
    // Lấy tất cả đơn hàng
    @Override
    @Transactional(readOnly = true)
    public List<OrderModel> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        orders.forEach(order -> {
            if (order.getItems() != null) {
                order.getItems().size();
            }
        });
        return orders.stream()
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }
    
    // Lấy đơn hàng theo ID
    @Override
    @Transactional(readOnly = true)
    public OrderModel getOrderById(Integer id) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) {
            return null;
        }
        if (order.getItems() != null) {
            order.getItems().size();
        }
        return convertToModel(order);
    }
    
    // Lấy đơn hàng theo email
    @Override
    @Transactional(readOnly = true)
    public List<OrderModel> getOrdersByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return new ArrayList<>();
        }
        String trimmedEmail = email.trim();
        String normalizedEmail = trimmedEmail.toLowerCase();
        
        System.out.println("DEBUG OrderService: Searching orders for email: " + normalizedEmail);
        System.out.println("DEBUG OrderService: Original email: " + trimmedEmail);
        
        // Thử tìm với email chuẩn hóa trước (cho các đơn hàng mới)
        List<Order> orders = orderRepository.findByEmail(normalizedEmail);
        System.out.println("DEBUG OrderService: Found " + orders.size() + " orders with normalized email");
        
        // Nếu không tìm thấy, thử tìm với email gốc (cho các đơn hàng cũ có thể chưa chuẩn hóa)
        if (orders.isEmpty() && !normalizedEmail.equals(trimmedEmail)) {
            orders = orderRepository.findByEmail(trimmedEmail);
            System.out.println("DEBUG OrderService: Found " + orders.size() + " orders with original email");
        }
        
        orders.forEach(order -> {
            if (order.getItems() != null) {
                order.getItems().size();
            }
        });
        
        return orders.stream()
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }
    
    // Lấy đơn hàng theo trạng thái
    @Override
    @Transactional(readOnly = true)
    public List<OrderModel> getOrdersByStatus(OrderStatus status) {
        List<Order> orders = orderRepository.findByStatus(status);
        // Force load items để tránh vấn đề lazy loading
        orders.forEach(order -> {
            if (order.getItems() != null) {
                order.getItems().size();
            }
        });
        return orders.stream()
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }
    
    // Cập nhật trạng thái đơn hàng
    @Override
    @Transactional
    public OrderModel updateOrderStatus(Integer id, OrderStatus status) {
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
                        int newStock = product.getStock() + item.getQuantity();
                        product.setStock(newStock);
                        
                        // Nếu đang hết hàng và có stock mới > 0, chuyển về ACTIVE
                        if (product.getStatus() == ProductStatus.OUT_OF_STOCK && newStock > 0) {
                            product.setStatus(ProductStatus.ACTIVE);
                        }
                        
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
                            throw new RuntimeException("Sản phẩm '" + product.getName() + "' không đủ số lượng. Còn lại: " + product.getStock() + ", Yêu cầu: " + item.getQuantity());
                        }
                        int newStock = product.getStock() - item.getQuantity();
                        product.setStock(newStock);
                        
                        // Tự động chuyển trạng thái dựa trên số tồn kho
                        if (newStock <= 0) {
                            product.setStatus(ProductStatus.OUT_OF_STOCK);
                        }
                        
                        productRepository.save(product);
                    }
                }
            }
        }
        
        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        return convertToModel(updatedOrder);
    }
    
    // Đếm số lượng đơn hàng theo trạng thái
    @Override
    public Integer countOrdersByStatus(OrderStatus status) {
        return orderRepository.countByStatus(status);
    }
    
    // Tính tổng doanh thu
    @Override
    public Integer getTotalRevenue() {
        List<Order> completedOrders = orderRepository.findByStatus(OrderStatus.COMPLETED);
        return completedOrders.stream()
                .mapToInt(Order::getTotalAmount)
                .sum();
    }

    // Lấy doanh thue theo ngày
    @Override
    public Map<String, Integer> getRevenueByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        List<Order> orders = orderRepository.findByCreatedAtBetween(start, end);
        
        // Lọc chỉ lấy đơn hàng đã hoàn thành
        List<Order> completedOrders = orders.stream()
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                .collect(Collectors.toList());
        
        // Nhóm theo ngày và tính tổng doanh thu
        Map<String, Integer> revenueByDate = new HashMap<>();
        
        completedOrders.forEach(order -> {
            LocalDate orderDate = order.getCreatedAt().toLocalDate();
            String dateKey = orderDate.toString(); // Format: YYYY-MM-DD
            
            revenueByDate.put(dateKey, 
                revenueByDate.getOrDefault(dateKey, 0) + order.getTotalAmount()
            );
        });
        
        return revenueByDate;
    }

    // Lọc đơn hàng theo nhiều tiêu chí
    @Override
    @Transactional(readOnly = true)
    public List<OrderModel> filterOrders(String fullName, String email, String phone, OrderStatus status,
                                          PaymentMethod paymentMethod, LocalDate createdAtFrom, LocalDate createdAtTo,
                                          Integer totalAmountFrom, Integer totalAmountTo) {
        List<Order> allOrders = orderRepository.findAll();
        allOrders.forEach(order -> {
            if (order.getItems() != null) {
                order.getItems().size();
            }
        });
        return allOrders.stream()
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

    // Chuyển đổi đơn hàng từ entity sang model
    private OrderModel convertToModel(Order order) {
        OrderModel model = modelMapper.map(order, OrderModel.class);
        
        // Chuyển đổi các item trong đơn hàng
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            List<OrderItemModel> itemModels = order.getItems().stream().map(item -> {
                OrderItemModel itemModel = modelMapper.map(item, OrderItemModel.class);
                // Set productId và productName từ product entity
                if (item.getProduct() != null) {
                    itemModel.setProductId(item.getProduct().getId());
                    itemModel.setProductName(item.getProduct().getName());
                }
                return itemModel;
            }).collect(Collectors.toList());
            
            model.setItems(itemModels);
        }
        
        return model;
    }
    
    // Lấy danh sách đơn hàng có phân trang (cho admin)
    @Override
    @Transactional(readOnly = true)
    public PageResponseModel<OrderModel> getAllOrdersPaginated(int page, int size) {
        // Kiểm tra page và size
        if (page < 0) page = 0;
        if (size < 1) size = 10; // Kích thước mặc định là 10
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orderPage = orderRepository.findAll(pageable);
        
        orderPage.getContent().forEach(order -> {
            if (order.getItems() != null) {
                order.getItems().size();
            }
        });
        
        // Chuyển đổi sang OrderModel
        List<OrderModel> content = orderPage.getContent().stream()
            .map(order -> convertToModel(order))
            .collect(Collectors.toList());
        
        // Tạo PageResponse
        PageResponseModel<OrderModel> response = new PageResponseModel<>();
        response.setContent(content);
        response.setPage(orderPage.getNumber());
        response.setSize(orderPage.getSize());
        response.setTotalElements(orderPage.getTotalElements());
        response.setTotalPages(orderPage.getTotalPages());
        response.setFirst(orderPage.isFirst());
        response.setLast(orderPage.isLast());
        
        return response;
    }
}

