package com.vestshop.repository;

import com.vestshop.entity.Product;
import com.vestshop.enums.ProductStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Tìm sản phẩm theo danh mục
    List<Product> findByCategory(String category);
    
    // Tìm sản phẩm theo trạng thái
    List<Product> findByStatus(ProductStatus status);
    
    // Tìm sản phẩm theo tên (tìm kiếm gần đúng)
    List<Product> findByNameContainingIgnoreCase(String name);
    
    // Tìm sản phẩm theo khoảng giá
    List<Product> findByPriceBetween(Long minPrice, Long maxPrice);
    
    // Tìm sản phẩm còn hàng
    List<Product> findByStockGreaterThan(Integer stock);
}

