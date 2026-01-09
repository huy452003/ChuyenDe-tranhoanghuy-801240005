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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

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
    
    @Override
    @Transactional
    public ReviewModel createReview(Long productId, Long userId, ReviewModel reviewModel) {
        // Kiểm tra sản phẩm tồn tại
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
        
        // Chuyển đổi Long userId sang Integer (vì User có userId là Integer)
        Integer userIdInt = userId.intValue();
        
        // Kiểm tra user tồn tại
        User user = userRepository.findById(userIdInt)
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
    
    @Override
    @Transactional(readOnly = true)
    public List<ReviewModel> getProductReviews(Long productId) {
        List<Review> reviews = reviewRepository.findByProductIdAndStatus(productId, ReviewStatus.ACTIVE);
        // Force load relationships
        reviews.forEach(review -> {
            if (review.getUser() != null) {
                review.getUser().getUsername(); // Force load
            }
        });
        return reviews.stream()
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ReviewModel> getAllProductReviews(Long productId) {
        List<Review> reviews = reviewRepository.findByProductId(productId);
        // Force load relationships
        reviews.forEach(review -> {
            if (review.getUser() != null) {
                review.getUser().getUsername(); // Force load
            }
        });
        return reviews.stream()
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public ReviewModel getReviewById(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Đánh giá không tồn tại"));
        // Force load relationships
        if (review.getUser() != null) {
            review.getUser().getUsername(); // Force load
        }
        return convertToModel(review);
    }
    
    @Override
    @Transactional
    public ReviewModel updateReview(Long reviewId, Long userId, ReviewModel reviewModel) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Đánh giá không tồn tại"));
        
        // Chuyển đổi Long userId sang Integer để so sánh
        Integer userIdInt = userId.intValue();
        
        // Kiểm tra user có quyền sửa đánh giá này không
        if (!review.getUser().getUserId().equals(userIdInt)) {
            throw new RuntimeException("Bạn không có quyền sửa đánh giá này");
        }
        
        // Cập nhật thông tin
        review.setRating(reviewModel.getRating());
        review.setComment(reviewModel.getComment());
        
        Review updatedReview = reviewRepository.save(review);
        return convertToModel(updatedReview);
    }
    
    @Override
    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Đánh giá không tồn tại"));
        
        // Chuyển đổi Long userId sang Integer để so sánh
        Integer userIdInt = userId.intValue();
        
        // Kiểm tra user có quyền xóa đánh giá này không
        if (!review.getUser().getUserId().equals(userIdInt)) {
            throw new RuntimeException("Bạn không có quyền xóa đánh giá này");
        }
        
        // Soft delete - đổi status thành DELETED
        review.setStatus(ReviewStatus.DELETED);
        reviewRepository.save(review);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ReviewModel> getAllReviews(Long productId, Long userId, ReviewStatus status) {
        List<Review> reviews;
        
        // Chuyển đổi Long userId sang Integer nếu có
        Integer userIdInt = userId != null ? userId.intValue() : null;
        
        if (productId != null && userId != null && status != null) {
            // Filter by all three
            reviews = reviewRepository.findAll().stream()
                    .filter(r -> r.getProduct().getId().equals(productId))
                    .filter(r -> r.getUser().getUserId().equals(userIdInt))
                    .filter(r -> r.getStatus() == status)
                    .collect(Collectors.toList());
        } else if (productId != null && userId != null) {
            reviews = reviewRepository.findByProductId(productId).stream()
                    .filter(r -> r.getUser().getUserId().equals(userIdInt))
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
        
        // Force load relationships
        reviews.forEach(review -> {
            if (review.getUser() != null) {
                review.getUser().getUsername(); // Force load
            }
            if (review.getProduct() != null) {
                review.getProduct().getName(); // Force load
            }
        });
        
        return reviews.stream()
                .map(this::convertToModel)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public ReviewModel updateReviewStatus(Long reviewId, ReviewStatus status) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Đánh giá không tồn tại"));
        
        review.setStatus(status);
        Review updatedReview = reviewRepository.save(review);
        return convertToModel(updatedReview);
    }
    
    @Override
    @Transactional
    public void deleteReviewByAdmin(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Đánh giá không tồn tại"));
        
        reviewRepository.delete(review);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Double getAverageRating(Long productId) {
        List<Review> reviews = reviewRepository.findByProductIdAndStatus(productId, ReviewStatus.ACTIVE);
        if (reviews.isEmpty()) {
            return 0.0;
        }
        double sum = reviews.stream()
                .mapToInt(Review::getRating)
                .sum();
        return sum / reviews.size();
    }
    
    @Override
    @Transactional(readOnly = true)
    public Long getReviewCount(Long productId) {
        return reviewRepository.countByProductIdAndStatus(productId, ReviewStatus.ACTIVE);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean hasUserReviewed(Long productId, Long userId) {
        return reviewRepository.findByProductIdAndUserId(productId, userId).isPresent();
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean hasUserPurchasedProduct(Long productId, Long userId) {
        // Chuyển đổi Long userId sang Integer
        Integer userIdInt = userId.intValue();
        
        // Lấy user để lấy email
        User user = userRepository.findById(userIdInt)
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
    
    @Override
    @Transactional(readOnly = true)
    public Long getCompletedOrderCount(Long productId) {
        // Lấy tất cả đơn hàng đã thành công
        List<Order> completedOrders = orderRepository.findByStatus(OrderStatus.COMPLETED);
        
        // Force load items để tránh lazy loading exception
        completedOrders.forEach(order -> {
            if (order.getItems() != null) {
                order.getItems().size(); // Force initialization
                // Force load product trong items
                order.getItems().forEach(item -> {
                    if (item.getProduct() != null) {
                        item.getProduct().getId(); // Force load
                    }
                });
            }
        });
        
        // Đếm số lượng đơn hàng chứa sản phẩm này
        long count = completedOrders.stream()
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
    
    // Helper method để convert Entity sang Model
    private ReviewModel convertToModel(Review review) {
        ReviewModel model = modelMapper.map(review, ReviewModel.class);
        
        // Set product info
        if (review.getProduct() != null) {
            model.setProductId(review.getProduct().getId());
            model.setProductName(review.getProduct().getName());
        }
        
        // Set user info
        if (review.getUser() != null) {
            model.setUserId(review.getUser().getUserId().longValue()); // Chuyển Integer sang Long
            model.setUserFullname(review.getUser().getFullname());
            model.setUsername(review.getUser().getUsername());
        }
        
        return model;
    }
}

