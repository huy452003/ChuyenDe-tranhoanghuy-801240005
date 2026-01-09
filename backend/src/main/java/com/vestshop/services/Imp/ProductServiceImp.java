package com.vestshop.services.Imp;

import com.vestshop.services.ProductService;
import com.vestshop.services.ReviewService;
import com.vestshop.enums.ProductStatus;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.vestshop.models.ProductModel;
import com.vestshop.repository.ProductRepository;
import java.util.stream.Collectors;
import com.vestshop.entity.Product;
import org.modelmapper.ModelMapper;

@Service

public class ProductServiceImp implements ProductService{
    @Autowired
    private ProductRepository productRepo;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private ReviewService reviewService;
    
    @Override
    public List<ProductModel> getAllProducts() {
        List<Product> products = productRepo.findAll();
        return products.stream().map(
            product -> convertToModel(product)
        ).collect(Collectors.toList());
    }

    @Override
    public ProductModel getProductById(Long id) {
        Product product = productRepo.findById(id).orElse(null);
        if (product == null) {
            return null;
        }
        return convertToModel(product);
    }

    @Override
    public ProductModel createProduct(ProductModel product) {
        Product productEntity = modelMapper.map(product, Product.class);
        
        // Tự động chuyển trạng thái dựa trên số tồn kho khi tạo mới
        if (productEntity.getStock() == null || productEntity.getStock() <= 0) {
            productEntity.setStatus(ProductStatus.OUT_OF_STOCK);
        } else if (productEntity.getStatus() == null) {
            productEntity.setStatus(ProductStatus.ACTIVE);
        }
        
        Product createdProduct = productRepo.save(productEntity);
        return convertToModel(createdProduct);
    }

    @Override
    public ProductModel updateProduct(Long id, ProductModel product) {
        Product productEntity = modelMapper.map(product, Product.class);
        productEntity.setId(id); // Set ID để update đúng record
        
        // Tự động chuyển trạng thái dựa trên số tồn kho khi cập nhật
        if (productEntity.getStock() == null || productEntity.getStock() <= 0) {
            productEntity.setStatus(ProductStatus.OUT_OF_STOCK);
        } else if (productEntity.getStatus() == ProductStatus.OUT_OF_STOCK) {
            // Nếu đang hết hàng và có stock mới > 0, chuyển về ACTIVE
            productEntity.setStatus(ProductStatus.ACTIVE);
        }
        
        Product updatedProduct = productRepo.save(productEntity);
        return convertToModel(updatedProduct);
    }

    @Override
    public void deleteProduct(Long id) {
        productRepo.deleteById(id);
    }

    @Override
    public ProductModel updateProductStatus(Long id, ProductStatus status) {
        Product product = productRepo.findById(id).orElse(null);
        if (product == null) {
            return null;
        }
        product.setStatus(status);
        Product updatedProduct = productRepo.save(product);
        return modelMapper.map(updatedProduct, ProductModel.class);
    }

    @Override
    public ProductModel updateProductStock(Long id, Integer stock) {
        Product product = productRepo.findById(id).orElse(null);
        if (product == null) {
            return null;
        }
        product.setStock(stock);
        
        // Tự động chuyển trạng thái dựa trên số tồn kho
        if (stock == null || stock <= 0) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        } else if (product.getStatus() == ProductStatus.OUT_OF_STOCK) {
            // Nếu đang hết hàng và có stock mới > 0, chuyển về ACTIVE
            product.setStatus(ProductStatus.ACTIVE);
        }
        
        Product updatedProduct = productRepo.save(product);
        return convertToModel(updatedProduct);
    }
    
    // Helper method để convert Product entity sang ProductModel với rating
    private ProductModel convertToModel(Product product) {
        ProductModel model = modelMapper.map(product, ProductModel.class);
        
        // Tính rating trung bình, số lượng đánh giá và số lượng đơn hàng đã thành công
        if (product.getId() != null) {
            try {
                Double averageRating = reviewService.getAverageRating(product.getId());
                Long reviewCount = reviewService.getReviewCount(product.getId());
                model.setAverageRating(averageRating != null ? averageRating : 0.0);
                model.setReviewCount(reviewCount != null ? reviewCount : 0L);
                
                // Tính completedOrderCount (có thể chậm nếu có nhiều orders)
                try {
                    Long completedOrderCount = reviewService.getCompletedOrderCount(product.getId());
                    model.setCompletedOrderCount(completedOrderCount != null ? completedOrderCount : 0L);
                } catch (Exception e) {
                    // Nếu có lỗi khi tính completedOrderCount, set 0
                    System.err.println("Error calculating completedOrderCount for product " + product.getId() + ": " + e.getMessage());
                    model.setCompletedOrderCount(0L);
                }
            } catch (Exception e) {
                // Nếu có lỗi, set giá trị mặc định
                System.err.println("Error calculating rating for product " + product.getId() + ": " + e.getMessage());
                e.printStackTrace();
                model.setAverageRating(0.0);
                model.setReviewCount(0L);
                model.setCompletedOrderCount(0L);
            }
        } else {
            // Product chưa có ID (mới tạo), set giá trị mặc định
            model.setAverageRating(0.0);
            model.setReviewCount(0L);
            model.setCompletedOrderCount(0L);
        }
        
        return model;
    }
}
