package com.vestshop.controller;

import com.vestshop.models.ProductModel;
import com.vestshop.services.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    @Autowired
    private ProductService productService;

    // Lấy danh sách sản phẩm (public - không cần đăng nhập)
    @GetMapping
    public ResponseEntity<?> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        // Nếu có page hoặc size, trả về paginated response với filter
        if (page != null || size != null) {
            int pageNum = page != null ? page : 0;
            int pageSize = size != null ? size : 8;
            return ResponseEntity.ok(productService.getAllProductsPaginated(pageNum, pageSize, category, minPrice, maxPrice, sortBy));
        }
        // Nếu không có pagination params, trả về list như cũ (backward compatible)
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // Lấy chi tiết sản phẩm theo ID (public - không cần đăng nhập)
    @GetMapping("/{id}")
    public ResponseEntity<ProductModel> getProductById(@PathVariable Integer id) {
        ProductModel product = productService.getProductById(id);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(product);
    }


}

