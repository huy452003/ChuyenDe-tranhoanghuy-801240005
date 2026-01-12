package com.vestshop.services.Imp;

import com.vestshop.entity.Order;
import com.vestshop.entity.OrderItem;
import com.vestshop.entity.Product;
import com.vestshop.entity.Review;
import com.vestshop.entity.User;
import com.vestshop.enums.OrderStatus;
import com.vestshop.enums.ReviewStatus;
import com.vestshop.models.ReviewModel;
import com.vestshop.repository.OrderRepository;
import com.vestshop.repository.ProductRepository;
import com.vestshop.repository.ReviewRepository;
import com.vestshop.repository.UserRepository;
import com.vestshop.services.ReviewService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.PageImpl;
import java.util.List;
import java.util.stream.Collectors;
import com.vestshop.models.PageResponseModel;

@Service
public class ReviewServiceImp implements ReviewService {
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ModelMapper modelMapper;
    
    // Tạo đánh giá mới
    @Override
    @Transactional
    public ReviewModel createReview(Integer productId, Integer userId, ReviewModel reviewModel) {
        // Kiểm tra sản phẩm tồn tại
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
        
        // Kiểm tra user tồn tại
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        
        // Kiểm tra user đã đánh giá sản phẩm này chưa
        if (reviewRepository.findByProductIdAndUserId(productId, userId).isPresent()) {
            throw new RuntimeException("Bạn đã đánh giá sản phẩm này rồi");
        }
        
        // Kiểm tra user đã mua sản phẩm và đơn hàng đã thành công chưa
        if (!hasUserPurchasedProduct(productId, userId)) {
            throw new RuntimeException("Bạn chỉ có thể đánh giá sản phẩm sau khi đơn hàng đã thành công");
        }
        
        // Tạo đánh giá mới
        Review review = Review.builder()
                .product(product)
                .user(user)
                .rating(reviewModel.getRating())
                .comment(reviewModel.getComment())
                .status(ReviewStatus.ACTIVE)
                .build();
        
        Review savedReview = reviewRepository.save(review);
        return convertToModel(savedReview);
    }
    
    // Lấy danh sách đánh giá của sản phẩm (chỉ ACTIVE)
    @Override
    @Transactional(readOnly = true)
    public List<ReviewModel> getProductReviews(Integer productId) {
        List<Review> reviews = reviewRepository.findByProductIdAndStatus(productId, ReviewStatus.ACTIVE);
        reviews.forEach(review -> {
            if (review.getUser() != null) {
                review.getUser().getUsername(); 
            }
        });
        return reviews.stream()
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }
    
    // Lấy tất cả đánh giá của sản phẩm (bao gồm cả HIDDEN - cho admin)
    @Override
    @Transactional(readOnly = true)
    public List<ReviewModel> getAllProductReviews(Integer productId) {
        List<Review> reviews = reviewRepository.findByProductId(productId);
        reviews.forEach(review -> {
            if (review.getUser() != null) {
                review.getUser().getUsername(); 
            }
        });
        return reviews.stream()
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }
    
    // Lấy đánh giá theo ID
    @Override
    @Transactional(readOnly = true)
    public ReviewModel getReviewById(Integer reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Đánh giá không tồn tại"));
        if (review.getUser() != null) {
            review.getUser().getUsername(); 
        }
        return convertToModel(review);
    }
    
    // Cập nhật đánh giá (chỉ user sở hữu)
    @Override
    @Transactional
    public ReviewModel updateReview(Integer reviewId, Integer userId, ReviewModel reviewModel) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Đánh giá không tồn tại"));
        
        // Kiểm tra user có quyền sửa đánh giá này không
        if (!review.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền sửa đánh giá này");
        }
        
        // Cập nhật thông tin
        review.setRating(reviewModel.getRating());
        review.setComment(reviewModel.getComment());
        
        Review updatedReview = reviewRepository.save(review);
        return convertToModel(updatedReview);
    }
    
    // Xóa đánh giá (chỉ user sở hữu - soft delete)
    @Override
    @Transactional
    public void deleteReview(Integer reviewId, Integer userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Đánh giá không tồn tại"));
        
        // Kiểm tra user có quyền xóa đánh giá này không
        if (!review.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xóa đánh giá này");
        }
        
        // Soft delete - đổi status thành DELETED
        review.setStatus(ReviewStatus.DELETED);
        reviewRepository.save(review);
    }
    
    // Admin: Lấy tất cả đánh giá (có filter)
    @Override
    @Transactional(readOnly = true)
    public List<ReviewModel> getAllReviews(Integer productId, Integer userId, ReviewStatus status) {
        List<Review> reviews;
        
        if (productId != null && userId != null && status != null) {
            // Lọc theo tất cả ba
            reviews = reviewRepository.findAll().stream()
                    .filter(r -> r.getProduct().getId().equals(productId))
                    .filter(r -> r.getUser().getUserId().equals(userId))
                    .filter(r -> r.getStatus() == status)
                    .collect(Collectors.toList());
        } else if (productId != null && userId != null) {
            reviews = reviewRepository.findByProductId(productId).stream()
                    .filter(r -> r.getUser().getUserId().equals(userId))
                    .collect(Collectors.toList());
        } else if (productId != null && status != null) {
            reviews = reviewRepository.findByProductIdAndStatus(productId, status);
        } else if (userId != null && status != null) {
            reviews = reviewRepository.findByUserId(userId).stream()
                    .filter(r -> r.getStatus() == status)
                    .collect(Collectors.toList());
        } else if (productId != null) {
            reviews = reviewRepository.findByProductId(productId);
        } else if (userId != null) {
            reviews = reviewRepository.findByUserId(userId);
        } else if (status != null) {
            reviews = reviewRepository.findAll().stream()
                    .filter(r -> r.getStatus() == status)
                    .collect(Collectors.toList());
        } else {
            reviews = reviewRepository.findAll();
        }
        
        reviews.forEach(review -> {
            if (review.getUser() != null) {
                review.getUser().getUsername(); 
            }
            if (review.getProduct() != null) {
                review.getProduct().getName(); 
            }
        });
        
        return reviews.stream()
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }
    
    // Admin: Cập nhật trạng thái đánh giá
    @Override
    @Transactional
    public ReviewModel updateReviewStatus(Integer reviewId, ReviewStatus status) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Đánh giá không tồn tại"));
        
        review.setStatus(status);
        Review updatedReview = reviewRepository.save(review);
        return convertToModel(updatedReview);
    }
    
    // Admin: Xóa đánh giá (hard delete)
    @Override
    @Transactional
    public void deleteReviewByAdmin(Integer reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Đánh giá không tồn tại"));
        
        reviewRepository.delete(review);
    }
    
    // Tính rating trung bình của sản phẩm
    @Override
    @Transactional(readOnly = true)
    public Double getAverageRating(Integer productId) {
        List<Review> reviews = reviewRepository.findByProductIdAndStatus(productId, ReviewStatus.ACTIVE);
        if (reviews.isEmpty()) {
            return 0.0;
        }
        double sum = reviews.stream()
                .mapToInt(Review::getRating)
                .sum();
        return sum / reviews.size();
    }
    
    // Đếm số lượng đánh giá của sản phẩm
    @Override
    @Transactional(readOnly = true)
    public Integer getReviewCount(Integer productId) {
        return reviewRepository.countByProductIdAndStatus(productId, ReviewStatus.ACTIVE);
    }
    
    // Kiểm tra user đã đánh giá sản phẩm chưa
    @Override
    @Transactional(readOnly = true)
    public boolean hasUserReviewed(Integer productId, Integer userId) {
        return reviewRepository.findByProductIdAndUserId(productId, userId).isPresent();
    }
    
    // Kiểm tra user đã mua sản phẩm và đơn hàng đã thành công chưa
    @Override
    @Transactional(readOnly = true)
    public boolean hasUserPurchasedProduct(Integer productId, Integer userId) {
        // Lấy user để lấy email
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        
        String userEmail = user.getEmail();
        if (userEmail == null || userEmail.isEmpty()) {
            return false;
        }
        
        // Lấy tất cả đơn hàng của user
        List<Order> userOrders = orderRepository.findByEmail(userEmail.toLowerCase());
        
        // Kiểm tra xem có đơn hàng nào đã thành công và chứa sản phẩm này không
        for (Order order : userOrders) {
            if (order.getStatus() == OrderStatus.COMPLETED) {
                // Kiểm tra xem đơn hàng có chứa sản phẩm này không
                if (order.getItems() != null) {
                    for (OrderItem item : order.getItems()) {
                        if (item.getProduct() != null && item.getProduct().getId().equals(productId)) {
                            return true;
                        }
                    }
                }
            }
        }
        
        return false;
    }
    
    // Đếm số lượng đơn hàng đã thành công của sản phẩm (để hiển thị "lượt mua")
    @Override
    @Transactional(readOnly = true)
    public Integer getCompletedOrderCount(Integer productId) {
        // Lấy tất cả đơn hàng đã thành công
        List<Order> completedOrders = orderRepository.findByStatus(OrderStatus.COMPLETED);
        
        completedOrders.forEach(order -> {
            if (order.getItems() != null) {
                order.getItems().size(); 
                order.getItems().forEach(item -> {
                    if (item.getProduct() != null) {
                        item.getProduct().getId(); 
                    }
                });
            }
        });
        
        // Đếm số lượng đơn hàng chứa sản phẩm này
        Integer count = (int) completedOrders.stream()
                .filter(order -> {
                    if (order.getItems() != null) {
                        return order.getItems().stream()
                                .anyMatch(item -> item.getProduct() != null && 
                                        item.getProduct().getId().equals(productId));
                    }
                    return false;
                })
                .count();
        
        return count;
    }
    
    // Phương thức trợ giúp để chuyển đổi từ Entity sang Model
    private ReviewModel convertToModel(Review review) {
        ReviewModel model = modelMapper.map(review, ReviewModel.class);
        
        // Set product info
        if (review.getProduct() != null) {
            model.setProductId(review.getProduct().getId());
            model.setProductName(review.getProduct().getName());
        }
        
        // Set user info
        if (review.getUser() != null) {
            model.setUserId(review.getUser().getUserId());
            model.setUserFullname(review.getUser().getFullname());
            model.setUsername(review.getUser().getUsername());
        }
        
        return model;
    }
    
    // Admin: Lấy tất cả đánh giá có phân trang (có filter) 
    @Override
    @Transactional(readOnly = true)
    public PageResponseModel<ReviewModel> getAllReviewsPaginated(int page, int size, Integer productId, Integer userId, ReviewStatus status) {
        // Kiểm tra page và size
        if (page < 0) page = 0;
        if (size < 1) size = 10; // Kích thước mặc định là 10
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Review> reviewPage;
        
        // Chuyển đổi userId sang Integer để so sánh
        Integer userIdInt = userId != null ? userId.intValue() : null;
        
        // Áp dụng các bộ lọc - xử lý tất cả các trường hợp
        List<Review> filtered;
        
        if (productId != null && userIdInt != null && status != null) {
            // Lọc theo tất cả ba
            filtered = reviewRepository.findAll().stream()
                .filter(r -> r.getProduct() != null && r.getProduct().getId().equals(productId))
                .filter(r -> r.getUser() != null && r.getUser().getUserId().equals(userIdInt))
                .filter(r -> r.getStatus() == status)
                .collect(Collectors.toList());
        } else if (productId != null && userIdInt != null) {
            // Lọc theo productId và userId
            filtered = reviewRepository.findByProductId(productId).stream()
                .filter(r -> r.getUser() != null && r.getUser().getUserId().equals(userIdInt))
                .collect(Collectors.toList());
        } else if (productId != null && status != null) {
            // Lọc theo productId và status
            filtered = reviewRepository.findByProductIdAndStatus(productId, status);
        } else if (userIdInt != null && status != null) {
            // Lọc theo userId và status
            filtered = reviewRepository.findByUserId(userId).stream()
                .filter(r -> r.getStatus() == status)
                .collect(Collectors.toList());
        } else if (productId != null) {
            // Lọc theo productId chỉ
            filtered = reviewRepository.findByProductId(productId);
        } else if (userIdInt != null) {
            // Lọc theo userId chỉ
            filtered = reviewRepository.findByUserId(userId);
        } else if (status != null) {
            // Lọc theo status chỉ
            filtered = reviewRepository.findAll().stream()
                .filter(r -> r.getStatus() == status)
                .collect(Collectors.toList());
        } else {
            // Không có bộ lọc - sử dụng findAll với phân trang
            reviewPage = reviewRepository.findAll(pageable);
            reviewPage.getContent().forEach(review -> {
                if (review.getUser() != null) {
                    review.getUser().getUsername(); 
                }
                if (review.getProduct() != null) {
                    review.getProduct().getName(); 
                }
            });
            
            // Chuyển đổi sang ReviewModel
            List<ReviewModel> content = reviewPage.getContent().stream()
                .map(this::convertToModel)
                .collect(Collectors.toList());
            
            // Tạo PageResponse
            PageResponseModel<ReviewModel> response = new PageResponseModel<>();
            response.setContent(content);
            response.setPage(reviewPage.getNumber());
            response.setSize(reviewPage.getSize());
            response.setTotalElements(reviewPage.getTotalElements());
            response.setTotalPages(reviewPage.getTotalPages());
            response.setFirst(reviewPage.isFirst());
            response.setLast(reviewPage.isLast());
            
            return response;
        }
        
        // Phân trang thủ công cho kết quả lọc
        int start = page * size;
        int end = Math.min(start + size, filtered.size());
        List<Review> paginated = start < filtered.size() ? filtered.subList(start, end) : List.of();
        reviewPage = new PageImpl<>(paginated, pageable, filtered.size());
        
        reviewPage.getContent().forEach(review -> {
            if (review.getUser() != null) {
                review.getUser().getUsername(); 
            }
            if (review.getProduct() != null) {
                review.getProduct().getName(); 
            }
        });
        
        // Chuyển đổi sang ReviewModel
        List<ReviewModel> content = reviewPage.getContent().stream()
            .map(this::convertToModel)
            .collect(Collectors.toList());
        
        // Tạo PageResponse
        PageResponseModel<ReviewModel> response = new PageResponseModel<>();
        response.setContent(content);
        response.setPage(reviewPage.getNumber());
        response.setSize(reviewPage.getSize());
        response.setTotalElements(reviewPage.getTotalElements());
        response.setTotalPages(reviewPage.getTotalPages());
        response.setFirst(reviewPage.isFirst());
        response.setLast(reviewPage.isLast());
        
        return response;
    }
}

